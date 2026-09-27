import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

import TelaBase from '../components/comuns/TelaBase';
import { haUsuarioLogado } from '../db/database';
import { executarTestes, listarTestes, resumir } from '../db/testarBanco';
import { cores } from '../theme/colors';
import { fontes } from '../theme/fonts';
import { useTema } from '../theme/ThemeContext';

const ICONES = {
  pendente: '⚪',
  rodando: '⏳',
  ok: '✅',
  falhou: '❌',
  ignorado: '⏭️',
};

// Tela de desenvolvimento: roda o roteiro de src/db/testarBanco.js contra o
// Firebase real e mostra o resultado de cada passo. Só aparece no app quando
// ele está em modo de desenvolvimento (link na tela de Login — veja LoginScreen).
export default function TesteBancoScreen({ navigation }) {
  const { t } = useTema();
  const [resultados, setResultados] = useState(listarTestes);
  const [rodando, setRodando] = useState(false);
  const [terminou, setTerminou] = useState(false);
  const [logadoAoAbrir] = useState(haUsuarioLogado);

  async function rodar() {
    setRodando(true);
    setTerminou(false);
    try {
      await executarTestes(setResultados);
    } finally {
      setRodando(false);
      setTerminou(true);
    }
  }

  const resumo = resumir(resultados);

  return (
    <TelaBase backgroundColor={t.fundo} paddingInferior={24}>
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Teste do banco de dados</Text>
        <Text style={[styles.explicacao, { color: t.textoSecundario }]}>
          Cria uma conta temporária no Firebase, grava, lê, edita e apaga grupos e bovinos, confere
          as regras de segurança e, no final, apaga tudo que criou.
        </Text>

        {logadoAoAbrir ? (
          <Text style={styles.aviso}>
            Você está logado. Rodar os testes encerra essa sessão (é preciso entrar de novo depois).
          </Text>
        ) : null}

        {terminou ? (
          <View style={[styles.resumo, resumo.sucesso ? styles.resumoOk : styles.resumoFalha]}>
            <Text style={styles.resumoTexto}>
              {resumo.sucesso
                ? `✅ Tudo certo! ${resumo.ok} de ${resumo.total} testes passaram. O banco está funcionando.`
                : `❌ ${resumo.falhas} teste(s) falharam, ${resumo.ok} passaram` +
                  (resumo.ignorados ? `, ${resumo.ignorados} não rodaram.` : '.')}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={rodar}
          disabled={rodando}
          accessibilityLabel="Rodar testes do banco de dados"
          style={({ pressed }) => [
            styles.botao,
            (pressed || rodando) && styles.botaoPressionado,
          ]}>
          {rodando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <Text style={styles.botaoTexto}>{terminou ? 'Rodar de novo' : 'Rodar testes'}</Text>
          )}
        </Pressable>

        <View style={styles.lista}>
          {resultados.map((r) => (
            <View key={r.id} style={[styles.item, { backgroundColor: t.card, borderColor: t.borda }]}>
              <Text style={[styles.itemTitulo, { color: t.texto }]}>
                {ICONES[r.status]} {r.titulo}
              </Text>
              {r.status === 'ok' && r.detalhe ? <Text style={[styles.detalhe, { color: t.textoSecundario }]}>{r.detalhe}</Text> : null}
              {r.status === 'ignorado' ? <Text style={[styles.detalhe, { color: t.textoSecundario }]}>{r.detalhe}</Text> : null}
              {r.status === 'falhou' ? (
                <View style={styles.blocoErro}>
                  <Text style={styles.erro}>{r.erro}</Text>
                  {r.codigo ? <Text style={[styles.codigo, { color: t.textoSecundario }]}>código: {r.codigo}</Text> : null}
                  {r.dica ? <Text style={styles.dica}>O que fazer: {r.dica}</Text> : null}
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <Pressable onPress={() => navigation.goBack()} style={styles.voltar} disabled={rodando}>
          <Text style={[styles.voltarTexto, { color: t.textoSecundario }]}>Voltar</Text>
        </Pressable>
      </View>
    </TelaBase>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: 20,
    paddingTop: 24,
  },
  titulo: {
    fontFamily: fontes.tituloRoxo,
    fontSize: 24,
    color: cores.roxo,
  },
  explicacao: {
    fontFamily: fontes.padrao,
    fontSize: 14,
    color: cores.cinzaTexto,
    marginTop: 8,
    marginBottom: 16,
  },
  aviso: {
    fontFamily: fontes.padraoMedio,
    fontSize: 13,
    color: '#8a5a00',
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  resumo: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  resumoOk: { backgroundColor: '#dff5cf' },
  resumoFalha: { backgroundColor: '#fde2e2' },
  resumoTexto: {
    fontFamily: fontes.padraoSemiBold,
    fontSize: 14,
    color: '#1a1a1a',
  },
  botao: {
    backgroundColor: cores.verde,
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoPressionado: { opacity: 0.6 },
  botaoTexto: {
    fontFamily: fontes.botao,
    fontSize: 16,
    color: cores.branco,
  },
  lista: {
    gap: 10,
  },
  item: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  itemTitulo: {
    fontFamily: fontes.padraoMedio,
    fontSize: 14,
    color: '#1a1a1a',
  },
  detalhe: {
    fontFamily: fontes.padrao,
    fontSize: 12,
    color: cores.cinzaTexto,
    marginTop: 4,
  },
  blocoErro: {
    marginTop: 8,
    gap: 4,
  },
  erro: {
    fontFamily: fontes.padrao,
    fontSize: 13,
    color: cores.erro,
  },
  codigo: {
    fontFamily: fontes.padrao,
    fontSize: 11,
    color: cores.cinzaTexto,
  },
  dica: {
    fontFamily: fontes.padraoMedio,
    fontSize: 13,
    color: cores.roxo,
    marginTop: 4,
  },
  voltar: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  voltarTexto: {
    fontFamily: fontes.padraoMedio,
    fontSize: 14,
    color: cores.cinzaTexto,
    textDecorationLine: 'underline',
  },
});
