import { useState, forwardRef } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

// Campo de senha com um "olho" para mostrar/ocultar o texto digitado.
//
// O `style` recebido vai direto no TextInput — ou seja, a caixa é o mesmo
// elemento, com as mesmas medidas, de um campo comum da tela. O olho é
// desenhado POR CIMA (posição absoluta), então não ocupa espaço nem
// empurra a largura do campo. Antes o estilo ia num envoltório e o olho
// somava largura, deixando os campos de senha mais largos que os demais.
const CampoSenha = forwardRef(function CampoSenha(
  { style, inputStyle, value, onChangeText, placeholder, ...props },
  ref
) {
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TextInput
        ref={ref}
        style={[style, inputStyle, styles.espacoParaOlho]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!visivel}
        autoCapitalize="none"
        {...props}
      />
      <Pressable
        onPress={() => setVisivel((v) => !v)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.botaoOlho}
        accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}>
        <Text style={styles.olho}>{visivel ? '🙈' : '👁️'}</Text>
      </Pressable>
    </View>
  );
});

export default CampoSenha;

const styles = StyleSheet.create({
  wrapper: {
    // encolhe no tamanho do campo, sem interferir no alinhamento da tela
    position: 'relative',
    justifyContent: 'center',
  },
  espacoParaOlho: {
    // reserva espaço interno para o texto não passar por baixo do ícone
    paddingRight: 44,
  },
  botaoOlho: {
    position: 'absolute',
    right: 14,
    padding: 2,
  },
  olho: {
    fontSize: 18,
  },
});
