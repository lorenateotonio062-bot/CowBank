import { useRef } from 'react';
import { Text, View, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import MensagemErro from '../comuns/MensagemErro';
import CampoSenha from '../comuns/CampoSenha';
import { useTema } from '../../theme/ThemeContext';
import { sombra } from '../../theme/ui';

export default function NovaConta({
  nome,
  email,
  senha,
  dataNascimento,
  onChangeNome,
  onChangeEmail,
  onChangeSenha,
  onChangeDataNascimento,
  onSubmit,
  erro,
  carregando,
}) {
  const { t } = useTema();
  const podeEnviar = nome.trim().length > 0 && email.trim().length > 0 && senha.length > 0;
  const refEmail = useRef(null);
  const refSenha = useRef(null);
  const refData = useRef(null);

  return (
    <View style={[styles.conteiner, { backgroundColor: t.card }]}>
      <View style={styles.divTexto}>
        <Text style={[styles.texto, { color: t.texto }]}>Criar uma nova conta</Text>
      </View>
      <View style={styles.divInfo}>
        <Text style={[styles.textinho, { color: t.textoSecundario }]}>Nome</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          placeholder="Digite seu nome"
          placeholderTextColor={t.placeholder}
          value={nome}
          onChangeText={onChangeNome}
          returnKeyType="next"
          onSubmitEditing={() => refEmail.current?.focus()}
          blurOnSubmit={false}
        />
        <Text style={[styles.textinho, { color: t.textoSecundario }]}>Email</Text>
        <TextInput
          ref={refEmail}
          style={[styles.textInput, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          placeholder="Digite seu email"
          placeholderTextColor={t.placeholder}
          value={email}
          onChangeText={onChangeEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => refSenha.current?.focus()}
          blurOnSubmit={false}
        />
        <Text style={[styles.textinho, { color: t.textoSecundario }]}>Senha</Text>
        <CampoSenha
          ref={refSenha}
          style={[styles.textInput, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          inputStyle={styles.inputSenha}
          placeholder="Digite sua senha"
          placeholderTextColor={t.placeholder}
          value={senha}
          onChangeText={onChangeSenha}
          returnKeyType="next"
          onSubmitEditing={() => refData.current?.focus()}
          blurOnSubmit={false}
        />
        <Text style={[styles.textinho, { color: t.textoSecundario }]}>Data de nascimento</Text>
        <TextInput
          ref={refData}
          style={[styles.textInput, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={t.placeholder}
          value={dataNascimento}
          onChangeText={onChangeDataNascimento}
          returnKeyType="done"
          onSubmitEditing={podeEnviar ? onSubmit : undefined}
        />
        <MensagemErro mensagem={erro} />
        <Pressable
          style={({ pressed }) => [
            styles.botao,
            !podeEnviar ? styles.botaoDesabilitado : null,
            pressed ? styles.botaoPressionado : null,
          ]}
          onPress={onSubmit}
          disabled={carregando || !podeEnviar}>
          {carregando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}> Cadastrar-se </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteiner: {
    minHeight: 1400,
    flexDirection: 'column',
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
  divInfo: {
    minHeight: 445,
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
    borderRadius: 15,
    fontFamily: fontes.campo,
  },
  texto: {
    fontSize: 30,
    fontFamily: fontes.padraoBold,
    textAlign: 'center',
  },
  inputSenha: {
    fontFamily: fontes.campo,
  },
  botao: {
    backgroundColor: cores.roxo,
    width: 280,
    height: 45,
    marginTop: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.5,
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
  },
});
