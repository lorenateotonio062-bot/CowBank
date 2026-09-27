// Camada de dados do CowBank em Firebase (Authentication + Cloud Firestore).
//
// As funções exportadas mantêm os mesmos nomes e o mesmo formato de retorno
// da versão antiga em SQLite (ex.: `data_nascimento`, `foto_uri`, `grupo_id`),
// por isso a maior parte das telas continua funcionando sem mudança.
//
// Estrutura no Firestore (cada usuário só enxerga os próprios dados —
// veja firestore.rules):
//
//   usuarios/{uid}                 -> perfil (nome, email, telefone, tema, idioma...)
//   usuarios/{uid}/grupos/{id}     -> grupos (nome, descricao, totalBovinos)
//   usuarios/{uid}/bovinos/{id}    -> bovinos (nome, tipo, descricao, codigo, grupoId)
//
// Senhas NÃO ficam no Firestore: quem guarda e protege é o Firebase Auth.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref as refStorage, uploadBytes } from 'firebase/storage';
import QRCode from 'qrcode';

import { auth, db, firebaseConfigurado, storage } from '../firebase/config';

// ---------------- Utilitários internos ----------------

const MENSAGENS_ERRO = {
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-password': 'Digite a senha.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Não encontramos nenhuma conta com esse e-mail.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/operation-not-allowed':
    'O login por e-mail/senha não está ativado no Firebase (Authentication > Método de login).',
  'auth/invalid-api-key': 'Configuração do Firebase inválida (veja src/firebase/config.js).',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Configuração do Firebase inválida (veja src/firebase/config.js).',
  'app/nao-logado': 'Você precisa entrar na sua conta para fazer isso.',
  'app/firebase-nao-configurado':
    'O Firebase ainda não foi configurado. Preencha src/firebase/config.js.',
  'permission-denied':
    'Sem permissão para acessar os dados. Confira se as regras do Firestore foram publicadas.',
  unavailable: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
  'not-found': 'Esse item não existe mais.',
};

// Converte qualquer erro do Firebase numa mensagem em português que as telas
// podem mostrar direto (`e.message`). O erro original vai para o console.
function erroAmigavel(e) {
  if (e?.amigavel) return e;
  console.warn('[CowBank] erro:', e?.code, e?.message);
  const erro = new Error(MENSAGENS_ERRO[e?.code] ?? 'Algo deu errado. Tente novamente.');
  erro.code = e?.code;
  erro.amigavel = true;
  return erro;
}

async function comErro(fn) {
  try {
    return await fn();
  } catch (e) {
    throw erroAmigavel(e);
  }
}

function uidAtual() {
  const usuario = auth.currentUser;
  if (!usuario) {
    const erro = new Error('não logado');
    erro.code = 'app/nao-logado';
    throw erro;
  }
  return usuario.uid;
}

const refPerfil = (uid) => doc(db, 'usuarios', uid);
const colGrupos = (uid) => collection(db, 'usuarios', uid, 'grupos');
const colBovinos = (uid) => collection(db, 'usuarios', uid, 'bovinos');
const refGrupo = (uid, grupoId) => doc(db, 'usuarios', uid, 'grupos', String(grupoId));
const refBovino = (uid, bovinoId) => doc(db, 'usuarios', uid, 'bovinos', String(bovinoId));

// Mais recentes primeiro. Ordenamos aqui no app (e não com orderBy no
// Firestore) para não precisar criar índices compostos no console.
// Documento recém-criado ainda pode estar sem data do servidor: vale como o mais novo.
function criadoEmMs(docSnap) {
  const ts = docSnap.data().criadoEm;
  return ts?.toMillis ? ts.toMillis() : Number.MAX_SAFE_INTEGER;
}
function maisRecentesPrimeiro(docs) {
  return [...docs].sort((a, b) => criadoEmMs(b) - criadoEmMs(a));
}

function ehUriRemota(uri) {
  return /^https?:\/\//i.test(String(uri ?? ''));
}

async function uriParaBlob(uri) {
  const resposta = await fetch(uri);
  if (!resposta.ok) {
    throw new Error('Não foi possível ler a foto selecionada.');
  }
  return resposta.blob();
}

async function enviarFotoBovino(uid, bovinoId, fotoUri) {
  if (!fotoUri || ehUriRemota(fotoUri)) return fotoUri ?? null;

  const blob = await uriParaBlob(fotoUri);
  const caminho = `usuarios/${uid}/bovinos/${bovinoId}/foto.jpg`;
  const arquivoRef = refStorage(storage, caminho);
  await uploadBytes(arquivoRef, blob, {
    contentType: blob.type || 'image/jpeg',
  });
  return getDownloadURL(arquivoRef);
}

