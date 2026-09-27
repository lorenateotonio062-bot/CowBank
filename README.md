# CowBank

App de gerenciamento de grupos de bovinos (React Native CLI), unificado a
partir das 8 páginas feitas separadamente no Expo Snack (Login, Criar conta,
Inicial, Grupos, Criar grupo, Registrar bovino, Perfil, Configuração).

> Plano técnico: a análise do app, melhorias recomendadas e a migração de Expo
> para React Native CLI estão documentadas em
> [SDD_MELHORIAS_E_MIGRACAO_RN_CLI.md](SDD_MELHORIAS_E_MIGRACAO_RN_CLI.md).

## Como rodar

1. Extraia o zip numa pasta (ex.: `CowBank`). Ao abrir essa pasta você deve ver
   **`package.json` e `App.js` lado a lado** — é nela que os comandos abaixo
   precisam ser executados.
2. Abra o terminal **dentro dessa pasta** e rode:

```bash
npm install
npm run start
```

Atalho: dê dois cliques em **`iniciar.bat`** (Windows) ou rode `./iniciar.sh`
(Mac/Linux). Eles entram na pasta certa sozinhos, instalam as dependências na
primeira vez e iniciam o app.

Em outro terminal, rode o app nativo:

```bash
npm run android
```

No macOS com Xcode e CocoaPods configurados, também é possível rodar:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
npm run ios
```

> **Apareceu "package.json não existe" (`ENOENT`)?** O terminal está numa pasta
> diferente da do projeto — comum quando o "Extrair tudo" do Windows cria uma
> pasta `CowBank` dentro de outra `CowBank`. Entre na pasta interna (a que tem o
> `package.json`) com `cd CowBank`, ou use o `iniciar.bat` / `iniciar.sh`.

> O banco de dados é o **Firebase** (Auth + Firestore).
> Para testá-lo, siga o passo a passo em **[TESTAR_BANCO.md](TESTAR_BANCO.md)**;
> para configurá-lo do zero, veja **"Banco de dados (Firebase)"** mais abaixo.

## Estrutura

```
CowBank/
├── android/                # Projeto nativo Android
├── ios/                    # Projeto nativo iOS
├── App.js                  # Navegação (Stack) + carregamento de fontes/banco
├── index.js
├── app.json
├── metro.config.js
├── react-native.config.js  # Assets nativos, incluindo fontes
├── iniciar.bat / iniciar.sh # Atalhos: entram na pasta certa, instalam e iniciam o app
├── TESTAR_BANCO.md         # Guia para testar o banco de dados (Firebase)
├── firestore.rules         # Regras de segurança do Firestore
├── assets/
│   ├── images/              # Todas as imagens usadas no app
│   └── fonts/                # Fontes locais usadas pelo React Native CLI
├── src/
│   ├── db/
│   │   ├── database.js       # Firebase: login + funções (CRUD) de usuário, grupos e bovinos
│   │   └── testarBanco.js    # Roteiro do teste automático do banco (usado por TesteBancoScreen)
│   ├── firebase/
│   │   └── config.js         # Configuração do Firebase (cole seu firebaseConfig aqui)
│   ├── services/
│   │   └── imagePicker.js    # Adapter nativo para escolher foto de perfil
│   ├── theme/
│   │   ├── colors.js         # Paleta de cores centralizada
│   │   └── fonts.js          # Inter/Poppins (Google Fonts) + fontFamily por uso
│   ├── components/
│   │   ├── comuns/           # RodapeNav, ConfirmModal, SelectModal (compartilhados)
│   │   ├── login/
│   │   ├── criarconta/
│   │   ├── inicial/
│   │   ├── grupos/
│   │   ├── criargrupo/
│   │   ├── registrarbovino/
│   │   ├── perfil/
│   │   └── configuracao/
│   └── screens/               # Um arquivo de tela por página do Snack original
```

## Fluxo de navegação

```
Login ──> CriarConta ──> Login
  │
  └──> Inicial ──┬──> Grupos (detalhe de 1 grupo)
                  │        └──> RegistrarBovino (a partir do grupo)
                  ├──> CriarGrupo ──> RegistrarBovino (botão "+") ──> volta pra CriarGrupo
                  ├──> RegistrarBovino (botão da tela inicial)
                  ├──> Perfil
                  └──> Configuracao
