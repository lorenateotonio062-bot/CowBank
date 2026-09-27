// Teste automático do banco de dados do CowBank (Firebase Auth + Firestore).
//
// Roda um roteiro completo contra o Firebase REAL configurado em
// src/firebase/config.js, usando as mesmas funções que as telas usam
// (src/db/database.js). No fim, apaga tudo o que criou.
//
// Como o teste cria uma conta de verdade, o e-mail usado é sempre
// "teste.<número>@example.com" (example.com é um domínio reservado: nunca
// existe de verdade, então nenhum e-mail é enviado a ninguém).
//
// Quem usa: src/screens/TesteBancoScreen.js (botão "Rodar testes").

import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

import { auth, db, firebaseConfigurado } from '../firebase/config';
import * as banco from './database';

const TEMPO_LIMITE_PADRAO_MS = 20000;

// ---------------- Utilitários ----------------

function falhar(mensagem, codigo = 'teste/falhou') {
  const erro = new Error(mensagem);
  erro.code = codigo;
  return erro;
}

function esperar(condicao, mensagem) {
  if (!condicao) throw falhar(mensagem);
}

function igual(obtido, esperado, oQue) {
  esperar(obtido === esperado, `${oQue}: esperado "${esperado}", mas veio "${obtido}".`);
}

// O Firestore não dá erro quando está sem internet: ele guarda a operação numa
// fila e a promessa fica pendente para sempre. Por isso todo passo tem um
// tempo limite — assim o teste termina e explica, em vez de ficar travado.
function comTempoLimite(promessa, ms, titulo) {
  let temporizador;
  const limite = new Promise((_, rejeitar) => {
    temporizador = setTimeout(
      () =>
        rejeitar(
          falhar(
            `Sem resposta do Firebase em ${Math.round(ms / 1000)}s ("${titulo}").`,
            'teste/tempo-esgotado'
          )
        ),
      ms
    );
  });
  return Promise.race([promessa, limite]).finally(() => clearTimeout(temporizador));
}

// Espera que o Firestore RECUSE a operação (é o que as regras de segurança
// devem fazer). Se a operação for aceita, as regras não estão valendo.
async function esperarPermissaoNegada(acao, oQueFoi) {
  try {
    await acao();
  } catch (e) {
    if (e?.code === 'permission-denied') return;
    throw e; // outro erro (ex.: sem internet) não prova nada sobre as regras
  }
  throw falhar(
    `${oQueFoi} foi PERMITIDO, mas deveria ser bloqueado: as regras de segurança do Firestore não estão ativas.`,
    'teste/regras-abertas'
  );
}

// Traduz o erro numa orientação prática: o que conferir no Firebase Console.
function dicaPara(e) {
  const codigo = e?.code || '';
  switch (codigo) {
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'Ative o login por e-mail/senha: Firebase Console > Authentication > Método de login > E-mail/senha > Ativar.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'A chave do Firebase está errada. Confira o firebaseConfig em src/firebase/config.js.';
    case 'auth/network-request-failed':
    case 'unavailable':
      return 'Sem conexão com o Firebase. Verifique a internet do aparelho/computador e tente de novo.';
    case 'auth/too-many-requests':
      return 'O Firebase bloqueou temporariamente por excesso de tentativas. Aguarde alguns minutos e rode de novo.';
    case 'permission-denied':
      return 'O Firestore recusou a operação. Provavelmente as regras não foram publicadas: rode "npm run firebase:regras" (ou cole o conteúdo de firestore.rules em Firebase Console > Firestore Database > Regras > Publicar).';
    case 'not-found':
    case 'failed-precondition':
      return 'O banco Firestore ainda não existe neste projeto. Firebase Console > Firestore Database > Criar banco de dados (região southamerica-east1).';
    case 'teste/tempo-esgotado':
      return 'O Firestore não respondeu a tempo. Ou o aparelho está sem internet, ou o banco não foi criado (Firebase Console > Firestore Database > Criar banco de dados).';
    case 'teste/regras-abertas':
      return 'Publique as regras: rode "npm run firebase:regras" (ou cole firestore.rules no console: Firestore Database > Regras > Publicar). Se o console mostra "modo de teste", elas não são as do projeto.';
    default:
      return null;
  }
}

