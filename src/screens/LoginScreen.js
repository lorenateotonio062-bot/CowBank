import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import Logo from '../components/login/Logo';
import TextoLogin from '../components/login/TextoLogin';
import InputLogin from '../components/login/InputLogin';
import Ajuda from '../components/login/Ajuda';
import TelaBase from '../components/comuns/TelaBase';
import { login } from '../db/database';
import { useTema } from '../theme/ThemeContext';
import { cores } from '../theme/colors';
import { fontes } from '../theme/fonts';

export default function LoginScreen({ navigation }) {
  const { carregarModoSalvo, t } = useTema();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar() {
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const usuario = await login(email.trim(), senha);
      if (usuario) {
        await carregarModoSalvo(); // aplica o tema (claro/escuro) salvo na conta
        navigation.reset({ index: 0, routes: [{ name: 'Inicial' }] });
      } else {
        setErro('E-mail ou senha incorretos.');
      }
    } catch (e) {
      setErro(e.message || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaBase backgroundColor={t.fundo}>
      <Logo />
      <TextoLogin />
      <InputLogin
        email={email}
        senha={senha}
        onChangeEmail={setEmail}
        onChangeSenha={setSenha}
        onSubmit={handleEntrar}
        erro={erro}
        carregando={carregando}
      />
      <Ajuda />
      {/* Só aparece em desenvolvimento; some no app publicado. */}
      {__DEV__ ? (
        <Pressable
          onPress={() => navigation.navigate('TesteBanco')}
          accessibilityLabel="Testar o banco de dados"
          style={{ alignSelf: 'center', padding: 12, marginTop: 8 }}>
          <Text
            style={{
              color: t.textoSecundario,
              fontFamily: fontes.padrao,
              fontSize: 12,
              textDecorationLine: 'underline',
            }}>
            Testar banco de dados (modo desenvolvimento)
          </Text>
        </Pressable>
      ) : null}
    </TelaBase>
  );
}