async function enviarImagemQrBovino(uid, bovinoId, payload) {
  const svg = await QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
  });
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const caminho = `usuarios/${uid}/bovinos/${bovinoId}/qrcode.svg`;
  const arquivoRef = refStorage(storage, caminho);
  await uploadBytes(arquivoRef, blob, { contentType: 'image/svg+xml' });
  return getDownloadURL(arquivoRef);
}

// Perfil em memória: evita ler o Firestore toda vez que uma tela pede o usuário.
let cachePerfil = null; // { uid, dados }

function atualizarCachePerfil(uid, parcial) {
  if (cachePerfil?.uid === uid) {
    cachePerfil = { uid, dados: { ...cachePerfil.dados, ...parcial } };
  }
}

// ---------------- Inicialização ----------------

// Chamada uma vez ao abrir o app. Espera o Firebase restaurar a sessão salva
// (para sabermos se a pessoa já estava logada) antes de mostrar as telas.
export async function iniciarBanco() {
  if (!firebaseConfigurado()) {
    const erro = new Error('Firebase não configurado. Preencha src/firebase/config.js.');
    erro.code = 'app/firebase-nao-configurado';
    throw erro;
  }
  await auth.authStateReady();
}

export function haUsuarioLogado() {
  return !!auth.currentUser;
}

// ---------------- Usuário ----------------

export async function criarConta({ nome, email, senha, dataNascimento }) {
  const emailLimpo = email.trim();
  let usuario;
  try {
    const credencial = await createUserWithEmailAndPassword(auth, emailLimpo, senha);
    usuario = credencial.user;
  } catch (e) {
    throw erroAmigavel(e);
  }

  try {
    await setDoc(refPerfil(usuario.uid), {
      nome,
      email: emailLimpo,
      telefone: '',
      data_nascimento: dataNascimento ?? '',
      foto_uri: null,
      tema: 'claro',
      idioma: 'pt',
      criadoEm: serverTimestamp(),
    });
  } catch (e) {
    // Não deixa uma conta "sem perfil" pendurada no Firebase Auth.
    try {
      await deleteUser(usuario);
    } catch (e2) {
      // se nem isso der certo, o próximo login recria o perfil vazio
    }
    throw erroAmigavel(e);
  }

  cachePerfil = null;
  return usuario.uid;
}

// Atenção: o login agora é por E-MAIL + senha (o Firebase Auth exige e-mail).
export async function login(email, senha) {
  try {
    await signInWithEmailAndPassword(auth, email.trim(), senha);
  } catch (e) {
    throw erroAmigavel(e);
  }
  cachePerfil = null;
  return getUsuario();
}

export async function sair() {
  await comErro(() => signOut(auth));
  cachePerfil = null;
}

export async function getUsuario() {
  const atual = auth.currentUser;
  if (!atual) return null;
  if (cachePerfil?.uid === atual.uid) return { ...cachePerfil.dados };

  return comErro(async () => {
    const snap = await getDoc(refPerfil(atual.uid));
    const d = snap.exists() ? snap.data() : {};
    const dados = {
      id: atual.uid,
      nome: d.nome ?? atual.displayName ?? '',
      email: atual.email ?? d.email ?? '',
      telefone: d.telefone ?? '',
      data_nascimento: d.data_nascimento ?? '',
      foto_uri: d.foto_uri ?? null,
      tema: d.tema ?? 'claro',
      idioma: d.idioma ?? 'pt',
    };
    cachePerfil = { uid: atual.uid, dados };
    return { ...dados };
  });
}

// O e-mail NÃO é atualizado aqui: ele é a identidade do login no Firebase Auth
// (trocar exige reautenticação + confirmação por e-mail). Por isso o campo de
// e-mail do Perfil é somente leitura.
export async function atualizarUsuario(_id, dados) {
  return comErro(async () => {
    const uid = uidAtual();
    const campos = {
      nome: dados.nome,
      telefone: dados.telefone ?? '',
      data_nascimento: dados.dataNascimento ?? '',
      foto_uri: dados.fotoUri ?? null,
    };
    await setDoc(refPerfil(uid), campos, { merge: true });
    atualizarCachePerfil(uid, campos);
  });
}

// ---------------- Preferências (tema / idioma) ----------------

export async function salvarTema(tema) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const valor = tema === 'escuro' ? 'escuro' : 'claro';
  await comErro(() => setDoc(refPerfil(uid), { tema: valor }, { merge: true }));
  atualizarCachePerfil(uid, { tema: valor });
}

export async function salvarIdioma(idioma) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const valor = ['pt', 'es', 'en'].includes(idioma) ? idioma : 'pt';
  await comErro(() => setDoc(refPerfil(uid), { idioma: valor }, { merge: true }));
  atualizarCachePerfil(uid, { idioma: valor });
}

