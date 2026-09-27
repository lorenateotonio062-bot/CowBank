import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

// Campo de busca com um "x" para limpar rapidamente — some quando o campo
// está vazio. O `style` recebido é aplicado no envoltório, igual ao
// CampoSenha, pra manter o visual original da caixa.
export default function CampoBusca({ style, inputStyle, value, onChangeText, placeholder, ...props }) {
  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={[styles.input, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        {...props}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.botaoLimpar}>
          <Text style={styles.x}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  botaoLimpar: {
    paddingLeft: 8,
  },
  x: {
    fontSize: 13,
    color: '#999',
  },
});
