import { useEffect, useRef, useState } from 'react';
import { Alert, View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import TelaBase from '../components/comuns/TelaBase';
import { getGrupo } from '../db/database';
import { cores } from '../theme/colors';
import { fontes } from '../theme/fonts';
import { sombra } from '../theme/ui';
import { useTema } from '../theme/ThemeContext';
import { criarPayloadAnimalQr } from '../utils/animalQr';
import {
  compartilharQr,
  enviarQrWhatsApp,
  escreverQrBase64NoArquivo,
  mostrarErroQr,
  salvarQrNaGaleria,
} from '../utils/qrShare';

const BADGES_POR_TIPO = {
  Vaca: require('../../assets/images/badge-vaca.png'),
  Bezerro: require('../../assets/images/badge-bezerro.png'),
  Boi: require('../../assets/images/badge-boi.png'),
};

export default function AnimalInfoScreen({ navigation, route }) {
  const { t } = useTema();
  const bovino = route.params?.bovino;
  const qrLido = route.params?.qrLido;
  const [nomeGrupo, setNomeGrupo] = useState('');
  const qrRef = useRef(null);
  const proximaAlimentacao = calcularProximaAlimentacao(
    bovino?.ultimaAlimentacao,
    bovino?.intervaloAlimentacaoHoras
  );

  useEffect(() => {
    if (!bovino?.grupo_id) return;
    getGrupo(bovino.grupo_id)
      .then((grupo) => setNomeGrupo(grupo?.nome ?? ''))
      .catch(() => {});
  }, [bovino?.grupo_id]);

  if (!bovino) {
    return (
      <TelaBase backgroundColor={t.fundo} paddingInferior={24}>
        <View style={styles.estado}>
          <Text style={[styles.titulo, { color: t.texto }]}>Animal não encontrado</Text>
          <Pressable style={styles.botao} onPress={() => navigation.replace('ScannerQrCode')}>
            <Text style={styles.botaoTexto}>Escanear novamente</Text>
          </Pressable>
        </View>
      </TelaBase>
    );
  }

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
    <TelaBase backgroundColor={t.fundo} paddingInferior={24}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.borda }]}>
          <View style={[styles.hero, { backgroundColor: t.verdeSuave }]}>
            <Image
              style={bovino.foto_uri ? styles.fotoAnimal : styles.imagem}
              source={bovino.foto_uri ? { uri: bovino.foto_uri } : require('../../assets/images/vaquinha.png')}
            />
            {BADGES_POR_TIPO[bovino.tipo] ? (
              <Image style={styles.badge} source={BADGES_POR_TIPO[bovino.tipo]} />
            ) : null}
          </View>

          <Text style={[styles.titulo, { color: t.texto }]}>{bovino.nome}</Text>
          <View style={[styles.tipoPill, { backgroundColor: t.roxoSuave }]}>
            <Text style={styles.tipoTexto}>{bovino.tipo}</Text>
          </View>

          <View style={[styles.divisor, { backgroundColor: t.divisoria }]} />

          <View style={styles.gridResumo}>
            <ResumoItem rotulo="ID / brinco" valor={bovino.codigo || '-'} t={t} />
            <ResumoItem rotulo="Grupo" valor={nomeGrupo || bovino.grupo_id || '-'} t={t} />
            <ResumoItem rotulo="Peso" valor={bovino.pesoKg ? `${bovino.pesoKg} kg` : '-'} t={t} />
            <ResumoItem rotulo="Altura" valor={bovino.alturaCm ? `${bovino.alturaCm} cm` : '-'} t={t} />
          </View>
          {qrLido ? <Linha rotulo="Leitura" valor="QR Code validado" t={t} /> : null}

          <Secao titulo="Manejo e alimentação" t={t}>
            <Linha rotulo="Alimentação" valor={bovino.alimentacao || 'Não informada.'} t={t} />
            <Linha rotulo="Última alimentação" valor={formatarDataHora(bovino.ultimaAlimentacao)} t={t} />
            <Linha
              rotulo="Intervalo calculado"
              valor={bovino.intervaloAlimentacaoHoras ? `A cada ${bovino.intervaloAlimentacaoHoras} hora(s)` : '-'}
              t={t}
            />
            <Linha rotulo="Próxima alimentação" valor={proximaAlimentacao} t={t} destaque />
          </Secao>

          <Secao titulo="Sanidade" t={t}>
            <Linha rotulo="Vacinas" valor={bovino.vacinas || 'Sem vacinas registradas.'} t={t} />
            <Linha
              rotulo="Observações sanitárias"
              valor={bovino.observacoesSanitarias || 'Sem observações.'}
              t={t}
            />
          </Secao>

          <Secao titulo="QR Code gravado" t={t}>
            <Linha rotulo="Payload" valor={criarPayloadAnimalQr(bovino)} t={t} />
          </Secao>

          <View style={[styles.qrBox, { backgroundColor: cores.branco }]}>
            <QRCode
              value={criarPayloadAnimalQr(bovino)}
              size={156}
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
            <Pressable style={[styles.qrAcaoWhats, { backgroundColor: cores.verde }]} onPress={handleEnviarWhatsApp}>
              <Text style={styles.qrAcaoWhatsTexto}>WhatsApp</Text>
            </Pressable>
          </View>

          <View style={styles.blocoDescricao}>
            <Text style={[styles.rotulo, { color: t.textoSecundario }]}>Descrição</Text>
            <Text style={[styles.valor, { color: t.texto }]}>
              {bovino.descricao || 'Sem descrição.'}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.botao}
          onPress={() => navigation.navigate('RegistrarBovino', {
            grupoId: bovino.grupo_id,
            bovinoId: bovino.id,
          })}>
          <Text style={styles.botaoTexto}>Editar animal</Text>
        </Pressable>
        <Pressable
          style={[styles.botaoSecundario, { borderColor: t.borda }]}
          onPress={() => navigation.replace('ScannerQrCode')}>
          <Text style={[styles.botaoSecundarioTexto, { color: t.texto }]}>Escanear outro</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => navigation.goBack()}>
          <Text style={[styles.linkTexto, { color: t.textoSecundario }]}>Voltar</Text>
        </Pressable>
      </ScrollView>
    </TelaBase>
  );
}

