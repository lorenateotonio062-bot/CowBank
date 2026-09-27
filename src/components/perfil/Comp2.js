import { useRef } from 'react';
import { View, StyleSheet, TextInput, Text, Pressable, ActivityIndicator } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { useTema } from '../../theme/ThemeContext';
import { sombraLeve } from '../../theme/ui';
export default function Comp2({
  nome,
  email,
  telefone,
  dataNascimento,
  onChangeNome,
  onChangeEmail,
  onChangeTelefone,
  onChangeDataNascimento,
  onSalvar,
  carregando,
}) {
  const { t } = useTema();
  const podeSalvar = nome.trim().length > 0 && email.trim().length > 0;
  const refEmail = useRef(null);
  const refTelefone = useRef(null);
  const refData = useRef(null);

  return (
    <View style={styles.containerP}>
      <View style={[styles.containerS, { backgroundColor: t.card, borderColor: t.borda }]}>
        <Text style={[styles.inputText, { color: t.textoSecundario }]}>Nome</Text>
        <TextInput
          style={[styles.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          value={nome}
          onChangeText={onChangeNome}
          returnKeyType="next"
          onSubmitEditing={() => refEmail.current?.focus()}
          blurOnSubmit={false}
        />
        <Text style={[styles.inputText, { color: t.textoSecundario }]}>Email</Text>
        <TextInput
          ref={refEmail}
          style={[styles.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }, styles.campoSomenteLeitura]}
          value={email}
          onChangeText={onChangeEmail}
          editable={false}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => refTelefone.current?.focus()}
          blurOnSubmit={false}
        />
        <Text style={[styles.inputText, { color: t.textoSecundario }]}>Telefone</Text>
        <TextInput
          ref={refTelefone}
          style={[styles.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          value={telefone}
          onChangeText={onChangeTelefone}
          placeholder="(xx) xxxxx-xxxx"
          placeholderTextColor={t.placeholder}
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => refData.current?.focus()}
          blurOnSubmit={false}
        />
        <Text style={[styles.inputText, { color: t.textoSecundario }]}>Data de nascimento</Text>
        <TextInput
          ref={refData}
          style={[styles.campo, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          value={dataNascimento}
          onChangeText={onChangeDataNascimento}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={t.placeholder}
          returnKeyType="done"
          onSubmitEditing={podeSalvar ? onSalvar : undefined}
        />
        <Pressable
          style={({ pressed }) => [
            styles.btnSalvar,
            !podeSalvar ? styles.btnDesabilitado : null,
            pressed ? styles.btnPressionado : null,
          ]}
          onPress={onSalvar}
          disabled={carregando || !podeSalvar}>
          {carregando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.textSalvar}> Salvar </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerP: {
    minHeight: 440,
    paddingHorizontal: 18,
  },
  containerS: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    ...sombraLeve,
  },
  inputText: {
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: 5,
    color: cores.cinzaTexto,
    fontFamily: fontes.padraoMedio,
  },
  campo: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    fontFamily: fontes.campo,
    paddingHorizontal: 12,
  },
  // o e-mail é o login da conta e não pode ser trocado por aqui
  campoSomenteLeitura: {
    opacity: 0.6,
  },
  btnDesabilitado: {
    opacity: 0.5,
  },
  btnPressionado: {
    backgroundColor: '#7440d6',
  },
  btnSalvar: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: cores.roxo,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  textSalvar: {
    color: 'white',
    fontFamily: fontes.botao,
  },
});
