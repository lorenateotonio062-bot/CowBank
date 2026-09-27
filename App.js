import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppFonts } from './src/theme/fonts';
import { iniciarBanco, haUsuarioLogado } from './src/db/database';
import { cores } from './src/theme/colors';
import { TemaProvider, useTema } from './src/theme/ThemeContext';

import LoginScreen from './src/screens/LoginScreen';
import CriarContaScreen from './src/screens/CriarContaScreen';
import InicialScreen from './src/screens/InicialScreen';
import GruposScreen from './src/screens/GruposScreen';
import CriarGrupoScreen from './src/screens/CriarGrupoScreen';
import RegistrarBovinoScreen from './src/screens/RegistrarBovinoScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import ConfiguracaoScreen from './src/screens/ConfiguracaoScreen';
import RedefinirSenhaEmailScreen from './src/screens/RedefinirSenhaEmailScreen';
import TesteBancoScreen from './src/screens/TesteBancoScreen';
import ScannerQrCodeScreen from './src/screens/ScannerQrCodeScreen';
import AnimalInfoScreen from './src/screens/AnimalInfoScreen';

const Stack = createNativeStackNavigator();

function Navegacao({ rotaInicial }) {
  const { modo, carregarModoSalvo } = useTema();

  useEffect(() => {
    carregarModoSalvo();
  }, [carregarModoSalvo]);

  return (
    <NavigationContainer>
      <StatusBar barStyle={modo === 'escuro' ? 'light-content' : 'dark-content'} />
      <Stack.Navigator initialRouteName={rotaInicial} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CriarConta" component={CriarContaScreen} />
        <Stack.Screen name="Inicial" component={InicialScreen} />
        <Stack.Screen name="Grupos" component={GruposScreen} />
        <Stack.Screen name="CriarGrupo" component={CriarGrupoScreen} />
        <Stack.Screen name="RegistrarBovino" component={RegistrarBovinoScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Configuracao" component={ConfiguracaoScreen} />
        <Stack.Screen name="RedefinirSenhaEmail" component={RedefinirSenhaEmailScreen} />
        <Stack.Screen name="TesteBanco" component={TesteBancoScreen} />
        <Stack.Screen name="ScannerQrCode" component={ScannerQrCodeScreen} />
        <Stack.Screen name="AnimalInfo" component={AnimalInfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const fontesCarregadas = useAppFonts();
  const [bancoPronto, setBancoPronto] = useState(false);
  const [rotaInicial, setRotaInicial] = useState('Login');

  useEffect(() => {
    // Espera o Firebase restaurar a sessão salva: quem já estava logado
    // abre direto na tela Inicial, os demais na tela de Login.
    iniciarBanco()
      .then(() => {
        setRotaInicial(haUsuarioLogado() ? 'Inicial' : 'Login');
        setBancoPronto(true);
      })
      .catch((erro) => {
        console.error('Erro ao iniciar o Firebase:', erro);
        setBancoPronto(true); // segue em frente para não travar o app em caso de erro
      });
  }, []);

  if (!fontesCarregadas || !bancoPronto) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={cores.verde} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <TemaProvider>
        <Navegacao rotaInicial={rotaInicial} />
      </TemaProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