const codigoUnico = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ---------------- Roteiro de testes ----------------
// Cada passo: { id, titulo, executar(), requer?, critico?, sempre?, dicaExtra? }
//   critico  -> se falhar, os demais passos são ignorados (não há o que testar)
//   requer   -> só roda se esses passos deram certo
//   sempre   -> roda mesmo depois de uma falha crítica (é a limpeza)

function montarPassos(ctx) {
  const refPerfil = () => doc(db, 'usuarios', ctx.uid);

  return [
    {
      id: 'config',
      titulo: 'Configuração do Firebase preenchida',
      critico: true,
      executar: async () => {
        esperar(
          firebaseConfigurado(),
          'O firebaseConfig ainda tem valores "COLE_AQUI". Preencha src/firebase/config.js.'
        );
        return `Projeto: ${auth.app?.options?.projectId ?? '?'}`;
      },
    },
    {
      id: 'conta',
      titulo: 'Criar conta (Authentication + perfil no Firestore)',
      critico: true,
      requer: ['config'],
      executar: async () => {
        if (auth.currentUser) await banco.sair(); // o teste usa uma conta própria
        ctx.email = `teste.${codigoUnico()}@example.com`;
        ctx.senha = `Teste-${codigoUnico()}`;
        ctx.uid = await banco.criarConta({
          nome: 'Teste CowBank',
          email: ctx.email,
          senha: ctx.senha,
          dataNascimento: '01/01/2000',
        });
        igual(auth.currentUser?.uid, ctx.uid, 'Usuário logado após criar a conta');
        return `Conta ${ctx.email}`;
      },
    },
    {
      id: 'perfil',
      titulo: 'Ler o perfil salvo na nuvem',
      requer: ['conta'],
      executar: async () => {
        const u = await banco.getUsuario();
        igual(u?.nome, 'Teste CowBank', 'Nome no perfil');
        igual(u?.email, ctx.email, 'E-mail no perfil');
        const snap = await getDoc(refPerfil());
        esperar(snap.exists(), 'O perfil não existe no Firestore (documento usuarios/{uid}).');
        igual(snap.data().nome, 'Teste CowBank', 'Nome gravado no Firestore');
        igual(snap.data().tema, 'claro', 'Tema inicial');
        igual(snap.data().idioma, 'pt', 'Idioma inicial');
      },
    },
    {
      id: 'atualizar-perfil',
      titulo: 'Editar o perfil (nome, telefone, nascimento)',
      requer: ['conta'],
      executar: async () => {
        await banco.atualizarUsuario(ctx.uid, {
          nome: 'Teste Atualizado',
          telefone: '16999990000',
          dataNascimento: '02/02/2001',
          fotoUri: null,
        });
        const d = (await getDoc(refPerfil())).data();
        igual(d.nome, 'Teste Atualizado', 'Nome gravado');
        igual(d.telefone, '16999990000', 'Telefone gravado');
        igual(d.data_nascimento, '02/02/2001', 'Data de nascimento gravada');
        const u = await banco.getUsuario();
        igual(u.nome, 'Teste Atualizado', 'Nome lido pelo app após editar');
      },
    },
    {
      id: 'preferencias',
      titulo: 'Salvar tema e idioma',
      requer: ['conta'],
      executar: async () => {
        await banco.salvarTema('escuro');
        await banco.salvarIdioma('en');
        const d = (await getDoc(refPerfil())).data();
        igual(d.tema, 'escuro', 'Tema gravado');
        igual(d.idioma, 'en', 'Idioma gravado');
      },
    },
    {
      id: 'seguranca-leitura',
      titulo: 'Segurança: não dá para ler dados de outra pessoa',
      requer: ['conta'],
      executar: async () => {
        const outroUid = `outra-pessoa-${codigoUnico()}`;
        await esperarPermissaoNegada(
          () => getDoc(doc(db, 'usuarios', outroUid)),
          'Ler o perfil de outro usuário'
        );
        await esperarPermissaoNegada(
          () => getDocs(collection(db, 'usuarios', outroUid, 'grupos')),
          'Listar os grupos de outro usuário'
        );
        return 'Bloqueado, como esperado';
      },
    },
    {
      id: 'seguranca-escrita',
      titulo: 'Segurança: não dá para gravar fora da própria área',
      requer: ['conta'],
      executar: async () => {
        const refIntruso = doc(db, 'teste_bloqueado', codigoUnico());
        try {
          await esperarPermissaoNegada(
            () => setDoc(refIntruso, { x: 1 }),
            'Gravar em uma coleção fora de usuarios/{uid}'
          );
        } catch (e) {
          if (e.code === 'teste/regras-abertas') {
            try {
              await deleteDoc(refIntruso); // não deixa lixo se as regras estiverem abertas
            } catch (e2) {
              // sem problema: o principal é avisar que as regras estão abertas
            }
          }
          throw e;
        }
        return 'Bloqueado, como esperado';
      },
    },
    {
      id: 'grupo',
      titulo: 'Criar um grupo',
      requer: ['conta'],
      executar: async () => {
        ctx.grupoId = await banco.criarGrupo({ nome: 'Grupo de teste', descricao: 'criado pelo teste' });
        const g = await banco.getGrupo(ctx.grupoId);
        esperar(g, 'O grupo criado não foi encontrado ao ler de volta.');
        igual(g.nome, 'Grupo de teste', 'Nome do grupo');
        igual(g.totalBovinos, 0, 'Total de bovinos do grupo novo');
        const lista = await banco.listarGrupos();
        esperar(
          lista.some((x) => x.id === ctx.grupoId),
          'O grupo criado não aparece em listarGrupos().'
        );
      },
    },
    {
      id: 'editar-grupo',
      titulo: 'Editar o grupo',
      requer: ['grupo'],
      executar: async () => {
        await banco.atualizarGrupo(ctx.grupoId, { nome: 'Grupo editado', descricao: 'editado pelo teste' });
        const g = await banco.getGrupo(ctx.grupoId);
        igual(g.nome, 'Grupo editado', 'Nome do grupo após editar');
        igual(g.descricao, 'editado pelo teste', 'Descrição do grupo após editar');
      },
    },
    {
      id: 'bovinos',
      titulo: 'Registrar 2 bovinos e atualizar o contador do grupo',
      requer: ['grupo'],
      executar: async () => {
        ctx.codigo1 = `TESTE-${codigoUnico()}-1`;
        ctx.codigo2 = `TESTE-${codigoUnico()}-2`;
        ctx.bovino1 = await banco.criarBovino({
          nome: 'Mimosa',
          tipo: 'Vaca',
          descricao: 'vaca de teste',
          codigo: ctx.codigo1,
          grupoId: ctx.grupoId,
        });
        ctx.bovino2 = await banco.criarBovino({
          nome: 'Estrela',
          tipo: 'Bezerro',
          descricao: '',
          codigo: ctx.codigo2,
          grupoId: ctx.grupoId,
        });
        igual(await banco.contarBovinos(ctx.grupoId), 2, 'Contador de bovinos do grupo');
        const g = await banco.getGrupo(ctx.grupoId);
        igual(g.totalBovinos, 2, 'totalBovinos guardado no grupo');
      },
    },
    {
      id: 'listar-bovinos',
      titulo: 'Listar e filtrar bovinos por tipo',
      requer: ['bovinos'],
      executar: async () => {
        const todos = await banco.listarBovinos(ctx.grupoId, 'Todos');
        igual(todos.length, 2, 'Quantidade de bovinos no grupo');
        const vacas = await banco.listarBovinos(ctx.grupoId, 'Vaca');
        igual(vacas.length, 1, 'Quantidade de vacas');
        igual(vacas[0].nome, 'Mimosa', 'Nome da vaca filtrada');
        const bezerros = await banco.listarBovinos(ctx.grupoId, 'Bezerro');
        igual(bezerros.length, 1, 'Quantidade de bezerros');
      },
    },
    {
      id: 'ler-bovino',
      titulo: 'Ler um bovino pelo id',
      requer: ['bovinos'],
      executar: async () => {
        const b = await banco.getBovino(ctx.bovino1);
        esperar(b, 'O bovino não foi encontrado ao ler de volta.');
        igual(b.nome, 'Mimosa', 'Nome');
        igual(b.tipo, 'Vaca', 'Tipo');
        igual(b.codigo, ctx.codigo1, 'Código');
        igual(b.grupo_id, String(ctx.grupoId), 'Grupo do bovino');
      },
    },
    {
      id: 'editar-bovino',
      titulo: 'Editar bovino e manter contador do grupo',
      requer: ['bovinos'],
      executar: async () => {
        await banco.atualizarBovino(ctx.bovino1, {
          nome: 'Mimosa editada',
          tipo: 'Vaca',
          descricao: 'descrição editada',
          codigo: ctx.codigo1,
          grupoId: ctx.grupoId,
        });
        const b = await banco.getBovino(ctx.bovino1);
        igual(b.nome, 'Mimosa editada', 'Nome editado');
        igual(b.descricao, 'descrição editada', 'Descrição editada');
        igual(await banco.contarBovinos(ctx.grupoId), 2, 'Contador preservado ao editar');
      },
    },
    {
      id: 'codigo-duplicado',
      titulo: 'Detectar código (ID) repetido',
      requer: ['bovinos'],
      executar: async () => {
        igual(await banco.codigoJaExiste(ctx.codigo1), true, 'Código que já existe');
        igual(await banco.codigoJaExiste(ctx.codigo1, ctx.bovino1), false, 'Código do próprio bovino (ignorado)');
        igual(await banco.codigoJaExiste(`NAO-EXISTE-${codigoUnico()}`), false, 'Código inexistente');
      },
    },
    {
      id: 'excluir-bovino',
      titulo: 'Excluir um bovino',
      requer: ['bovinos'],
      executar: async () => {
        await banco.deletarBovino(ctx.bovino2);
        igual(await banco.getBovino(ctx.bovino2), null, 'Bovino excluído ao ler de volta');
        igual((await banco.listarBovinos(ctx.grupoId, 'Todos')).length, 1, 'Bovinos restantes');
        igual(await banco.contarBovinos(ctx.grupoId), 1, 'Contador após excluir');
      },
    },
    {
      id: 'excluir-grupo',
      titulo: 'Excluir o grupo apaga também os bovinos dele',
      requer: ['bovinos'],
      executar: async () => {
        await banco.deletarGrupo(ctx.grupoId);
        igual(await banco.getGrupo(ctx.grupoId), null, 'Grupo excluído ao ler de volta');
        const sobrando = await getDocs(
          query(collection(db, 'usuarios', ctx.uid, 'bovinos'), where('grupoId', '==', String(ctx.grupoId)))
        );
        igual(sobrando.size, 0, 'Bovinos que sobraram do grupo excluído');
        ctx.grupoId = null;
      },
    },
    {
      id: 'sair',
      titulo: 'Sair da conta bloqueia o acesso aos dados',
      requer: ['conta'],
      executar: async () => {
        await banco.sair();
        igual(banco.haUsuarioLogado(), false, 'Há usuário logado após sair');
        try {
          await banco.listarGrupos();
          throw falhar('listarGrupos() funcionou sem ninguém logado.');
        } catch (e) {
          if (e.code !== 'app/nao-logado') throw e;
        }
        await esperarPermissaoNegada(
          () => getDoc(doc(db, 'usuarios', ctx.uid)),
          'Ler um perfil sem estar logado'
        );
      },
    },
    {
      id: 'login',
      titulo: 'Entrar de novo com e-mail e senha',
      requer: ['conta'],
      executar: async () => {
        const u = await banco.login(ctx.email, ctx.senha);
        esperar(u, 'login() não devolveu o usuário.');
        igual(u.email, ctx.email, 'E-mail do usuário logado');
        igual(u.nome, 'Teste Atualizado', 'Nome lido do Firestore após novo login');
      },
    },
    {
      id: 'senha-errada',
      titulo: 'Senha errada é recusada',
      requer: ['conta'],
      executar: async () => {
        try {
          await banco.login(ctx.email, 'senha-errada-123');
        } catch (e) {
          igual(e.message, 'E-mail ou senha incorretos.', 'Mensagem de erro para senha errada');
          return;
        }
        throw falhar('O login com senha errada foi aceito.');
      },
    },
    {
      id: 'limpeza',
      titulo: 'Limpeza: apagar a conta e os dados de teste',
      sempre: true,
      multiplicadorTempo: 3,
      executar: async () => limpar(ctx),
      dicaExtra: () =>
        ctx.email
          ? `Se a conta de teste ficou para trás, apague-a em Firebase Console > Authentication > Usuários: ${ctx.email}`
          : null,
    },
  ];
}

