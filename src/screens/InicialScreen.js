import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import Cabecalho from '../components/inicial/Cabecalho';
import Grupos from '../components/inicial/Grupos';
import Opcoes from '../components/inicial/Opcoes';
import RodapeNav from '../components/comuns/RodapeNav';
import TelaBase from '../components/comuns/TelaBase';
import ConfirmModal from '../components/comuns/ConfirmModal';
import Toast from '../components/comuns/Toast';
import { getUsuario, listarGrupos, deletarGrupo } from '../db/database';
import { useTema } from '../theme/ThemeContext';

export default function InicialScreen({ navigation }) {
  const { t } = useTema();
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [grupoParaExcluir, setGrupoParaExcluir] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastChave, setToastChave] = useState(0);

  function mostrarToast(mensagem) {
    setToastMsg(mensagem);
    setToastChave((k) => k + 1);
  }

  const carregarDados = useCallback(async () => {
    try {
      const usuario = await getUsuario();
      setNomeUsuario(usuario?.nome ?? '');
      const listaGrupos = await listarGrupos();
      setGrupos(listaGrupos);
    } catch (e) {
      mostrarToast(e.message || 'Não foi possível carregar os dados.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  async function handleAtualizar() {
    setAtualizando(true);
    await carregarDados();
    setAtualizando(false);
  }

  const gruposFiltrados = grupos.filter((g) =>
    g.nome.toLowerCase().includes(pesquisa.trim().toLowerCase())
  );

  const mensagemVazio =
    grupos.length > 0 && pesquisa.trim()
      ? 'Nenhum grupo encontrado com esse nome.'
      : 'Nenhum grupo criado ainda.';

  function handleAbrirGrupo(grupo) {
    navigation.navigate('Grupos', { grupoId: grupo.id });
  }

  async function handleConfirmarExclusao() {
    if (grupoParaExcluir) {
      const nome = grupoParaExcluir.nome;
      try {
        await deletarGrupo(grupoParaExcluir.id);
        mostrarToast(`Grupo "${nome}" excluído.`);
      } catch (e) {
        mostrarToast(e.message || 'Não foi possível excluir o grupo.');
      }
      setGrupoParaExcluir(null);
      carregarDados();
    }
  }

  return (
    <TelaBase
      backgroundColor={t.fundo}
      rolavel={false}
      rodape={<RodapeNav />}
      sobreposicao={<Toast mensagem={toastMsg} chave={toastChave} />}>
      <Cabecalho
        nomeUsuario={nomeUsuario}
        valorPesquisa={pesquisa}
        onChangePesquisa={setPesquisa}
      />
      <Grupos
        grupos={gruposFiltrados}
        onAbrirGrupo={handleAbrirGrupo}
        onSolicitarExclusao={setGrupoParaExcluir}
        mensagemVazio={mensagemVazio}
        atualizando={atualizando}
        onAtualizar={handleAtualizar}
        corTexto={t.texto}
      />
      <Opcoes corTexto={t.texto} />

      <ConfirmModal
        visivel={!!grupoParaExcluir}
        titulo={`Deletar o grupo "${grupoParaExcluir?.nome ?? ''}" permanentemente?`}
        onCancelar={() => setGrupoParaExcluir(null)}
        onConfirmar={handleConfirmarExclusao}
      />
    </TelaBase>
  );
}
