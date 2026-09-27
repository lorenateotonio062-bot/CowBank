import { View, StyleSheet, TextInput, Text, Pressable, ActivityIndicator } from 'react-native';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import MensagemErro from '../comuns/MensagemErro';
import { useTema } from '../../theme/ThemeContext';
import { sombraLeve } from '../../theme/ui';

export default function Comp3({
  descricao,
  onChangeDescricao,
  codigo,
  onChangeCodigo,
  pesoKg,
  onChangePesoKg,
  alturaCm,
  onChangeAlturaCm,
  alimentacao,
  onChangeAlimentacao,
  ultimaAlimentacao,
  onChangeUltimaAlimentacao,
  intervaloAlimentacaoHoras,
  onChangeIntervaloAlimentacaoHoras,
  vacinas,
  onChangeVacinas,
  observacoesSanitarias,
  onChangeObservacoesSanitarias,
  onSubmit,
  erro,
  carregando,
  desabilitado,
  modoEdicao,
}) {
  const { t } = useTema();

  return (
    <View style={[styles.container, { backgroundColor: t.card, borderColor: t.borda }]}>
      <View style={styles.containerP}>
        <Text style={[styles.textDescri, { color: t.textoSecundario }]}>Descrição</Text>
        <View style={[styles.containerS, { backgroundColor: t.campo, borderColor: t.borda }]}>
          <TextInput
            style={[styles.descri, { color: t.texto }]}
            placeholder="Descreva a vaca se necessário"
            placeholderTextColor={t.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={descricao}
            onChangeText={onChangeDescricao}
          />
        </View>
      </View>
      <View style={styles.codigo}>
        <Text style={[styles.textCodigo, { color: t.textoSecundario }]}>ID (Código)</Text>
        <TextInput
          style={[styles.codInput, { backgroundColor: t.campo, borderColor: t.borda, color: t.texto }]}
          placeholder="Digite o ID que você irá utilizar"
          placeholderTextColor={t.placeholder}
          value={codigo}
          onChangeText={onChangeCodigo}
          returnKeyType="done"
          onSubmitEditing={!desabilitado ? onSubmit : undefined}
        />
      </View>

      <Text style={[styles.secaoTitulo, { color: t.texto }]}>Ficha técnica</Text>
      <View style={styles.linhaCampos}>
        <Campo
          rotulo="Peso (kg)"
          valor={pesoKg}
          onChange={onChangePesoKg}
          placeholder="Ex.: 420"
          teclado="decimal-pad"
          t={t}
        />
        <Campo
          rotulo="Altura (cm)"
          valor={alturaCm}
          onChange={onChangeAlturaCm}
          placeholder="Ex.: 138"
          teclado="decimal-pad"
          t={t}
        />
      </View>

      <Campo
        rotulo="Alimentação"
        valor={alimentacao}
        onChange={onChangeAlimentacao}
        placeholder="Ex.: pasto + silagem + sal mineral"
        t={t}
      />
      <Campo
        rotulo="Última alimentação"
        valor={ultimaAlimentacao}
        onChange={onChangeUltimaAlimentacao}
        placeholder="AAAA-MM-DD HH:mm"
        t={t}
      />
      <Campo
        rotulo="Intervalo entre alimentações (horas)"
        valor={intervaloAlimentacaoHoras}
        onChange={onChangeIntervaloAlimentacaoHoras}
        placeholder="Ex.: 8"
        teclado="decimal-pad"
        t={t}
      />

      <Campo
        rotulo="Vacinas"
        valor={vacinas}
        onChange={onChangeVacinas}
        placeholder="Ex.: aftosa 2026-09-20; brucelose em dia"
        multiline
        t={t}
      />
      <Campo
        rotulo="Observações sanitárias"
        valor={observacoesSanitarias}
        onChange={onChangeObservacoesSanitarias}
        placeholder="Vermifugação, cio, prenhez, tratamento, ocorrência..."
        multiline
        t={t}
      />

      <Text style={[styles.ajudaQr, { color: t.textoSecundario }]}>
        O QR Code do animal será gerado e gravado automaticamente após o cadastro.
      </Text>
      <MensagemErro mensagem={erro} />
      <Pressable
        style={({ pressed }) => [
          styles.btnRegistrar,
          desabilitado ? styles.btnDesabilitado : null,
          pressed ? styles.btnPressionado : null,
        ]}
        onPress={onSubmit}
        disabled={carregando || desabilitado}>
        {carregando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.textRegistrar}>{modoEdicao ? 'Salvar alterações' : 'Registrar'}</Text>
        )}
      </Pressable>
    </View>
  );
}

function Campo({ rotulo, valor, onChange, placeholder, teclado, multiline, t }) {
  return (
    <View style={styles.campoGrupo}>
      <Text style={[styles.textCodigo, { color: t.textoSecundario }]}>{rotulo}</Text>
      <TextInput
        style={[
          styles.inputBase,
          multiline ? styles.inputMultiline : null,
          !multiline ? styles.inputSimples : null,
          { backgroundColor: t.campo, borderColor: t.borda, color: t.texto },
        ]}
        placeholder={placeholder}
        placeholderTextColor={t.placeholder}
        value={valor}
        onChangeText={onChange}
        keyboardType={teclado}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    marginHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    ...sombraLeve,
  },
  containerP: {
    marginBottom: 14,
  },
  textDescri: {
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: 5,
    color: cores.cinzaTexto,
    fontFamily: fontes.padrao,
  },
  containerS: {
    minHeight: 112,
    borderWidth: 1,
    justifyContent: 'center',
    borderRadius: 15,
  },
  descri: {
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    minHeight: 112,
    fontFamily: fontes.campo,
  },
  codigo: {
    marginBottom: 14,
    borderRadius: 15,
    justifyContent: 'center',
  },
  codInput: {
    fontSize: 15,
    borderWidth: 1,
    height: 40,
    borderRadius: 14,
    fontFamily: fontes.campo,
    paddingHorizontal: 12,
  },
  inputBase: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 14,
    fontFamily: fontes.campo,
    paddingHorizontal: 12,
  },
  inputSimples: {
    height: 48,
  },
  secaoTitulo: {
    fontFamily: fontes.padraoBold,
    fontSize: 17,
    marginTop: 4,
    marginBottom: 12,
  },
  linhaCampos: {
    flexDirection: 'row',
    gap: 10,
  },
  campoGrupo: {
    flex: 1,
    marginBottom: 18,
  },
  inputMultiline: {
    height: 104,
    paddingTop: 12,
    paddingBottom: 12,
    lineHeight: 20,
  },
  textCodigo: {
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: 5,
    color: cores.cinzaTexto,
    fontFamily: fontes.padrao,
  },
  ajudaQr: {
    fontFamily: fontes.padrao,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
    marginBottom: 18,
  },
  btnRegistrar: {
    height: 45,
    width: '100%',
    borderRadius: 14,
    backgroundColor: cores.roxo,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRegistrar: {
    color: 'white',
    fontFamily: fontes.botao,
  },
  btnDesabilitado: {
    opacity: 0.5,
  },
  btnPressionado: {
    backgroundColor: '#7440d6',
  },
  erro: {
    color: cores.erro,
    fontFamily: fontes.padrao,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
});
