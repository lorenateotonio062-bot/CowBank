import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import Cabecalho from '../components/criargrupo/Cabecalho';
import Conteudo from '../components/criargrupo/Conteudo';
import RodapeNav from '../components/comuns/RodapeNav';
import TelaBase from '../components/comuns/TelaBase';
import { criarGrupo, atualizarGrupo, listarBovinos } from '../db/database';
import { useTema } from '../theme/ThemeContext';

export default function CriarGrupoScreen({ navigation }) {
  const { t } = useTema();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [grupoIdDraft, setGrupoIdDraft] = useState(null);
  const [bovinosAdicionados, setBovinosAdicionados] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (grupoIdDraft) {
        listarBovinos(grupoIdDraft).then(setBovinosAdicionados).catch(() => {});
      }
    }, [grupoIdDraft])
  );

  async function garantirGrupoSalvo() {
    if (grupoIdDraft) {
      await atualizarGrupo(grupoIdDraft, { nome: nome.trim(), descricao });
      return grupoIdDraft;
    }
    const novoId = await criarGrupo({ nome: nome.trim(), descricao });
    setGrupoIdDraft(novoId);
    return novoId;
  }

  async function handlePressAdicionar() {
    if (!nome.trim()) {
      setErro('Dê um nome ao grupo antes de adicionar bovinos.');
      return;
    }
    setErro('');
    try {
      const id = await garantirGrupoSalvo();
      navigation.navigate('RegistrarBovino', { grupoId: id, origem: 'CriarGrupo' });
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar o grupo. Tente novamente.');
    }
  }

  async function handlePressCriar() {
    if (!nome.trim()) {
      setErro('Dê um nome ao grupo.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const id = await garantirGrupoSalvo();
      navigation.replace('Grupos', { grupoId: id });
    } catch (e) {
      setErro(e.message || 'Não foi possível criar o grupo. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaBase backgroundColor={t.fundo} rodape={<RodapeNav />} paddingInferior={20}>
      <Cabecalho />
      <Conteudo
        nome={nome}
        descricao={descricao}
        onChangeNome={setNome}
        onChangeDescricao={setDescricao}
        bovinosAdicionados={bovinosAdicionados}
        onPressAdicionar={handlePressAdicionar}
        onPressCriar={handlePressCriar}
        erro={erro}
        carregando={carregando}
      />
    </TelaBase>
  );
}
