import { useState, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Cabecalho from '../components/grupos/Cabecalho';
import Pesquisa from '../components/grupos/Pesquisa';
import Secao from '../components/grupos/Secao';
import Conteudo from '../components/grupos/Conteudo';
import RodapeNav from '../components/comuns/RodapeNav';
import TelaBase from '../components/comuns/TelaBase';
import ConfirmModal from '../components/comuns/ConfirmModal';
import Toast from '../components/comuns/Toast';
import { getGrupo, listarBovinos, deletarBovino } from '../db/database';
import { cores } from '../theme/colors';
import { fontes } from '../theme/fonts';
import { useTema } from '../theme/ThemeContext';

export default function GruposScreen({ route, navigation }) {
  const { grupoId } = route.params;
  const { t } = useTema();

  const [grupo, setGrupo] = useState(null);
  const [bovinos, setBovinos] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [bovinoParaExcluir, setBovinoParaExcluir] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastChave, setToastChave] = useState(0);

  function mostrarToast(mensagem) {
    setToastMsg(mensagem);
    setToastChave((k) => k + 1);
  }

  const carregarDados = useCallback(async () => {
    try {
      const g = await getGrupo(grupoId);
      setGrupo(g);
      const lista = await listarBovinos(grupoId, tipoSelecionado);
      setBovinos(lista);
    } catch (e) {
      mostrarToast(e.message || 'Não foi possível carregar os dados.');
    }
  }, [grupoId, tipoSelecionado]);

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

  const termoPesquisa = pesquisa.trim().toLowerCase();
  const bovinosFiltrados = bovinos.filter((b) => {
    if (!termoPesquisa) return true;
    return [b.nome, b.codigo, b.id]
      .some((valor) => String(valor ?? '').toLowerCase().includes(termoPesquisa));
  });

  const mensagemVazio =
    bovinos.length > 0 && (pesquisa.trim() || tipoSelecionado)
      ? 'Nenhum bovino encontrado com esse filtro.'
      : 'Nenhum bovino registrado neste grupo ainda.';

  async function handleConfirmarExclusao() {
    if (bovinoParaExcluir) {
      const nome = bovinoParaExcluir.nome;
      try {
        await deletarBovino(bovinoParaExcluir.id);
        mostrarToast(`"${nome}" excluído.`);
      } catch (e) {
        mostrarToast(e.message || 'Não foi possível excluir.');
      }
      setBovinoParaExcluir(null);
      carregarDados();
    }
  }

  return (
    <TelaBase
      backgroundColor={t.fundo}
      rolavel={false}
      rodape={<RodapeNav />}
      sobreposicao={<Toast mensagem={toastMsg} chave={toastChave} />}>
      <Cabecalho nomeGrupo={grupo?.nome ?? ''} />
      <Pesquisa valor={pesquisa} onChange={setPesquisa} />
      <Secao tipoSelecionado={tipoSelecionado} onSelecionar={setTipoSelecionado} />
      <View style={styles.acoes}>
        <Pressable
          style={styles.botaoNovo}
          onPress={() => navigation.navigate('RegistrarBovino', { grupoId })}
          accessibilityLabel="Incluir novo animal neste grupo">
          <Text style={styles.botaoNovoIcone}>+</Text>
          <Text style={styles.botaoNovoTexto}>Novo animal</Text>
        </Pressable>
      </View>
      <Conteudo
        bovinos={bovinosFiltrados}
        onSolicitarExclusao={setBovinoParaExcluir}
        onEditar={(bovino) =>
          navigation.navigate('RegistrarBovino', { grupoId, bovinoId: bovino.id })
        }
        mensagemVazio={mensagemVazio}
        atualizando={atualizando}
        onAtualizar={handleAtualizar}
      />

      <ConfirmModal
        visivel={!!bovinoParaExcluir}
        titulo={`Deletar "${bovinoParaExcluir?.nome ?? ''}" permanentemente?`}
        onCancelar={() => setBovinoParaExcluir(null)}
        onConfirmar={handleConfirmarExclusao}
      />
    </TelaBase>
  );
}

const styles = StyleSheet.create({
  acoes: {
    marginHorizontal: 18,
    marginTop: 8,
  },
  botaoNovo: {
    height: 46,
    borderRadius: 14,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  botaoNovoIcone: {
    color: cores.branco,
    fontFamily: fontes.padraoBold,
    fontSize: 24,
    lineHeight: 26,
  },
  botaoNovoTexto: {
    color: cores.branco,
    fontFamily: fontes.botao,
    fontSize: 15,
  },
});
