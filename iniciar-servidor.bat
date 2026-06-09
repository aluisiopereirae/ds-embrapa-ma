@echo off
title EmbrapAI - Servidor Local
echo.
echo  ====================================================
echo   EmbrapAI ^| Dados - Maranh^ao
echo   Servidor local para habilitar o Chat IA
echo  ====================================================
echo.

REM Tenta Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python encontrado. Iniciando servidor na porta 8080...
    echo.
    echo  Acesse no navegador:
    echo     http://localhost:8080
    echo.
    echo  Pressione Ctrl+C para encerrar.
    echo.
    python -m http.server 8080
    goto :fim
)

REM Tenta python3
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python3 encontrado. Iniciando servidor na porta 8080...
    echo.
    echo  Acesse no navegador:
    echo     http://localhost:8080
    echo.
    echo  Pressione Ctrl+C para encerrar.
    echo.
    python3 -m http.server 8080
    goto :fim
)

REM Tenta Node.js (npx serve)
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Node.js encontrado. Iniciando servidor na porta 8080...
    echo.
    echo  Acesse no navegador:
    echo     http://localhost:8080
    echo.
    echo  Pressione Ctrl+C para encerrar.
    echo.
    npx serve -l 8080 .
    goto :fim
)

REM Nenhum interpretador encontrado
echo  [ERRO] Python e Node.js nao encontrados.
echo.
echo  Instale uma das opcoes:
echo    - Python: https://www.python.org/downloads/
echo    - Node.js: https://nodejs.org/
echo.
echo  Ou abra o arquivo index.html via VS Code com a extensao
echo  "Live Server" (botao direito - Open with Live Server).
echo.
pause

:fim
