# SDD - CowBank: melhorias e migração de Expo para React Native CLI

## Status da migração

Migração executada em 2026-09-27.

Resultado:

- Projeto nativo Android criado em `android/`.
- Projeto nativo iOS criado em `ios/`.
- Dependências Expo removidas do `package.json`.
- Entrada do app migrada para `AppRegistry`.
- Babel/Metro migrados para configuração React Native CLI.
- `expo-status-bar` substituído por `StatusBar` do React Native.
- `expo-image-picker` substituído por `react-native-image-picker`.
- Fontes Inter/Poppins migradas para arquivos locais em `assets/fonts`.
- Assets de fonte linkados em Android/iOS.
- Pastas legadas removidas/normalizadas.
- `README.md`, `TESTAR_BANCO.md` e scripts de inicialização atualizados.

Validações executadas:

- `npm install`
- `npx react-native-asset`
- `npx react-native config`
- `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output /tmp/cowbank.android.bundle --assets-dest /tmp/cowbank-assets`
- `./gradlew assembleDebug` em `android/` com `BUILD SUCCESSFUL`
- `bundle install` com instalação local de gems
- `bundle exec pod install` em `ios/` concluído com sucesso

## 1. Objetivo

Evoluir o CowBank de um app React Native com Expo para um app React Native CLI,
mantendo as funcionalidades atuais e criando uma base mais preparada para
recursos nativos, builds próprios, testes automatizados e crescimento do produto.

Este documento também registra a análise técnica do app atual e define uma
estratégia de migração sem deixar o projeto em estado intermediário quebrado.

## 2. Estado atual do aplicativo

O CowBank é um app de gerenciamento de bovinos com:

- Autenticação por e-mail e senha via Firebase Authentication.
- Persistência em Cloud Firestore.
- Perfil de usuário, grupos, bovinos, tema claro/escuro e idioma salvo no perfil.
- Navegação com `@react-navigation/native` e `@react-navigation/native-stack`.
- Teste automático do banco em `src/db/testarBanco.js`.
- Assets visuais locais em `assets/images`.
- Carregamento de fontes via Expo (`expo-font` e `@expo-google-fonts/*`).
- Seleção de foto de perfil via `expo-image-picker`.
- Barra de status via `expo-status-bar`.
- Entrada do app registrada por `registerRootComponent` de `expo`.

Arquivos mais importantes:

- `App.js`: inicialização, carregamento de fontes, Firebase, tema e navegação.
- `index.js`: ponto de entrada Expo atual.
- `src/firebase/config.js`: Firebase Auth + Firestore.
- `src/db/database.js`: camada de dados usada pelas telas.
- `src/theme/fonts.js`: fontes via Expo.
- `src/components/perfil/Cabecalho.js`: seleção de imagem via Expo.
- `package.json`: scripts e dependências Expo.
- `README.md` e `TESTAR_BANCO.md`: documentação operacional.

## 3. Problemas e riscos identificados

### 3.1 Acoplamento ao Expo

Hoje o app depende diretamente de pacotes Expo em pontos centrais:

- `expo` em `index.js`.
- `expo-status-bar` em `App.js`.
- `expo-font` e `@expo-google-fonts/*` em `src/theme/fonts.js`.
- `expo-image-picker` em `src/components/perfil/Cabecalho.js`.
- `babel-preset-expo` em `babel.config.js`.
- Scripts `expo start`, `expo start --android`, `expo start --ios` e `expo start --web`.

Para migrar para React Native CLI, esses pontos precisam ser substituídos por
APIs compatíveis com projetos nativos.

### 3.2 Ausência de pastas nativas

O projeto atual não possui `android/` nem `ios/`. Em React Native CLI, essas
pastas são parte essencial do app e precisam ser geradas, versionadas e mantidas.

### 3.3 Firebase usando SDK Web

O app usa o SDK Web do Firebase com persistência via AsyncStorage. Isso funciona
em React Native, mas a base pode sofrer com limitações de performance, suporte
offline e integração nativa. Para a primeira migração, a recomendação é manter o
SDK atual para reduzir risco. Depois, avaliar migração para `@react-native-firebase`.

