import { useRef, useState } from 'react';
import { Alert, Text, View, StyleSheet, Image, Pressable, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { cores } from '../../theme/colors';
import { fontes } from '../../theme/fonts';
import { sombraLeve } from '../../theme/ui';
import { useTema } from '../../theme/ThemeContext';
import { criarPayloadAnimalQr } from '../../utils/animalQr';
import {
  compartilharQr,
  enviarQrWhatsApp,
  escreverQrBase64NoArquivo,
  mostrarErroQr,
  salvarQrNaGaleria,
} from '../../utils/qrShare';

const BADGES_POR_TIPO = {
  Vaca: require('../../../assets/images/badge-vaca.png'),
  Bezerro: require('../../../assets/images/badge-bezerro.png'),
  Boi: require('../../../assets/images/badge-boi.png'),
};

export default function Cartao({ bovino, onSolicitarExclusao, onEditar }) {
  const { t } = useTema();
  const [registroAberto, setRegistroAberto] = useState(false);
  const qrRef = useRef(null);

  async function prepararArquivoQr() {
    return new Promise((resolve, reject) => {
      if (!qrRef.current?.toDataURL) {
        reject(new Error('QR Code ainda não está pronto.'));
        return;
      }
      qrRef.current.toDataURL(async (base64) => {
        try {
          resolve(await escreverQrBase64NoArquivo(base64, bovino));
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  async function handleSalvarQr() {
    try {
      const caminho = await prepararArquivoQr();
      await salvarQrNaGaleria(caminho);
      Alert.alert('QR Code salvo', 'A imagem foi salva na galeria.');
    } catch (e) {
      mostrarErroQr(e);
    }
  }

  async function handleCompartilharQr() {
    try {
      const caminho = await prepararArquivoQr();
      await compartilharQr(caminho, bovino);
    } catch (e) {
      mostrarErroQr(e);
    }
  }

  async function handleEnviarWhatsApp() {
    try {
      const caminho = await prepararArquivoQr();
      await enviarQrWhatsApp(caminho, bovino);
    } catch (e) {
      mostrarErroQr(e);
    }
  }

  return (
    <View style={[styles.contCard, { backgroundColor: t.card, borderColor: t.borda }]}>
      <View style={[styles.fotoC, { backgroundColor: t.verdeSuave }]}>
        <View style={styles.imagemWrapper}>
          <Image style={styles.imagem} source={require('../../../assets/images/vaquinha.png')} />
          {BADGES_POR_TIPO[bovino.tipo] ? (
            <Image style={styles.badge} source={BADGES_POR_TIPO[bovino.tipo]} />
          ) : null}
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.topoInfo}>
          <Text style={[styles.infoTitu, { color: t.texto }]} numberOfLines={1}>{bovino.nome}</Text>
          <View style={[styles.tipoPill, { backgroundColor: t.roxoSuave }]}>
            <Text style={styles.tipoTexto}>{bovino.tipo}</Text>
          </View>
        </View>
        <Text style={[styles.codigo, { color: t.textoSecundario }]}>ID {bovino.codigo || '-'}</Text>
        <Text style={[styles.infoReg, { color: t.textoSecundario }]} numberOfLines={2}>
          {bovino.descricao || 'Sem descrição.'}
        </Text>
        <View style={styles.acoes}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              pressed ? { backgroundColor: t.roxoSuave } : null,
            ]}
            onPress={() => setRegistroAberto(true)}
            accessibilityLabel={`Ver registro de ${bovino.nome}`}>
            <Text style={styles.btnText}>Ver registro</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.btnEditar,
              { backgroundColor: t.verdeSuave },
              pressed ? styles.btnPressionado : null,
            ]}
            onPress={() => onEditar?.(bovino)}
            accessibilityLabel={`Editar ${bovino.nome}`}>
            <Text style={styles.btnEditarText}>Editar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.delC, { backgroundColor: t.deletarSuave }, pressed ? styles.delCPressionado : null]}
            onPress={() => onSolicitarExclusao(bovino)}
            accessibilityLabel={`Excluir ${bovino.nome}`}>
            <Image style={styles.lixeira} source={require('../../../assets/images/lixeira.png')} />
          </Pressable>
        </View>
      </View>
      <Modal
        visible={registroAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setRegistroAberto(false)}>
        <Pressable
          style={[styles.modalFundo, { backgroundColor: t.overlay }]}
          onPress={() => setRegistroAberto(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: t.card, borderColor: t.borda }]}
            onPress={() => {}}>
            <View style={styles.modalTopo}>
              <View style={[styles.modalIcone, { backgroundColor: t.verdeSuave }]}>
                <Image style={styles.modalImagem} source={require('../../../assets/images/vaquinha.png')} />
                {BADGES_POR_TIPO[bovino.tipo] ? (
                  <Image style={styles.modalBadge} source={BADGES_POR_TIPO[bovino.tipo]} />
                ) : null}
              </View>
              <View style={styles.modalTituloBox}>
                <Text style={[styles.modalTitulo, { color: t.texto }]} numberOfLines={2}>
                  {bovino.nome}
                </Text>
                <View style={[styles.tipoPill, styles.modalTipoPill, { backgroundColor: t.roxoSuave }]}>
                  <Text style={styles.tipoTexto}>{bovino.tipo}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.divisor, { backgroundColor: t.divisoria }]} />

            <LinhaRegistro rotulo="ID / brinco" valor={bovino.codigo || '-'} t={t} />
            <View style={styles.qrBox}>
              <QRCode
                value={criarPayloadAnimalQr(bovino)}
                size={150}
                getRef={(ref) => {
                  qrRef.current = ref;
                }}
              />
            </View>
            <Text style={[styles.qrTexto, { color: t.textoSecundario }]}>
              QR Code do registro para fixar no animal.
            </Text>
            <View style={styles.qrAcoes}>
              <Pressable style={[styles.qrAcao, { borderColor: t.borda }]} onPress={handleSalvarQr}>
                <Text style={[styles.qrAcaoTexto, { color: t.texto }]}>Salvar</Text>
              </Pressable>
              <Pressable style={[styles.qrAcao, { borderColor: t.borda }]} onPress={handleCompartilharQr}>
                <Text style={[styles.qrAcaoTexto, { color: t.texto }]}>Compartilhar</Text>
              </Pressable>
              <Pressable style={styles.qrAcaoWhats} onPress={handleEnviarWhatsApp}>
                <Text style={styles.qrAcaoWhatsTexto}>WhatsApp</Text>
              </Pressable>
            </View>
            <View style={styles.blocoDescricao}>
              <Text style={[styles.modalRotulo, { color: t.textoSecundario }]}>Descrição</Text>
              <Text style={[styles.modalValor, { color: t.texto }]}>
                {bovino.descricao || 'Sem descrição.'}
              </Text>
            </View>

            <View style={styles.modalAcoes}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtnSecundario,
                  { borderColor: t.borda },
                  pressed ? { backgroundColor: t.fundoNeutro } : null,
                ]}
                onPress={() => setRegistroAberto(false)}>
                <Text style={[styles.modalBtnSecundarioTexto, { color: t.texto }]}>Fechar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtnPrimario,
                  pressed ? styles.btnPressionado : null,
                ]}
                onPress={() => {
                  setRegistroAberto(false);
                  onEditar?.(bovino);
                }}>
                <Text style={styles.modalBtnPrimarioTexto}>Editar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function LinhaRegistro({ rotulo, valor, t }) {
  return (
    <View style={styles.linhaRegistro}>
      <Text style={[styles.modalRotulo, { color: t.textoSecundario }]}>{rotulo}</Text>
      <Text style={[styles.modalValor, { color: t.texto }]} selectable>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contCard: {
    width: '100%',
    minHeight: 166,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: cores.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    ...sombraLeve,
  },
  fotoC: {
    width: 96,
    height: 126,
    borderRadius: 18,
    backgroundColor: cores.verdeSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minHeight: 126,
    marginLeft: 14,
  },
  topoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitu: {
    fontFamily: fontes.padraoSemiBold,
    fontSize: 17,
    color: cores.cinzaTexto,
    flex: 1,
  },
  tipoPill: {
    borderRadius: 999,
    backgroundColor: cores.roxoSuave,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 8,
  },
  tipoTexto: {
    color: cores.roxoEscuro,
    fontFamily: fontes.padraoMedio,
    fontSize: 11,
  },
  codigo: {
    color: cores.textoSecundario,
    fontFamily: fontes.padraoMedio,
    fontSize: 12,
    marginTop: 4,
  },
  infoReg: {
    color: cores.textoSecundario,
    fontFamily: fontes.padrao,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  imagemWrapper: {
    width: 74,
    height: 74,
  },
  imagem: {
    width: 74,
    height: 74,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 26,
    height: 26,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.roxo,
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  btnPressionado: {
    backgroundColor: cores.roxoSuave,
  },
  btnText: {
    color: cores.roxo,
    fontFamily: fontes.botao,
    fontSize: 12,
  },
  btnEditar: {
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEditarText: {
    color: cores.verdeEscuro,
    fontFamily: fontes.botao,
    fontSize: 12,
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  delC: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: cores.deletarSuave,
    justifyContent: 'center',
    alignItems: 'center',
  },
  delCPressionado: {
    opacity: 0.5,
  },
  lixeira: {
    width: 34,
    height: 34,
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    ...sombraLeve,
  },
  modalTopo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcone: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImagem: {
    width: 58,
    height: 58,
  },
  modalBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    width: 24,
    height: 24,
  },
  modalTituloBox: {
    flex: 1,
    marginLeft: 14,
  },
  modalTitulo: {
    fontFamily: fontes.padraoBold,
    fontSize: 22,
    lineHeight: 27,
  },
  modalTipoPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 0,
  },
  divisor: {
    height: 1,
    marginVertical: 16,
  },
  linhaRegistro: {
    marginBottom: 12,
  },
  blocoDescricao: {
    marginTop: 2,
  },
  qrBox: {
    alignSelf: 'center',
    backgroundColor: cores.branco,
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
  },
  qrTexto: {
    fontFamily: fontes.padrao,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 14,
  },
  qrAcoes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  qrAcao: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qrAcaoTexto: {
    fontFamily: fontes.botao,
    fontSize: 11,
  },
  qrAcaoWhats: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qrAcaoWhatsTexto: {
    color: cores.branco,
    fontFamily: fontes.botao,
    fontSize: 11,
  },
  modalRotulo: {
    fontFamily: fontes.padraoMedio,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalValor: {
    fontFamily: fontes.padrao,
    fontSize: 15,
    lineHeight: 21,
  },
  modalAcoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtnSecundario: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSecundarioTexto: {
    fontFamily: fontes.botao,
  },
  modalBtnPrimario: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimarioTexto: {
    color: cores.branco,
    fontFamily: fontes.botao,
  },
});