function Linha({ rotulo, valor, t }) {
  return (
    <View style={styles.linha}>
      <Text style={[styles.rotulo, { color: t.textoSecundario }]}>{rotulo}</Text>
      <Text style={[styles.valor, { color: t.texto }]} selectable>{valor}</Text>
    </View>
  );
}

function ResumoItem({ rotulo, valor, t }) {
  return (
    <View style={[styles.resumoItem, { backgroundColor: t.fundoNeutro, borderColor: t.borda }]}>
      <Text style={[styles.rotulo, { color: t.textoSecundario }]}>{rotulo}</Text>
      <Text style={[styles.resumoValor, { color: t.texto }]} numberOfLines={2}>{valor}</Text>
    </View>
  );
}

function Secao({ titulo, children, t }) {
  return (
    <View style={[styles.secao, { borderColor: t.borda }]}>
      <Text style={[styles.secaoTitulo, { color: t.texto }]}>{titulo}</Text>
      {children}
    </View>
  );
}

function formatarDataHora(valor) {
  if (!valor) return '-';
  const data = parseDataHora(valor);
  if (!data) return valor;
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calcularProximaAlimentacao(ultima, intervaloHoras) {
  const data = parseDataHora(ultima);
  const intervalo = Number(String(intervaloHoras ?? '').replace(',', '.'));
  if (!data || !Number.isFinite(intervalo) || intervalo <= 0) return '-';
  return formatarDataHora(new Date(data.getTime() + intervalo * 60 * 60 * 1000).toISOString());
}

function parseDataHora(valor) {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor;
  const texto = String(valor ?? '').trim();
  if (!texto) return null;
  const normalizado = texto.includes('T') ? texto : texto.replace(' ', 'T');
  const data = new Date(normalizado);
  return Number.isNaN(data.getTime()) ? null : data;
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 32,
  },
  estado: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    ...sombra,
  },
  hero: {
    width: 132,
    height: 132,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagem: {
    width: 84,
    height: 84,
  },
  fotoAnimal: {
    width: 132,
    height: 132,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 6,
    width: 30,
    height: 30,
  },
  titulo: {
    fontFamily: fontes.padraoBold,
    fontSize: 26,
    marginTop: 16,
    textAlign: 'center',
  },
  tipoPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  tipoTexto: {
    color: cores.roxoEscuro,
    fontFamily: fontes.padraoSemiBold,
    fontSize: 12,
  },
  divisor: {
    height: 1,
    alignSelf: 'stretch',
    marginVertical: 18,
  },
  linha: {
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  gridResumo: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  resumoItem: {
    width: '48%',
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  resumoValor: {
    fontFamily: fontes.padraoBold,
    fontSize: 16,
  },
  secao: {
    alignSelf: 'stretch',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  secaoTitulo: {
    fontFamily: fontes.padraoBold,
    fontSize: 18,
    marginBottom: 12,
  },
  blocoDescricao: {
    alignSelf: 'stretch',
    marginTop: 2,
  },
  rotulo: {
    fontFamily: fontes.padraoMedio,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  valor: {
    fontFamily: fontes.padrao,
    fontSize: 15,
    lineHeight: 21,
  },
  qrBox: {
    padding: 14,
    borderRadius: 18,
    marginTop: 4,
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
    alignSelf: 'stretch',
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
    paddingHorizontal: 8,
  },
  qrAcaoTexto: {
    fontFamily: fontes.botao,
    fontSize: 12,
  },
  qrAcaoWhats: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  qrAcaoWhatsTexto: {
    color: cores.branco,
    fontFamily: fontes.botao,
    fontSize: 12,
  },
  botao: {
    height: 50,
    borderRadius: 14,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  botaoTexto: {
    color: cores.branco,
    fontFamily: fontes.botao,
  },
  botaoSecundario: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  botaoSecundarioTexto: {
    fontFamily: fontes.botao,
  },
  link: {
    alignItems: 'center',
    padding: 16,
  },
  linkTexto: {
    fontFamily: fontes.padraoMedio,
    textDecorationLine: 'underline',
  },
});