### 3.4 Foto de perfil local

A foto fica salva como URI local no Firestore. Isso não garante disponibilidade
em outro aparelho nem após reinstalação. A migração para RN CLI não corrige isso
sozinha. A solução de produto é usar Firebase Storage, outro storage ou limitar
explicitamente a foto a uso local.

### 3.5 Recursos incompletos de produto

Há funcionalidades documentadas como "Em breve" ou incompletas:

- Botão "Escanear".
- Configurações de câmera, suporte e relato de erros.
- Idioma salvo, mas interface ainda sem i18n real.
- Visualização de bovino em alerta simples, sem tela dedicada.
- Data de nascimento como texto livre.

### 3.6 Qualidade e manutenção

O app tem boa separação básica entre telas, componentes e banco, mas ainda pode
melhorar em:

- Tipagem ou validação estrutural dos dados.
- Testes de componentes e regras de negócio.
- Estado de carregamento e erro padronizado.
- Separação entre camada de serviço Firebase e regras de domínio.
- Padronização de formulários e validações.

## 4. Decisões de arquitetura

### 4.1 React Native CLI como plataforma alvo

O app passará a usar a estrutura padrão do React Native CLI:

```text
CowBank/
├── android/
├── ios/
├── App.js
├── index.js
├── metro.config.js
├── babel.config.js
├── package.json
├── assets/
└── src/
```

### 4.2 Migração incremental

A migração deve preservar primeiro o comportamento atual. Melhorias funcionais
devem entrar depois que o app abrir e autenticar corretamente em Android/iOS.

Ordem recomendada:

1. Criar base React Native CLI.
2. Copiar `src/`, `assets/`, regras Firebase e documentação.
3. Remover dependências Expo.
4. Substituir APIs Expo.
5. Validar Android.
6. Validar iOS.
7. Atualizar documentação e scripts.
8. Só então atacar melhorias de produto.

### 4.3 Firebase na primeira fase

Manter o SDK atual:

- `firebase`
- `@react-native-async-storage/async-storage`

Motivo: reduz o risco de mexer em autenticação, regras e Firestore durante a
troca de runtime. A migração para `@react-native-firebase/app`,
`@react-native-firebase/auth` e `@react-native-firebase/firestore` deve ser uma
fase separada.

### 4.4 Fontes

Remover `expo-font` e `@expo-google-fonts/*`.

No React Native CLI:

- Adicionar arquivos `.ttf` em `assets/fonts`.
- Registrar via `react-native.config.js`.
- Executar `npx react-native-asset`.
- Usar os nomes reais das fontes no objeto `fontes`.

Como Inter e Poppins são usadas hoje a partir de pacotes Expo, será necessário
incluir os arquivos `.ttf` no projeto.

### 4.5 Imagem de perfil

Substituir `expo-image-picker` por uma biblioteca nativa:

- Recomendado: `react-native-image-picker`.

Permissões:

- Android: configurar permissões conforme versão do Android.
- iOS: configurar `NSPhotoLibraryUsageDescription` no `Info.plist`.

### 4.6 Status bar

Substituir `expo-status-bar` pelo componente nativo:

```js
import { StatusBar } from 'react-native';
```

E ajustar:

```jsx
<StatusBar barStyle={modo === 'escuro' ? 'light-content' : 'dark-content'} />
```

## 5. Dependências alvo

### 5.1 Remover

- `expo`
- `expo-font`
- `expo-image-picker`
- `expo-status-bar`
- `@expo-google-fonts/inter`
- `@expo-google-fonts/poppins`
- `@expo/metro-runtime`
- `react-native-web`
- `react-dom`
- `babel-preset-expo`

### 5.2 Manter

