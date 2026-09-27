import { useState } from 'react';
import { Alert } from 'react-native';

import Topo from '../components/criarconta/Topo';
import TelaBase from '../components/comuns/TelaBase';
import CardEmail from '../components/redefinirsenha/CardEmail';
import { solicitarRedefinicaoSenha } from '../db/database';
import { cores } from '../theme/colors';

export default function RedefinirSenhaEmailScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleEnviar() {
    if (!email.trim()) {
      setErro('Digite o e-mail da sua conta.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      await solicitarRedefinicaoSenha(email.trim());
      // O Firebase envia o e-mail com o link para criar a nova senha.
      Alert.alert(
        'Verifique seu e-mail',
        'Se existir uma conta com esse e-mail, enviamos um link para você criar uma nova senha. Olhe também a caixa de spam.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      setErro(e.message || 'Não foi possível processar o pedido. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaBase backgroundColor={cores.verde}>
      <Topo />
      <CardEmail
        email={email}
        onChangeEmail={setEmail}
        onSubmit={handleEnviar}
        erro={erro}
        carregando={carregando}
      />
    </TelaBase>
  );
}
