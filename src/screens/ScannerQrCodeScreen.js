import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import TelaBase from '../components/comuns/TelaBase';
import { getBovino } from '../db/database';
import { cores } from '../theme/colors';
import { fontes } from '../theme/fonts';
import { useTema } from '../theme/ThemeContext';
import { extrairAnimalIdDoQr } from '../utils/animalQr';

const { CowQrScanner } = NativeModules;

export default function ScannerQrCodeScreen({ navigation }) {
  const { t } = useTema();
  const [mensagem, setMensagem] = useState('Abrindo câmera para leitura do QR Code...');
  const [lendo, setLendo] = useState(false);
  const [ultimoCodigo, setUltimoCodigo] = useState('');
  const scannerAberto = useRef(false);
  const montado = useRef(true);

  const processarCodigo = useCallback(
    async (valor) => {
      const texto = String(valor ?? '').trim();
      setUltimoCodigo(texto);

      const animalId = extrairAnimalIdDoQr(texto);
      if (!animalId) {
        setMensagem('QR Code inválido para este aplicativo.');
        setLendo(false);
        return;
      }

      setMensagem('Buscando registro do animal...');
      setLendo(true);
      try {
        const bovino = await getBovino(animalId);
        if (!montado.current) return;

        if (bovino) {
          navigation.replace('AnimalInfo', { bovino, qrLido: texto });
          return;
        }

        setMensagem('Nenhum animal foi encontrado para este QR Code.');
        setLendo(false);
      } catch (e) {
        if (!montado.current) return;
        setMensagem(e.message || 'Não foi possível buscar o bovino.');
        setLendo(false);
      }
    },
    [navigation]
  );

  const abrirScanner = useCallback(async () => {
    if (scannerAberto.current || lendo) return;

    if (Platform.OS !== 'android' || !CowQrScanner?.scan) {
      Alert.alert(
        'Leitor de QR Code',
        'O leitor pela câmera está disponível no Android nesta versão.'
      );
      navigation.goBack();
      return;
    }

    scannerAberto.current = true;
    setLendo(true);
    setMensagem('Aponte a câmera para o QR Code fixado no animal.');

    try {
      const valor = await CowQrScanner.scan();
      scannerAberto.current = false;
      if (!montado.current) return;
      await processarCodigo(valor);
    } catch (e) {
      scannerAberto.current = false;
      if (!montado.current) return;

      setLendo(false);
      if (e?.code === 'cancelled') {
        navigation.goBack();
        return;
      }

      setMensagem(e?.message || 'Não foi possível iniciar a câmera.');
    }
  }, [lendo, navigation, processarCodigo]);

  useEffect(() => {
    montado.current = true;
    const timer = setTimeout(abrirScanner, 250);

    return () => {
      montado.current = false;
      clearTimeout(timer);
    };
  }, [abrirScanner]);

  return (
    <TelaBase backgroundColor={t.fundo} paddingInferior={24}>
      <View style={styles.estado}>
        <View style={[styles.icone, { backgroundColor: t.verdeSuave }]}>
          <Text style={[styles.iconeTexto, { color: t.verde }]}>QR</Text>
        </View>

        <Text style={[styles.titulo, { color: t.texto }]}>Escanear animal</Text>
        <Text style={[styles.texto, { color: t.textoSecundario }]}>{mensagem}</Text>

        {lendo ? <ActivityIndicator color={cores.verde} style={styles.loader} /> : null}

        {ultimoCodigo ? (
          <Text style={[styles.codigoLido, { color: t.textoSecundario }]} numberOfLines={2}>
            Última leitura: {ultimoCodigo}
          </Text>
        ) : null}

        <Pressable style={styles.botao} onPress={abrirScanner} disabled={lendo}>
          <Text style={styles.botaoTexto}>{lendo ? 'Câmera aberta' : 'Abrir câmera'}</Text>
        </Pressable>

        <Pressable style={styles.link} onPress={() => navigation.goBack()}>
          <Text style={[styles.linkTexto, { color: t.textoSecundario }]}>Voltar</Text>
        </Pressable>
      </View>
    </TelaBase>
  );
}

const styles = StyleSheet.create({
  estado: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  icone: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  iconeTexto: {
    fontFamily: fontes.padraoBold,
    fontSize: 24,
  },
  titulo: {
    fontFamily: fontes.padraoBold,
    fontSize: 26,
    textAlign: 'center',
  },
  texto: {
    fontFamily: fontes.padrao,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  loader: {
    marginTop: 22,
  },
  codigoLido: {
    fontFamily: fontes.padrao,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 16,
    textAlign: 'center',
  },
  botao: {
    height: 50,
    borderRadius: 14,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  botaoTexto: {
    color: cores.branco,
    fontFamily: fontes.botao,
  },
  link: {
    padding: 16,
    alignItems: 'center',
  },
  linkTexto: {
    fontFamily: fontes.padraoMedio,
    textDecorationLine: 'underline',
  },
});
