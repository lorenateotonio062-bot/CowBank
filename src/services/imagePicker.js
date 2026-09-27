import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

function extrairUri(resultado, mensagemErro) {
  if (resultado.didCancel) return null;

  if (resultado.errorCode) {
    const erro = new Error(resultado.errorMessage || mensagemErro);
    erro.code = resultado.errorCode;
    throw erro;
  }

  return resultado.assets?.[0]?.uri ?? null;
}

export async function tirarFoto() {
  const resultado = await launchCamera({
    mediaType: 'photo',
    quality: 0.75,
    includeBase64: false,
    saveToPhotos: false,
  });

  return extrairUri(resultado, 'Não foi possível abrir a câmera.');
}

export async function escolherImagemGaleria() {
  const resultado = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 0.7,
    includeBase64: false,
  });

  return extrairUri(resultado, 'Não foi possível abrir a galeria.');
}

export async function escolherImagemPerfil() {
  return escolherImagemGaleria();
}
