import { useRef } from 'react';
import { Text, View, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import MensagemErro from '../comuns/MensagemErro';
import CampoSenha from '../comuns/CampoSenha';
import { useTema } from '../../theme/ThemeContext';
import { sombraLeve } from '../../theme/ui';

export default function InputLogin({
  email,
  senha,
  onChangeEmail,
  onChangeSenha,
  onSubmit,
  erro,
  carregando,
}) {
  const { t } = useTema();
  const podeEnviar = email.trim().length > 0 && senha.length > 0;
  const refSenha = useRef(null);

  return (
    <View style={[estilo.conteiner, { backgroundColor: t.card, borderColor: t.borda }]}>
      <Text style={[estilo.texto, { color: t.textoSecundario }]}>E-mail</Text>
      <TextInput
        style={[estilo.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
        placeholder="Digite seu e-mail"
        placeholderTextColor={t.placeholder}
        value={email}
        onChangeText={onChangeEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => refSenha.current?.focus()}
        blurOnSubmit={false}
      />
      <Text style={[estilo.texto, { color: t.textoSecundario }]}>Senha</Text>
      <CampoSenha
        ref={refSenha}
        style={[estilo.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
        inputStyle={estilo.inputSenha}
        placeholder="Digite sua senha"
        placeholderTextColor={t.placeholder}
        value={senha}
        onChangeText={onChangeSenha}
        returnKeyType="done"
        onSubmitEditing={podeEnviar ? onSubmit : undefined}
      />
      <MensagemErro mensagem={erro} />
      <View style={estilo.contBotao}>
        {carregando ? (
          <ActivityIndicator color={cores.verde} />
        ) : (
          <Pressable
            style={({ pressed }) => [
              estilo.botao,
              !podeEnviar ? estilo.botaoDesabilitado : null,
              pressed ? estilo.botaoPressionado : null,
            ]}
            onPress={onSubmit}
            disabled={!podeEnviar}>
            <Text style={estilo.botaoTexto}>Entrar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const estilo = StyleSheet.create({
  conteiner: {
    marginHorizontal: 22,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    ...sombraLeve,
  },
  texto: {
    fontFamily: fontes.campo,
    color: cores.cinzaTexto,
    marginBottom: 5,
    marginTop: 10,
    width: '100%',
  },
  campo: {
    borderWidth: 1,
    marginBottom: 5,
    width: '100%',
    padding: 15,
    borderRadius: 15,
    fontFamily: fontes.campo,
  },
  inputSenha: {
    fontFamily: fontes.campo,
  },
  contBotao: {
    width: '100%',
    marginTop: 10,
  },
  botao: {
    height: 48,
    borderRadius: 14,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  botaoPressionado: {
    backgroundColor: cores.verdeEscuro,
  },
  botaoTexto: {
    color: cores.branco,
    fontFamily: fontes.botao,
  },
  erro: {
    color: cores.erro,
    fontFamily: fontes.padrao,
    fontSize: 12,
    width: 270,
    marginTop: 5,
  },
});