// ---------------- Redefinição de senha ----------------
// Agora é de verdade: o Firebase envia um e-mail com um link para a pessoa
// escolher a nova senha. Por segurança, o Firebase pode não revelar se o
// e-mail existe ou não — por isso a tela deve dizer "se existir uma conta...".

export async function solicitarRedefinicaoSenha(email) {
  await comErro(() => sendPasswordResetEmail(auth, email.trim()));
  return true;
}

// ---------------- Grupos ----------------

function mapGrupo(docSnap) {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    nome: d.nome ?? '',
    descricao: d.descricao ?? '',
    totalBovinos: d.totalBovinos ?? 0,
  };
}

export async function listarGrupos() {
  return comErro(async () => {
    const snap = await getDocs(colGrupos(uidAtual()));
    return maisRecentesPrimeiro(snap.docs).map(mapGrupo);
  });
}

export async function getGrupo(id) {
  return comErro(async () => {
    const snap = await getDoc(refGrupo(uidAtual(), id));
    return snap.exists() ? mapGrupo(snap) : null;
  });
}

export async function criarGrupo({ nome, descricao }) {
  return comErro(async () => {
    const ref = await addDoc(colGrupos(uidAtual()), {
      nome,
      descricao: descricao ?? '',
      totalBovinos: 0,
      criadoEm: serverTimestamp(),
    });
    return ref.id;
  });
}

export async function atualizarGrupo(id, { nome, descricao }) {
  return comErro(async () => {
    await updateDoc(refGrupo(uidAtual(), id), { nome, descricao: descricao ?? '' });
  });
}

// Apagar um grupo apaga também os bovinos dele (o Firestore não faz cascata
// sozinho). O grupo é removido por último: se algo falhar no meio, ele continua
// na lista e dá para tentar de novo.
export async function deletarGrupo(id) {
  return comErro(async () => {
    const uid = uidAtual();
    const bovinos = await getDocs(query(colBovinos(uid), where('grupoId', '==', String(id))));
    const TAMANHO_LOTE = 400; // o Firestore aceita até 500 operações por lote
    for (let i = 0; i < bovinos.docs.length; i += TAMANHO_LOTE) {
      const lote = writeBatch(db);
      bovinos.docs.slice(i, i + TAMANHO_LOTE).forEach((d) => lote.delete(d.ref));
      await lote.commit();
    }
    await deleteDoc(refGrupo(uid, id));
  });
}

// ---------------- Bovinos ----------------

function mapBovino(docSnap) {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    nome: d.nome ?? '',
    tipo: d.tipo ?? 'Vaca',
    descricao: d.descricao ?? '',
    codigo: d.codigo ?? '',
    grupo_id: d.grupoId ?? null,
    foto_uri: d.foto_url ?? d.foto_uri ?? d.fotoUri ?? null,
    foto_url: d.foto_url ?? null,
    qrPayload: d.qrPayload ?? `cowbank://animal/${encodeURIComponent(docSnap.id)}`,
    qrImagemUrl: d.qrImagemUrl ?? null,
    pesoKg: d.pesoKg ?? '',
    alturaCm: d.alturaCm ?? '',
    alimentacao: d.alimentacao ?? '',
    ultimaAlimentacao: d.ultimaAlimentacao ?? '',
    intervaloAlimentacaoHoras: d.intervaloAlimentacaoHoras ?? '',
    vacinas: d.vacinas ?? '',
    observacoesSanitarias: d.observacoesSanitarias ?? '',
  };
}

export async function listarBovinos(grupoId, tipo) {
  return comErro(async () => {
    const filtros = [where('grupoId', '==', String(grupoId))];
    if (tipo && tipo !== 'Todos') filtros.push(where('tipo', '==', tipo));
    const snap = await getDocs(query(colBovinos(uidAtual()), ...filtros));
    return maisRecentesPrimeiro(snap.docs).map(mapBovino);
  });
}

// Usa o contador guardado no próprio grupo (barato: 1 leitura) — só serve
// para sugerir o próximo código; a unicidade é garantida por codigoJaExiste.
export async function contarBovinos(grupoId) {
  return comErro(async () => {
    const snap = await getDoc(refGrupo(uidAtual(), grupoId));
    return snap.exists() ? snap.data().totalBovinos ?? 0 : 0;
  });
}

// Os códigos (ID/numeração do brinco) precisam ser únicos em todo o
// rebanho da pessoa, não só dentro de um grupo — por isso a checagem é global.
export async function codigoJaExiste(codigo, ignorarBovinoId) {
  if (!codigo) return false;
  return comErro(async () => {
    const snap = await getDocs(
      query(colBovinos(uidAtual()), where('codigo', '==', codigo), limit(2))
    );
    return snap.docs.some((d) => d.id !== String(ignorarBovinoId ?? ''));
  });
}