// Apaga tudo que o teste criou. Só mexe na conta cujo e-mail é o do teste —
// nunca em uma conta real que por acaso esteja logada.
async function limpar(ctx) {
  if (!ctx.email) return 'Nada a limpar (nenhuma conta de teste foi criada).';

  if (!auth.currentUser) {
    try {
      await banco.login(ctx.email, ctx.senha);
    } catch (e) {
      const naoExiste = ['auth/invalid-credential', 'auth/user-not-found', 'auth/invalid-login-credentials'];
      if (naoExiste.includes(e.code)) return 'Nada a limpar (a conta de teste não chegou a ser criada).';
      throw falhar(
        `Não consegui entrar para limpar. Apague manualmente a conta ${ctx.email} em Firebase Console > Authentication > Usuários.`
      );
    }
  }

  const usuario = auth.currentUser;
  if (usuario?.email !== ctx.email) {
    throw falhar(
      `Há outra conta logada (${usuario?.email}); por segurança não apaguei nada. Apague manualmente a conta ${ctx.email}.`
    );
  }

  const uid = usuario.uid;
  for (const sub of ['bovinos', 'grupos']) {
    const snap = await getDocs(collection(db, 'usuarios', uid, sub));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, 'usuarios', uid));
  await deleteUser(usuario);
  await banco.sair(); // zera o cache do perfil em memória
  return 'Conta e dados de teste apagados';
}

