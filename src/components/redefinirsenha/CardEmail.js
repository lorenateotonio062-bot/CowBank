import { Text, View, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import MensagemErro from '../comuns/MensagemErro';
import Suporte from './Suporte';
import { useTema } from '../../theme/ThemeContext';
import { sombra } from '../../theme/ui';

export default function CardEmail({ email, onChangeEmail, onSubmit, erro, carregando }) {
  const { t } = useTema();

  return (
    <View style={[styles.conteiner, { backgroundColor: t.card }]}>
      <View style={styles.divTexto}>
        <Text style={[styles.texto, { color: t.texto }]}>Redefinir senha</Text>
        <Text style={[styles.textoInstru, { color: t.textoSecundario }]}>
          informe o e-mail de sua conta para o qual deseja redefinir sua senha
        </Text>
      </View>
      <View style={styles.divInfo}>
        <Text style={[styles.textinho, { color: t.textoSecundario }]}>Email</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          placeholder="Digite seu email"
          placeholderTextColor={t.placeholder}
          value={email}
          onChangeText={onChangeEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <MensagemErro mensagem={erro} />
        <Pressable
          style={({ pressed }) => [styles.botao, pressed ? styles.botaoPressionado : null]}
          onPress={onSubmit}
          disabled={carregando}>
          {carregando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}> Enviar link </Text>
          )}
        </Pressable>
      </View>
      <Suporte />
    </View>
  );
}

const styles = StyleSheet.create({
  conteiner: {
    width: 335,
    height: 650,
    flexDirection: 'column',
    alignSelf: 'center',
    marginLeft: 20,
    marginRight: 20,
    paddingBottom: 75,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    ...sombra,
  },
  divTexto: {
    minHeight: 100,
    margin: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoInstru: {
    textAlign: 'center',
    fontSize: 13.5,
  },
  divInfo: {
    minHeight: 180,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textinho: {
    fontFamily: fontes.campo,
    color: cores.cinzaTexto,
    paddingBottom: 5,
    fontSize: 12,
    textTransform: 'uppercase',
    width: 270,
  },
  textInput: {
    borderWidth: 1,
    marginBottom: 15,
    width: 270,
    padding: 15,
    borderRadius: 14,
    fontFamily: fontes.campo,
  },
  texto: {
    fontSize: 30,
    fontFamily: fontes.padraoBold,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: cores.roxo,
    width: 280,
    height: 45,
    marginTop: 10,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoPressionado: {
    backgroundColor: '#7440d6',
  },
  btnText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: fontes.botao,
  },
  erro: {
    color: cores.erro,
    fontFamily: fontes.padrao,
    fontSize: 12,
    width: 270,
    marginBottom: 10,
    textAlign: 'center',
  },
});
