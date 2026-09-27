import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Cabecalho from '../components/registrarbovino/Cabecalho';
import Comp2 from '../components/registrarbovino/Comp2';
import Comp3 from '../components/registrarbovino/Comp3';
import RodapeNav from '../components/comuns/RodapeNav';
import SelectModal from '../components/comuns/SelectModal';
import TelaBase from '../components/comuns/TelaBase';
import {
  criarBovino,
  atualizarBovino,
  getBovino,
  listarGrupos,
  contarBovinos,
  codigoJaExiste,
} from '../db/database';
import { escolherImagemGaleria, tirarFoto } from '../services/imagePicker';
import { useTema } from '../theme/ThemeContext';

const TIPOS = [
  { label: 'Vaca', value: 'Vaca' },
  { label: 'Bezerro', value: 'Bezerro' },
  { label: 'Boi', value: 'Boi' },
];

export default function RegistrarBovinoScreen({ navigation, route }) {
  const { t } = useTema();
  const grupoIdPreset = route.params?.grupoId ?? null;
  const bovinoId = route.params?.bovinoId ?? null;
  const origem = route.params?.origem;
  const modoEdicao = !!bovinoId;

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Vaca');
  const [grupoId, setGrupoId] = useState(grupoIdPreset);
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [fotoUri, setFotoUri] = useState(null);
  const [pesoKg, setPesoKg] = useState('');
  const [alturaCm, setAlturaCm] = useState('');
  const [alimentacao, setAlimentacao] = useState('');
  const [ultimaAlimentacao, setUltimaAlimentacao] = useState('');
  const [intervaloAlimentacaoHoras, setIntervaloAlimentacaoHoras] = useState('');
  const [vacinas, setVacinas] = useState('');
  const [observacoesSanitarias, setObservacoesSanitarias] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [grupos, setGrupos] = useState([]);
  const [seletorTipoAberto, setSeletorTipoAberto] = useState(false);
  const [seletorGrupoAberto, setSeletorGrupoAberto] = useState(false);

  // Controla se o código foi digitado à mão — se sim, paramos de sugerir
  // automaticamente por cima do que a pessoa já escreveu.
  const codigoEditadoManualmente = useRef(false);

  useFocusEffect(
    useCallback(() => {
      listarGrupos().then(setGrupos).catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (modoEdicao || !grupoId || codigoEditadoManualmente.current) return;
    contarBovinos(grupoId)
      .then((total) => {
        setCodigo(String(total + 1).padStart(3, '0'));
      })
      .catch(() => {});
  }, [grupoId, modoEdicao]);

  useEffect(() => {
    if (!bovinoId) return;
    getBovino(bovinoId)
      .then((bovino) => {
        if (!bovino) {
          setErro('Esse bovino não existe mais.');
          return;
        }
        setNome(bovino.nome ?? '');
        setTipo(bovino.tipo ?? 'Vaca');
        setGrupoId(bovino.grupo_id ?? grupoIdPreset);
        setDescricao(bovino.descricao ?? '');
        setCodigo(bovino.codigo ?? '');
        setFotoUri(bovino.foto_uri ?? null);
        setPesoKg(String(bovino.pesoKg ?? ''));
        setAlturaCm(String(bovino.alturaCm ?? ''));
        setAlimentacao(bovino.alimentacao ?? '');
        setUltimaAlimentacao(bovino.ultimaAlimentacao ?? '');
        setIntervaloAlimentacaoHoras(String(bovino.intervaloAlimentacaoHoras ?? ''));
        setVacinas(bovino.vacinas ?? '');
        setObservacoesSanitarias(bovino.observacoesSanitarias ?? '');
        codigoEditadoManualmente.current = true;
      })
      .catch((e) => setErro(e.message || 'Não foi possível carregar o bovino.'));
  }, [bovinoId, grupoIdPreset]);

  function handleChangeCodigo(valor) {
    codigoEditadoManualmente.current = true;
    setCodigo(valor);
  }

  const nomeGrupoSelecionado = grupos.find((g) => g.id === grupoId)?.nome ?? '';

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Dê um nome ao bovino.');
      return;
    }
    if (!grupoId) {
      setErro('Escolha um grupo para o bovino.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      if (codigo.trim() && (await codigoJaExiste(codigo.trim(), bovinoId))) {
        setErro('Esse código já está sendo usado por outro bovino.');
        setCarregando(false);
        return;
      }
      const dados = {
        nome: nome.trim(),
        tipo,
        descricao,
        codigo: codigo.trim(),
        grupoId,
        fotoUri,
        pesoKg: pesoKg.trim(),
        alturaCm: alturaCm.trim(),
        alimentacao: alimentacao.trim(),
        ultimaAlimentacao: ultimaAlimentacao.trim(),
        intervaloAlimentacaoHoras: intervaloAlimentacaoHoras.trim(),
        vacinas: vacinas.trim(),
        observacoesSanitarias: observacoesSanitarias.trim(),
      };
      if (modoEdicao) {
        await atualizarBovino(bovinoId, dados);
      } else {
        await criarBovino(dados);
      }
      if (origem === 'CriarGrupo') {
        navigation.goBack();
      } else {
        navigation.replace('Grupos', { grupoId });
      }
    } catch (e) {
      setErro(e.message || `Não foi possível ${modoEdicao ? 'salvar' : 'registrar'} o bovino. Tente novamente.`);
    } finally {
      setCarregando(false);
    }
  }

  function abrirSeletorGrupo() {
    if (grupos.length === 0) {
      Alert.alert('Nenhum grupo ainda', 'Crie um grupo antes de registrar um bovino.');
      return;
    }
    setSeletorGrupoAberto(true);
  }

  async function aplicarFoto(origemFoto) {
    try {
      const uri = origemFoto === 'camera' ? await tirarFoto() : await escolherImagemGaleria();
      if (uri) setFotoUri(uri);
    } catch (e) {
      Alert.alert('Foto do animal', e.message || 'Não foi possível escolher a foto.');
    }
  }

  function escolherFotoAnimal() {
    const opcoes = [
      { text: 'Tirar foto', onPress: () => aplicarFoto('camera') },
      { text: 'Escolher da galeria', onPress: () => aplicarFoto('galeria') },
    ];

    if (fotoUri) {
      opcoes.push({ text: 'Remover foto', style: 'destructive', onPress: () => setFotoUri(null) });
    }

    opcoes.push({ text: 'Cancelar', style: 'cancel' });

    Alert.alert('Foto do animal', 'Como deseja adicionar a foto?', opcoes);
  }

  return (
    <>
      <TelaBase backgroundColor={t.fundo} rodape={<RodapeNav />} paddingInferior={20}>
        <Cabecalho titulo={modoEdicao ? 'Editar bovino' : 'Registrar bovino'} />
        <Comp2
          nome={nome}
          onChangeNome={setNome}
          tipo={tipo}
          onAbrirSeletorTipo={() => setSeletorTipoAberto(true)}
          nomeGrupoSelecionado={nomeGrupoSelecionado}
          onAbrirSeletorGrupo={abrirSeletorGrupo}
          fotoUri={fotoUri}
          onEscolherFoto={escolherFotoAnimal}
        />
        <Comp3
          descricao={descricao}
          onChangeDescricao={setDescricao}
          codigo={codigo}
          onChangeCodigo={handleChangeCodigo}
          pesoKg={pesoKg}
          onChangePesoKg={setPesoKg}
          alturaCm={alturaCm}
          onChangeAlturaCm={setAlturaCm}
          alimentacao={alimentacao}
          onChangeAlimentacao={setAlimentacao}
          ultimaAlimentacao={ultimaAlimentacao}
          onChangeUltimaAlimentacao={setUltimaAlimentacao}
          intervaloAlimentacaoHoras={intervaloAlimentacaoHoras}
          onChangeIntervaloAlimentacaoHoras={setIntervaloAlimentacaoHoras}
          vacinas={vacinas}
          onChangeVacinas={setVacinas}
          observacoesSanitarias={observacoesSanitarias}
          onChangeObservacoesSanitarias={setObservacoesSanitarias}
          onSubmit={handleSalvar}
          erro={erro}
          carregando={carregando}
          desabilitado={!nome.trim() || !grupoId}
          modoEdicao={modoEdicao}
        />
      </TelaBase>

      <SelectModal
        visivel={seletorTipoAberto}
        titulo="Tipo de bovino"
        opcoes={TIPOS}
        valorSelecionado={tipo}
        onSelecionar={(valor) => {
          setTipo(valor);
          setSeletorTipoAberto(false);
        }}
        onFechar={() => setSeletorTipoAberto(false)}
      />

      <SelectModal
        visivel={seletorGrupoAberto}
        titulo="Escolha o grupo"
        opcoes={grupos.map((g) => ({ label: g.nome, value: g.id }))}
        valorSelecionado={grupoId}
        onSelecionar={(valor) => {
          setGrupoId(valor);
          setSeletorGrupoAberto(false);
        }}
        onFechar={() => setSeletorGrupoAberto(false)}
      />
    </>
  );
}
