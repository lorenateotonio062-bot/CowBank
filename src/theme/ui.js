import { Platform } from 'react-native';

export const raio = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
};

export const sombra = Platform.select({
  ios: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

export const sombraLeve = Platform.select({
  ios: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  android: {
    elevation: 2,
  },
  default: {},
});
