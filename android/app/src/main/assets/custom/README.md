# Fonte TT Interphases

A fonte **TT Interphases** (usada nos títulos roxos, como "Criar um novo
grupo" e "Registrar bovino") é uma fonte **paga**, da fundição TypeType
(https://typetype.org/fonts/tt-interphases-pro/). Por isso ela não foi
baixada nem incluída automaticamente neste projeto — só a Anthropic não
pode redistribuir arquivos de fontes comerciais.

Enquanto ela não é adicionada, esses títulos usam **Poppins Bold** como
substituta (bem parecida, também é uma fonte de interface moderna).

## Como adicionar a fonte original

1. Compre ou baixe a licença em:
   https://typetype.org/fonts/tt-interphases-pro/
2. Coloque os arquivos `.ttf` nesta pasta (`assets/fonts/`) com estes nomes:
   - `TTInterphases-Bold.ttf`
   - `TTInterphases-SemiBold.ttf`
3. Abra `src/theme/fonts.js` e descomente as duas linhas marcadas com
   `TT INTERPHASES` dentro da função `useAppFonts()`.
4. Ainda em `src/theme/fonts.js`, troque os valores de `tituloRoxo` e
   `tituloRoxoSemiBold` no objeto `fontes` para `'TTInterphases-Bold'` e
   `'TTInterphases-SemiBold'`.
5. Rode `npx react-native-asset` e reinicie o Metro bundler (`npm run start -- --reset-cache`).

Pronto — todos os títulos roxos do app passam a usar a fonte oficial
automaticamente, sem precisar mexer em mais nenhum arquivo.
