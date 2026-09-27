import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

function nomeArquivoQr(bovino) {
  const base = String(bovino?.nome || bovino?.codigo || bovino?.id || 'animal')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `cowbank-qr-${base || 'animal'}.png`;
}

export function gerarCaminhoQr(bovino) {
  return `${RNFS.CachesDirectoryPath}/${nomeArquivoQr(bovino)}`;
}

export function criarMensagemQr(bovino) {
  const nome = bovino?.nome ? ` de ${bovino.nome}` : '';
  const codigo = bovino?.codigo ? `\nID/brinco: ${bovino.codigo}` : '';
  return `QR Code CowBank${nome}.${codigo}`;
}

export async function escreverQrBase64NoArquivo(base64, bovino) {
  const caminho = gerarCaminhoQr(bovino);
  await RNFS.writeFile(caminho, base64, 'base64');
  return caminho;
}

async function pedirPermissaoGaleria() {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 33) {
    const resultado = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
    return resultado === PermissionsAndroid.RESULTS.GRANTED;
  }
  const resultado = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
  return resultado === PermissionsAndroid.RESULTS.GRANTED;
}

export async function salvarQrNaGaleria(caminho) {
  const permitido = await pedirPermissaoGaleria();
  if (!permitido) {
    throw new Error('Permissão para salvar imagens não concedida.');
  }
  await CameraRoll.save(`file://${caminho}`, { type: 'photo', album: 'CowBank' });
}

export async function compartilharQr(caminho, bovino) {
  await Share.open({
    title: 'Compartilhar QR Code',
    message: criarMensagemQr(bovino),
    url: `file://${caminho}`,
    type: 'image/png',
    failOnCancel: false,
  });
}

export async function enviarQrWhatsApp(caminho, bovino) {
  await Share.shareSingle({
    social: Share.Social.WHATSAPP,
    message: criarMensagemQr(bovino),
    url: `file://${caminho}`,
    type: 'image/png',
    failOnCancel: false,
  });
}

export function mostrarErroQr(e) {
  Alert.alert('QR Code', e?.message || 'Não foi possível concluir a ação.');
}
