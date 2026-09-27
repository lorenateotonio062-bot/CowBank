#!/usr/bin/env bash
# Abre o CowBank de qualquer lugar: entra sozinho na pasta certa.
cd "$(dirname "$0")" || exit 1

if [ ! -f package.json ]; then
  echo "ERRO: nao encontrei o package.json em: $(pwd)"
  echo "Este arquivo precisa ficar na mesma pasta do package.json e do App.js."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERRO: o Node.js nao esta instalado. Baixe a versao LTS em https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Instalando dependencias (so na primeira vez, pode demorar alguns minutos)..."
  npm install || { echo "ERRO no npm install. Veja a mensagem acima."; exit 1; }
fi

echo
echo "Iniciando o CowBank..."
npm run start