export async function criarBovino({
  nome,
  tipo,
  descricao,
  codigo,
  grupoId,
  pesoKg,
  alturaCm,
  alimentacao,
  ultimaAlimentacao,
  intervaloAlimentacaoHoras,
  vacinas,
  observacoesSanitarias,
  fotoUri,
}) {
  return comErro(async () => {
    const uid = uidAtual();
    const novoRef = doc(colBovinos(uid)); // gera o id sem gravar nada ainda
    const qrPayload = `cowbank://animal/${encodeURIComponent(novoRef.id)}`;
    const fotoUrl = await enviarFotoBovino(uid, novoRef.id, fotoUri);
    const qrImagemUrl = await enviarImagemQrBovino(uid, novoRef.id, qrPayload);
    // Lote = tudo ou nada: cria o bovino E atualiza o contador do grupo juntos.
    const lote = writeBatch(db);
    lote.set(novoRef, {
      nome,
      tipo,
      descricao: descricao ?? '',
      codigo: codigo ?? '',
      grupoId: String(grupoId),
      foto_uri: fotoUrl,
      foto_url: fotoUrl,
      qrPayload,
      qrImagemUrl,
      pesoKg: pesoKg ?? '',
      alturaCm: alturaCm ?? '',
      alimentacao: alimentacao ?? '',
      ultimaAlimentacao: ultimaAlimentacao ?? '',
      intervaloAlimentacaoHoras: intervaloAlimentacaoHoras ?? '',
      vacinas: vacinas ?? '',
      observacoesSanitarias: observacoesSanitarias ?? '',
      criadoEm: serverTimestamp(),
    });
    lote.update(refGrupo(uid, grupoId), { totalBovinos: increment(1) });
    await lote.commit();
    return novoRef.id;
  });
}

export async function atualizarBovino(
  id,
  {
    nome,
    tipo,
    descricao,
    codigo,
    grupoId,
    pesoKg,
    alturaCm,
    alimentacao,
    ultimaAlimentacao,
    intervaloAlimentacaoHoras,
    vacinas,
    observacoesSanitarias,
    fotoUri,
  }
) {
  return comErro(async () => {
    const uid = uidAtual();
    const ref = refBovino(uid, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const erro = new Error('Esse bovino não existe mais.');
      erro.code = 'not-found';
      throw erro;
    }

    const grupoAnterior = String(snap.data().grupoId ?? '');
    const novoGrupo = String(grupoId);
    const fotoUrl = await enviarFotoBovino(uid, id, fotoUri);
    const qrPayload = snap.data().qrPayload ?? `cowbank://animal/${encodeURIComponent(id)}`;
    const qrImagemUrl = snap.data().qrImagemUrl ?? (await enviarImagemQrBovino(uid, id, qrPayload));
    const lote = writeBatch(db);

    lote.update(ref, {
      nome,
      tipo,
      descricao: descricao ?? '',
      codigo: codigo ?? '',
      grupoId: novoGrupo,
      foto_uri: fotoUrl,
      foto_url: fotoUrl,
      qrPayload,
      qrImagemUrl,
      pesoKg: pesoKg ?? '',
      alturaCm: alturaCm ?? '',
      alimentacao: alimentacao ?? '',
      ultimaAlimentacao: ultimaAlimentacao ?? '',
      intervaloAlimentacaoHoras: intervaloAlimentacaoHoras ?? '',
      vacinas: vacinas ?? '',
      observacoesSanitarias: observacoesSanitarias ?? '',
    });

    if (grupoAnterior && grupoAnterior !== novoGrupo) {
      lote.update(refGrupo(uid, grupoAnterior), { totalBovinos: increment(-1) });
      lote.update(refGrupo(uid, novoGrupo), { totalBovinos: increment(1) });
    }

    await lote.commit();
  });
}

export async function deletarBovino(id) {
  return comErro(async () => {
    const uid = uidAtual();
    const ref = refBovino(uid, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const grupoRef = refGrupo(uid, snap.data().grupoId);
    const grupoSnap = await getDoc(grupoRef);
    const lote = writeBatch(db);
    lote.delete(ref);
    if (grupoSnap.exists()) lote.update(grupoRef, { totalBovinos: increment(-1) });
    await lote.commit();
  });
}

export async function getBovino(id) {
  return comErro(async () => {
    const snap = await getDoc(refBovino(uidAtual(), id));
    return snap.exists() ? mapBovino(snap) : null;
  });
}
