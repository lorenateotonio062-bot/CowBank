import { createContext, useContext, useState, useCallback } from 'react';

import { getUsuario, salvarTema } from '../db/database';
import { cores } from './colors';

const paletas = {
  claro: {
    fundo: cores.fundoTela,
    fundoNeutro: cores.fundoNeutro,
    card: cores.card,
    campo: cores.branco,
    borda: cores.borda,
    texto: cores.cinzaTexto,
    textoSecundario: cores.textoSecundario,
    textoInvertido: cores.branco,
    divisoria: '#eaecf0',
    verdeSuave: cores.verdeSuave,
    roxoSuave: cores.roxoSuave,
    deletarSuave: cores.deletarSuave,
    overlay: 'rgba(16,24,40,0.48)',
    placeholder: '#98a2b3',
  },
  escuro: {
    fundo: '#0f1612',
    fundoNeutro: '#141d18',
    card: '#18231d',
    campo: '#111a15',
    borda: '#2b3a31',
    texto: '#f4f7f5',
    textoSecundario: '#a9b8af',
    textoInvertido: cores.branco,
    divisoria: '#26352d',
    verdeSuave: '#203b19',
    roxoSuave: '#261f3d',
    deletarSuave: '#3c1c1c',
    overlay: 'rgba(0,0,0,0.62)',
    placeholder: '#7d8f84',
  },
};

const TemaContext = createContext({
  modo: 'claro',
  t: paletas.claro,
  definirModo: () => {},
});

export function TemaProvider({ children }) {
  const [modo, setModo] = useState('claro');

  const carregarModoSalvo = useCallback(async () => {
    // Sem usuário logado (ex.: depois de sair) volta ao tema claro.
    try {
      const usuario = await getUsuario();
      setModo(usuario?.tema === 'escuro' ? 'escuro' : 'claro');
    } catch (e) {
      // sem conexão: mantém o tema atual
    }
  }, []);

  const definirModo = useCallback(async (novoModo) => {
    setModo(novoModo);
    try {
      await salvarTema(novoModo);
    } catch (e) {
      // se não conseguir salvar, o app continua funcionando só que o
      // modo escolhido não persiste entre sessões — não é crítico.
    }
  }, []);

  return (
    <TemaContext.Provider
      value={{ modo, t: paletas[modo], definirModo, carregarModoSalvo }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