// ---------------- API usada pela tela ----------------

// Lista dos testes (todos "pendentes") para a tela mostrar antes de rodar.
export function listarTestes() {
  return montarPassos({}).map(({ id, titulo }) => ({ id, titulo, status: 'pendente' }));
}

export function resumir(resultados) {
  const ok = resultados.filter((r) => r.status === 'ok').length;
  const falhas = resultados.filter((r) => r.status === 'falhou').length;
  const ignorados = resultados.filter((r) => r.status === 'ignorado').length;
  return { total: resultados.length, ok, falhas, ignorados, sucesso: falhas === 0 && ignorados === 0 };
}

// Roda o roteiro inteiro. `aoAtualizar(resultados)` é chamado a cada mudança de
// status (a tela usa isso para mostrar o andamento). Nunca lança erro: falhas
// viram resultados com status "falhou".
export async function executarTestes(aoAtualizar = () => {}, { tempoLimiteMs = TEMPO_LIMITE_PADRAO_MS } = {}) {
  const ctx = {};
  const passos = montarPassos(ctx);
  const resultados = passos.map(({ id, titulo }) => ({ id, titulo, status: 'pendente' }));
  const avisar = () => aoAtualizar(resultados.map((r) => ({ ...r })));
  avisar();

  let abortado = false;
  for (let i = 0; i < passos.length; i++) {
    const passo = passos[i];
    const r = resultados[i];

    const faltaRequisito = (passo.requer || []).some(
      (id) => resultados.find((x) => x.id === id)?.status !== 'ok'
    );
    if ((abortado && !passo.sempre) || faltaRequisito) {
      r.status = 'ignorado';
      r.detalhe = 'Não rodou porque um teste anterior falhou.';
      avisar();
      continue;
    }

    r.status = 'rodando';
    avisar();
    const inicio = Date.now();
    try {
      const limite = tempoLimiteMs * (passo.multiplicadorTempo || 1);
      r.detalhe = (await comTempoLimite(passo.executar(), limite, passo.titulo)) ?? '';
      r.status = 'ok';
    } catch (e) {
      r.status = 'falhou';
      r.erro = e?.message || String(e);
      r.codigo = e?.code || '';
      r.dica = [dicaPara(e), passo.dicaExtra?.()].filter(Boolean).join(' ') || null;
      if (passo.critico) abortado = true;
    }
    r.ms = Date.now() - inicio;
    avisar();
  }

  return { resultados, resumo: resumir(resultados) };
}