- `react`
- `react-native`
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-safe-area-context`
- `react-native-screens`
- `@react-native-async-storage/async-storage`
- `firebase`

### 5.3 Adicionar

- `react-native-image-picker`
- `@react-native-community/cli` se a versão do template exigir.
- `@react-native/babel-preset`.
- Dependências nativas exigidas pelo template React Native CLI.

Opcional em fases futuras:

- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `i18next` e `react-i18next`
- `@react-native-community/datetimepicker`
- `react-native-permissions`

## 6. Alterações técnicas necessárias

### 6.1 `index.js`

Atual:

```js
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

Alvo:

```js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### 6.2 `app.json`

Atual está no formato Expo:

```json
{
  "expo": {
    "name": "cowbank",
    "slug": "cowbank"
  }
}
```

Alvo React Native CLI:

```json
{
  "name": "cowbank",
  "displayName": "CowBank"
}
```

### 6.3 `babel.config.js`

Atual:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

Alvo:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
};
```

### 6.4 `App.js`

Trocar:

```js
import { StatusBar } from 'expo-status-bar';
```

Por:

```js
import { StatusBar } from 'react-native';
```

E trocar `style` por `barStyle`.

### 6.5 `src/theme/fonts.js`

Remover `useFonts` do Expo. Em RN CLI, as fontes são carregadas pelo sistema
nativo depois de vinculadas ao app. O arquivo pode virar apenas um mapa de nomes:

```js
export const fontes = {
  tituloRoxo: 'Poppins-Bold',
  tituloRoxoSemiBold: 'Poppins-SemiBold',
  campo: 'Inter-Regular',
  campoMedio: 'Inter-Medium',
  botao: 'Inter-SemiBold',
  padrao: 'Poppins-Regular',
  padraoMedio: 'Poppins-Medium',
  padraoSemiBold: 'Poppins-SemiBold',
  padraoBold: 'Poppins-Bold',
};

export function useAppFonts() {
  return true;
}
```

### 6.6 `src/components/perfil/Cabecalho.js`

Substituir:

```js
import * as ImagePicker from 'expo-image-picker';
```

Por:

```js
import { launchImageLibrary } from 'react-native-image-picker';
```

Criar um pequeno adapter para não espalhar dependência nativa pelo componente:

```text
src/services/imagePicker.js
```

Responsabilidade:

- Abrir galeria.
- Normalizar retorno para `{ uri }`.
- Tratar cancelamento.
- Tratar erro/permissão.

### 6.7 Scripts

Atual:

```json
"start": "expo start",
"android": "expo start --android",
"ios": "expo start --ios",
"web": "expo start --web"
```

Alvo:

```json
"start": "react-native start",
"android": "react-native run-android",
"ios": "react-native run-ios",
"doctor": "react-native doctor"
```

Remover script web, pois React Native CLI não fornece web por padrão.

## 7. Plano de execução da migração

### Fase 0 - Preparação

- Criar uma branch ou backup do projeto atual.
- Confirmar que o teste do Firebase passa no Expo antes da migração.
- Registrar versões atuais de Node, npm, Java, Android Studio, Xcode e CocoaPods.
- Garantir que não há mudanças não salvas importantes.

### Fase 1 - Gerar base RN CLI

Criar um projeto temporário com a mesma versão de React Native:

```bash
npx @react-native-community/cli init CowBankCLI --version 0.81.5
```

Depois copiar ou mesclar:

- `android/`
- `ios/`
- `metro.config.js`
- `react-native.config.js` se necessário
- ajustes do template no `package.json`
- ajustes do template no `babel.config.js`

### Fase 2 - Migrar código JS

- Copiar `src/`.
- Copiar `assets/`.
- Copiar `App.js`.
- Atualizar `index.js`.
- Atualizar `app.json`.
- Ajustar imports Expo.
- Remover pacotes Expo.
- Instalar substitutos nativos.

### Fase 3 - Fontes

- Baixar/adicionar arquivos `.ttf` de Inter e Poppins em `assets/fonts`.
- Configurar `react-native.config.js`.
- Rodar:

```bash
npx react-native-asset
```

- Validar nomes reais das fontes no Android e no iOS.

### Fase 4 - Image picker

- Instalar `react-native-image-picker`.
- Implementar `src/services/imagePicker.js`.
- Ajustar permissões Android e iOS.
- Testar troca de foto em dispositivo ou emulador.

