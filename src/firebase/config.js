import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do app Web do Firebase (Console > Configurações do projeto >
// Geral > "Seus apps" > Configuração do SDK).
//
// Esses valores NÃO são segredo (o Firebase foi feito para ficarem no app).
// Quem protege os dados são as REGRAS DO FIRESTORE (firestore.rules) e o login.
// Dica: no Google Cloud Console > APIs e serviços > Credenciais, você pode
// restringir essa chave de API ao seu app (pacote com.cowbank.app).
const firebaseConfig = {
  apiKey: 'AIzaSyA6jt9phXdCXFAwARCQPA3_WzWSFAGAEiw',
  authDomain: 'cowbank-3e3b3.firebaseapp.com',
  projectId: 'cowbank-3e3b3',
  storageBucket: 'cowbank-3e3b3.firebasestorage.app',
  messagingSenderId: '813804113005',
  appId: '1:813804113005:web:869f5205b8f32fe2cd8364',
  measurementId: 'G-LXZWYCQEHZ',
};

// (O Firebase Analytics foi removido de propósito: o SDK web depende de
// window/document/cookies e não funciona bem no React Native.)

export function firebaseConfigurado() {
  return !Object.values(firebaseConfig).some((v) => String(v).startsWith('COLE_AQUI'));
}

// getApps() evita "app já inicializado" quando o Fast Refresh recarrega este arquivo.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function criarAuth() {
  // Na web o Firebase já guarda a sessão sozinho; no celular precisamos
  // apontar o AsyncStorage para o usuário continuar logado ao fechar o app.
  if (Platform.OS === 'web') return getAuth(app);
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (e) {
    // já foi inicializado (recarregamento do app em desenvolvimento)
    return getAuth(app);
  }
}

function criarFirestore() {
  try {
    // Auto-detect evita travamentos de conexão que o Firestore às vezes tem
    // em React Native (WebChannel). Só troca para "long polling" se precisar.
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch (e) {
    return getFirestore(app);
  }
}

export const auth = criarAuth();
export const db = criarFirestore();
export const storage = getStorage(app);

// E-mails do Firebase (ex.: redefinição de senha) saem em português.
auth.languageCode = 'pt-BR';