```

`Perfil`, `Inicial` e `Configuracao` são acessíveis pelo rodapé/engrenagem em
praticamente todas as telas internas.

## Banco de dados (Firebase)

O app usa **Firebase Authentication** (login por e-mail/senha) e **Cloud
Firestore** (dados). Cada usuário só enxerga os próprios dados.

```
usuarios/{uid}                 perfil: nome, email, telefone, data_nascimento, foto_uri, tema, idioma
usuarios/{uid}/grupos/{id}     nome, descricao, totalBovinos, criadoEm
usuarios/{uid}/bovinos/{id}    nome, tipo, descricao, codigo, grupoId, criadoEm
```

Configuração (uma vez só):

1. Console do Firebase: criar projeto, registrar um app **Web** e copiar o
   `firebaseConfig` para `src/firebase/config.js`.
2. Authentication > Método de login > ativar **E-mail/senha**.
3. Firestore Database > Criar banco (edição **Standard**, região
   `southamerica-east1`) e, na aba **Regras**, colar o conteúdo de
   `firestore.rules` e **Publicar** — ou, pelo terminal:
   `npm run firebase:login` e depois `npm run firebase:regras`.
4. Conferir tudo: na tela de Login (modo desenvolvimento) toque em
   **"Testar banco de dados"** — veja [TESTAR_BANCO.md](TESTAR_BANCO.md).

Todas as funções de dados ficam em `src/db/database.js` (mesmos nomes da
versão SQLite). Mudanças de comportamento em relação à versão local:

- Login é por **e-mail + senha** (o Firebase Auth exige e-mail); senha com no
  mínimo 6 caracteres.
- Redefinir senha envia um **e-mail real** com link (as telas de código e
  nova senha foram removidas).
- O e-mail do Perfil é somente leitura (é o login da conta).
- É multiusuário de verdade: cada conta tem seus próprios grupos e bovinos.
- A **foto de perfil** continua sendo um arquivo local do aparelho (não sobe
  para a nuvem — Firebase Storage exige plano pago).

## Decisões que tomei (vale revisar)

- **Fonte TT Interphases**: é paga (TypeType), não pude baixar/incluir por
  licença. Títulos roxos usam Poppins Bold como substituta — veja
  `assets/fonts/README.md` para trocar pela fonte oficial depois.
- **Deletar um grupo**: não havia um botão desenhado pra isso em nenhuma tela.
  Implementei como **toque longo** no card do grupo, na tela Inicial (não
  muda nada visualmente, só adiciona o gesto).
- **Bovinos**: podem ser registrados, editados, excluídos e consultados com
  ID/brinco. O QR Code é gerado automaticamente a partir do registro do animal.
- **Botão "Escanear"** (rodapé): não tinha funcionalidade especificada, mostra
  "Em breve" ao tocar.
- **Botões da tela de Configuração** (Aparência, Linguagem, Câmera, Fale
  conosco, Relato de erros): mostram "Em breve" ao tocar, sem telas novas —
  como você pediu.
- **Data de nascimento**: mantive como campo de texto (`DD/MM/AAAA`) em vez de
  um seletor de data nativo, pra não adicionar mais uma dependência nativa
  num protótipo. Se quiser um calendário de verdade depois, dá pra adicionar
  `@react-native-community/datetimepicker`.
- **Seletores de "Tipo" e "Grupo"** (tela Registrar bovino): não existia tela
  desenhada para essa escolha (só um botão com setinha), então criei um modal
  de lista simples (`SelectModal`) no mesmo estilo visual do app.

> **Nota sobre o histórico abaixo:** as seções v0.3 e v0.4 descrevem a versão
> antiga, com banco local SQLite (senha em SHA-256, código de redefinição gerado
> no aparelho etc.). Hoje o banco é o Firebase — veja "Banco de dados (Firebase)"
> acima, que vale no lugar delas.

## Revisão técnica (v0.3)

Depois da v0.2, o projeto passou por uma revisão completa de segurança,
arquitetura e experiência de uso. Resumo do que mudou:

**Segurança**
- Senha agora é salva como hash SHA-256 (`expo-crypto`), nunca em texto puro
- Perfil não pré-preenche mais a senha atual — o campo virou "Nova senha
  (deixe em branco para manter a atual)"

**Correções**
- A contagem de bovinos por grupo (calculada mas nunca exibida) agora
  aparece nos cards da tela Inicial
- Query de grupos otimizada: era uma consulta por grupo em loop (N+1),
  virou um único `JOIN`
- Adicionado "Sair" (logout) na tela de Configuração
- Checagem de código (ID) de bovino duplicado + sugestão automática do
  próximo código disponível no grupo

**Dinamismo / UX**
- Ícone de lixeira visível nos cards de grupo (antes só dava pra excluir
  com toque-e-segure, sem nenhuma pista visual)
- Badges coloridos por tipo de bovino (Vaca/Bezerro/Boi) nos cards e nas
  miniaturas — gerados com Python/Pillow a partir da paleta do app
- Feedback visual ao pressionar botões/cards principais
- Navegação entre campos pelo teclado (Login, Criar conta, Registrar
  bovino, Perfil) — usar "próximo" no teclado pula pro campo seguinte
- `accessibilityLabel` nos botões de ícone (rodapé, lixeiras, excluir grupo)
- Toast leve (não-bloqueante) em confirmações simples (perfil salvo, grupo/
  bovino excluído), no lugar de `Alert.alert`

## Novas páginas e pop-ups (v0.4)

Integrei 5 novos designs enviados como Snacks separados: os pop-ups de
Aparência e Linguagem, e as 3 páginas do fluxo de redefinir senha.

**Tema claro/escuro (pop-up de Aparência)**
- Implementação real, não só visual: criei um `ThemeContext`
  (`src/theme/ThemeContext.js`) e a escolha fica salva no perfil (coluna
  `tema` no banco, com migração automática pra quem já tinha o app
  instalado)
- Aplicado no fundo das 6 telas internas (Inicial, Grupos, Criar grupo,
  Registrar bovino, Perfil, Configuração) e nos títulos que ficam direto
  sobre esse fundo
- Login e Criar conta continuam sempre verde/branco (marca) em qualquer
  modo — decisão intencional, não um esquecimento
- Cards, botões e campos (brancos/verdes/roxos) não mudam de cor — já têm
  bom contraste nos dois modos, então recolorir cada um não trazia ganho
  real pra quantidade de código que exigiria

**Idioma (pop-up de Linguagem)**
- O seletor funciona de verdade e salva a escolha (coluna `idioma` no
  banco)
- **Mas o app não foi traduzido.** Traduzir todos os textos da interface
  pra português/espanhol/inglês é um projeto de internacionalização à
  parte — dezenas de arquivos, centenas de strings, uma lib de i18n — bem
  maior que um toggle de configuração. Preferi deixar isso documentado a
  fingir que o seletor já muda o idioma do app.

**Redefinir senha (3 páginas)**
- Fluxo completo: e-mail → código → nova senha, conectado ao "Esqueceu a
  senha?" da tela de Login (antes só mostrava "Em breve")
- Como o app não tem servidor de e-mail, o "código enviado" é gerado
  localmente e mostrado na própria tela da etapa 2 (com um aviso
  explicando isso) — mesma lógica de transparência usada no login local
- O código expira em 10 minutos e fica só em memória (não é salvo no
  banco); a nova senha é salva com o mesmo hash SHA-256 do resto do app
- Reaproveitei o componente `Topo` (seta + ramo) e os ícones de suporte
  que já existiam no projeto, em vez de duplicá-los — o design enviado
  era pixel-a-pixel igual ao que a tela de Criar conta já usava

## Próximos passos sugeridos

- Adicionar a fonte TT Interphases (veja `assets/fonts/README.md`)
- Testar no seu celular com build nativa Android/iOS
- Se algum dia quiser traduzir o app de verdade, vale olhar libs como
  `i18next` + `react-i18next`, extraindo cada texto fixo pra um dicionário
  por idioma

## Correções de layout (v0.5)

Rodada focada nos problemas de interface encontrados testando no celular.

**A causa por trás de vários deles**

Os cabeçalhos definiam a barra verde do topo com `flexBasis: 40`. Dentro de
um `ScrollView` (que tem altura livre), um elemento vazio com apenas
`flexBasis` colapsa para altura 0 — a barra simplesmente não aparecia. Ao
abrir o teclado, o container encolhia, o `flexBasis` voltava a valer e a
barra surgia: era esse o comportamento de "a barra só aparece depois de
tocar num campo". A correção foi trocar por `height` / `minHeight` nos
containers que precisam de altura fixa dentro de áreas que rolam.

**`TelaBase`, a nova estrutura padrão de tela**

Criei `src/components/comuns/TelaBase.js`, que centraliza o que antes cada
tela resolvia por conta própria:
- **Áreas seguras** — o app roda em modo *edge to edge* no Android, então o
  conteúdo passava por baixo dos botões de navegação do celular. Faltava o
  `SafeAreaProvider` (agora no `App.js`); o respiro vem dos insets reais do
  aparelho, por isso aparece já no primeiro render
- **Rodapé fixo** — o `RodapeNav` saiu de dentro do `ScrollView` e ficou
  colado no fim da tela, com altura própria. Era por estar dentro da área
  rolável que ele "flutuava" e grudava no último campo
- **Teclado** — o conteúdo sobe e segue rolável; o rodapé some enquanto se
  digita, senão ficaria espremido logo acima do teclado

**Outras correções**
- Campos de senha tinham largura maior que os demais: o estilo da caixa ia
  num envoltório e o ícone do olho somava largura por fora. Agora o estilo
  vai direto no campo e o olho é desenhado por cima (posição absoluta)
- Mensagens de erro desmontavam o layout ao aparecer. Criei `MensagemErro`,
  com altura reservada: o espaço existe sempre, então o aviso preenche um
  lugar que já estava lá
- Configuração: as seções passaram a rolar por dentro, então o botão "Sair"
  não empurra mais o rodapé para fora da tela; o botão ganhou o formato
  padrão dos outros botões de ação do app
- Perfil: campo de nova senha removido (a troca vive no fluxo de "Esqueceu a
  senha?")
- Tela de grupo: "Ver registro" e os filtros de categoria agora são roxos.
  A setinha das categorias era um PNG verde — gerei a versão roxa
  recolorindo o original, preservando a transparência, e a branca é usada
  quando o filtro está ativo