### Fase 5 - Firebase

- Manter `src/firebase/config.js` na primeira fase.
- Testar:
  - criar conta;
  - login;
  - persistência de sessão;
  - criar grupo;
  - registrar bovino;
  - excluir grupo/bovino;
  - redefinir senha;
  - teste automático do banco.

### Fase 6 - Build nativo

Android:

```bash
npm run android
```

iOS:

```bash
cd ios
pod install
cd ..
npm run ios
```

### Fase 7 - Atualizar documentação

- Atualizar `README.md`.
- Atualizar `TESTAR_BANCO.md`.
- Remover menções a Expo Go.
- Documentar Android Studio, Xcode e CocoaPods.
- Documentar comandos RN CLI.

## 8. Critérios de aceite da migração

A migração será considerada concluída quando:

- O app iniciar por `npm run android`.
- O app iniciar por `npm run ios`.
- Não houver dependências Expo em `package.json`.
- `rg "expo"` não encontrar imports ativos no código do app.
- Login com Firebase funcionar.
- Sessão persistir ao fechar e abrir o app.
- CRUD de grupos e bovinos funcionar.
- Troca de foto de perfil funcionar ou exibir erro amigável.
- Tema claro/escuro funcionar.
- Teste automático do banco passar.
- README estiver coerente com React Native CLI.

## 9. Melhorias recomendadas após a migração

### 9.1 Produto

- Criar tela de detalhe do bovino em vez de `Alert`.
- Implementar edição de bovino.
- Implementar busca global por código, nome e grupo.
- Implementar escaneamento real de QR Code para recuperar o registro do animal.
- Trocar data de nascimento textual por seletor nativo.
- Criar suporte/feedback real em vez de "Em breve".
- Sincronizar foto de perfil na nuvem.

### 9.2 Internacionalização

- Adicionar `i18next` e `react-i18next`.
- Extrair strings fixas para dicionários:
  - `pt-BR`
  - `en`
  - `es`
- Fazer o seletor de idioma alterar a interface inteira.

### 9.3 Arquitetura

- Criar camada `src/services/firebase`.
- Separar regras de domínio em `src/domain`.
- Criar adapters para APIs nativas:
  - imagem;
  - permissões;
  - status bar;
  - armazenamento local.
- Padronizar componentes de formulário.
- Criar constantes para nomes de rotas.

### 9.4 Qualidade

- Adicionar ESLint e Prettier.
- Adicionar Jest para regras de domínio.
- Adicionar React Native Testing Library para telas críticas.
- Adicionar Detox ou Maestro para fluxo de login e cadastro de bovino.
- Adicionar CI para rodar lint e testes.

### 9.5 Dados e segurança

- Avaliar migração para `@react-native-firebase`.
- Avaliar Firebase Storage para fotos.
- Criar logs estruturados para falhas Firebase.
- Revisar regras Firestore com testes automatizados.
- Avaliar modo offline e resolução de conflitos.

## 10. Riscos da migração

- Diferenças de nomes de fontes entre Android e iOS.
- Permissões de galeria diferentes por versão de Android.
- Configuração nativa do iOS exigir CocoaPods/Xcode.
- Firebase SDK Web pode ter comportamentos diferentes fora do Expo Go.
- Remoção do suporte web, que hoje existe via Expo.
- A geração de `android/` e `ios/` pode mudar arquivos demais; por isso deve ser
  feita em uma etapa separada e testada logo em seguida.

## 11. Recomendação final

Não é recomendado apenas editar `package.json` e remover Expo dentro da pasta
atual sem gerar a base nativa. O caminho seguro é criar a estrutura React Native
CLI com a mesma versão de React Native, migrar o código JavaScript por cima e
validar por etapas.

O app está bem posicionado para a migração porque a maior parte da regra de
negócio está isolada em `src/db/database.js` e as dependências Expo estão
concentradas em poucos arquivos. Os pontos mais sensíveis são fontes, seleção de
imagem, scripts de execução e documentação.
