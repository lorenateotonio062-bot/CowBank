import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Cabecalho from '../components/perfil/Cabecalho';
import Comp2 from '../components/perfil/Comp2';
import RodapeNav from '../components/comuns/RodapeNav';
import TelaBase from '../components/comuns/TelaBase';
import Toast from '../components/comuns/Toast';
import { getUsuario, atualizarUsuario } from '../db/database';
import { useTema } from '../theme/ThemeContext';

export default function PerfilScreen() {
  const { t } = useTema();
  const [usuarioId, setUsuarioId] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [fotoUri, setFotoUri] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastChave, setToastChave] = useState(0);

  function mostrarToast(mensagem) {
    setToastMsg(mensagem);
    setToastChave((k) => k + 1);
  }

  useFocusEffect(
    useCallback(() => {
      getUsuario()
        .then((usuario) => {
          if (usuario) {
            setUsuarioId(usuario.id);
            setNome(usuario.nome ?? '');
            setEmail(usuario.email ?? '');
            setTelefone(usuario.telefone ?? '');
            setDataNascimento(usuario.data_nascimento ?? '');
            setFotoUri(usuario.foto_uri ?? null);
          }
        })
        .catch((e) => mostrarToast(e.message || 'Não foi possível carregar o perfil.'));
    }, [])
  );

  async function handleSalvar() {
    if (!usuarioId) return;
    setCarregando(true);
    try {
      // A troca de senha agora vive no fluxo próprio de "Esqueceu a senha?",
      // por isso este formulário só cuida dos dados de cadastro.
      await atualizarUsuario(usuarioId, {
        nome,
        email,
        telefone,
        dataNascimento,
        fotoUri,
      });
      mostrarToast('Perfil atualizado com sucesso.');
    } catch (e) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar as informações.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaBase
      backgroundColor={t.fundo}
      rodape={<RodapeNav />}
      paddingInferior={20}
      sobreposicao={<Toast mensagem={toastMsg} chave={toastChave} />}>
      <Cabecalho fotoUri={fotoUri} onEscolherFoto={setFotoUri} />
      <Comp2
        nome={nome}
        email={email}
        telefone={telefone}
        dataNascimento={dataNascimento}
        onChangeNome={setNome}
        onChangeEmail={setEmail}
        onChangeTelefone={setTelefone}
        onChangeDataNascimento={setDataNascimento}
        onSalvar={handleSalvar}
        carregando={carregando}
      />
    </TelaBase>
  );
}
