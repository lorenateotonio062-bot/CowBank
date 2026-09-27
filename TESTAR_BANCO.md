# Como testar o banco de dados do CowBank

O banco do CowBank é o **Firebase** (Authentication + Cloud Firestore), que fica
na nuvem. Por isso o teste precisa de **internet** e usa o projeto configurado
em `src/firebase/config.js` (projeto `cowbank-3e3b3`).

O projeto já vem com um **teste automático dentro do próprio app**. Ele cria uma
conta temporária, grava/lê/edita/apaga grupos e bovinos, confere as regras de
segurança e, no final, **apaga tudo que criou**.

---

## 1. Preparar o Firebase (uma vez só)

Abra o projeto no console: <https://console.firebase.google.com/project/cowbank-3e3b3/overview>

| # | O que fazer | Onde |
|---|-------------|------|
| 1 | Ativar o login por **E-mail/senha** | Authentication → Método de login → E-mail/senha → Ativar |
| 2 | Criar o banco **Firestore** (edição Standard, região `southamerica-east1`) | Firestore Database → Criar banco de dados |
| 3 | Publicar as **regras de segurança** do arquivo `firestore.rules` | veja abaixo |

**Publicar as regras (passo 3)** — escolha um jeito:

- **Pelo terminal** (recomendado, já está tudo configurado no projeto):
  ```bash
  npm run firebase:login     # abre o navegador para você entrar com a conta Google do projeto
  npm run firebase:regras    # publica o firestore.rules
  ```
- **Pelo console:** Firestore Database → aba **Regras** → apague o conteúdo,
  cole o texto de `firestore.rules` → **Publicar**.

> Se você criou o Firestore em "modo de teste", ele vem com regras abertas a
> qualquer pessoa. Publicar as regras do projeto corrige isso — e o teste
> automático avisa se elas não estiverem valendo.

---

## 2. Rodar o teste

```bash
npm install
npm run start
```

Em outro terminal, abra o app nativo:

```bash
npm run android
```

No macOS com Xcode/CocoaPods configurados, também pode usar `npm run ios`.
Depois:

1. Na tela de **Login**, toque no link cinza no rodapé: **"Testar banco de dados (modo desenvolvimento)"**.
2. Toque em **Rodar testes**.
3. Aguarde (de alguns segundos a cerca de meio minuto, conforme a sua internet). Cada linha vira ✅ (passou) ou ❌ (falhou).

Se tudo passar, aparece **"✅ Tudo certo! ... testes passaram. O banco está funcionando."**

Se algum falhar, a própria tela mostra o erro e uma linha **"O que fazer:"** com o passo do Firebase que falta.

> Já está logado no app? O teste encerra a sua sessão (você entra de novo depois).
> Para chegar à tela de teste, saia primeiro pelo botão **Sair** em Configuração.
>
> O link de teste só aparece em modo desenvolvimento (`npm run start`); ele não
> existe em versões publicadas do app.

---

## 3. O que o teste verifica

| Teste | O que prova |
|-------|-------------|
| Configuração preenchida | `src/firebase/config.js` tem as chaves do projeto |
| Criar conta | Authentication aceita e-mail/senha e o perfil é gravado no Firestore |
| Ler / editar perfil, tema e idioma | Leitura e escrita em `usuarios/{uid}` |
| Segurança: ler dados de outra pessoa | O Firestore **recusa** (regras publicadas) |
| Segurança: gravar fora da própria área | O Firestore **recusa** |
| Criar / editar grupo | CRUD de `usuarios/{uid}/grupos` |
| Registrar 2 bovinos | Cria os bovinos com ID **e** atualiza o contador do grupo juntos |
| Listar e filtrar por tipo | Consultas por grupo e por Vaca/Bezerro/Boi |
| Ler bovino por id | `getBovino` |
| Editar bovino | Atualiza nome e descrição sem alterar o contador |
| Código (ID) repetido | Detecta brinco duplicado no rebanho |
| Excluir bovino | Remove e diminui o contador |
| Excluir grupo | Remove o grupo **e** os bovinos dele (cascata) |
| Sair da conta | Sem login, os dados ficam inacessíveis |
| Entrar de novo | Login por e-mail/senha |
| Senha errada | É recusada com a mensagem certa |
| Limpeza | Apaga a conta e todos os dados de teste |

**Sobre a conta de teste:** o e-mail é sempre `teste.<código>@example.com`
(domínio reservado, nenhum e-mail real é enviado). Ela some no fim do teste. Se
o teste for interrompido no meio (ex.: internet caiu) e sobrar uma conta, apague-a
em **Authentication → Usuários** no console — a tela informa o e-mail dela.

---

## 4. Conferir os dados no console (opcional)

Para **ver** os dados de verdade, use o app normalmente: crie uma conta real,
crie um grupo e registre um bovino. Depois abra o console:

- **Authentication → Usuários:** a conta criada.
- **Firestore Database → Dados:** `usuarios` → *(id do usuário)* → `grupos` e `bovinos`.

Também vale testar manualmente:

- **Manter a sessão:** feche o app por completo e abra de novo — deve abrir direto na tela Inicial.
- **Esqueceu a senha:** use o seu próprio e-mail; o Firebase envia um e-mail real com o link para trocar a senha (confira o spam). O teste automático não faz isso para não enviar e-mails.

---

## 5. Problemas comuns

| O que aparece | Causa provável | Solução |
|---------------|----------------|---------|
| `auth/operation-not-allowed` | Login por e-mail/senha desativado | Passo 1 da tabela do item 1 |
| `permission-denied` | Regras não publicadas, ou Firestore não criado | `npm run firebase:regras` (e passo 2 se o banco não existir) |
| "Sem resposta do Firebase em 20s" | Sem internet, ou Firestore não criado | Confira a conexão e o passo 2 |
| `not-found` | Firestore ainda não foi criado | Passo 2 |
| "leitura de outro usuário foi PERMITIDA" | Regras abertas (modo de teste) | Passo 3 |
| `auth/invalid-api-key` | `firebaseConfig` com valor errado | Copie de novo em Configurações do projeto → Seus apps |
| `auth/too-many-requests` | Muitas tentativas seguidas | Aguarde alguns minutos |
| `npm run firebase:regras` pede login | Ainda não fez o login na CLI | `npm run firebase:login` antes |
| O app não conecta ao Metro | Emulador/dispositivo sem acesso ao computador | Verifique se o Metro está rodando com `npm run start`; no Android físico use `adb reverse tcp:8081 tcp:8081` |

---

## 6. Como o teste foi validado

O roteiro (`src/db/testarBanco.js`) foi executado contra um Firebase **simulado
em memória**, com as mesmas regras do `firestore.rules`. Ele passou no cenário
correto e reprovou nos cenários com defeito injetado de propósito (regras
abertas, login por e-mail desativado, Firestore fora do ar, `database.js` com
bugs). **Isso valida a lógica do teste, mas não substitui rodar no seu Firebase
real** — é o que o item 2 faz.
