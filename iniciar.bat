@echo off
REM Abre o CowBank de qualquer lugar: entra sozinho na pasta certa.
cd /d "%~dp0"

if not exist "package.json" (
  echo.
  echo ERRO: nao encontrei o package.json em:
  echo   %cd%
  echo Este arquivo precisa ficar na mesma pasta do package.json e do App.js.
  echo.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERRO: o Node.js nao esta instalado.
  echo Baixe a versao LTS em https://nodejs.org e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias ^(so na primeira vez, pode demorar alguns minutos^)...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERRO no npm install. Veja a mensagem acima.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando o CowBank...
call npm run start
pause
