import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { fontes } from '../../theme/fonts';

// Aviso rápido, não-bloqueante, pra confirmações simples (ex: "Perfil
// atualizado", "Grupo excluído") — some sozinho depois de um tempo, sem
// exigir que a pessoa toque em "OK" como o Alert.alert exige.
//
// `chave` deve mudar toda vez que uma nova mensagem precisa aparecer
// (mesmo repetindo o mesmo texto), pra reiniciar a animação.
export default function Toast({ mensagem, chave }) {
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!mensagem) return;
    opacidade.setValue(0);
    Animated.sequence([
      Animated.timing(opacidade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacidade, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [chave]);

  if (!mensagem) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity: opacidade }]}>
      <Text style={styles.texto}>{mensagem}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // acima do rodapé de navegação, que agora é fixo no fim da tela
    bottom: 120,
    left: 30,
    right: 30,
    backgroundColor: 'rgba(40,40,40,0.92)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  texto: {
    color: 'white',
    fontFamily: fontes.padraoMedio,
    fontSize: 13,
    textAlign: 'center',
  },
});
