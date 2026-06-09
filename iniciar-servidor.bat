@echo off
title EmbrapAI - Servidor Local
echo.
echo  ====================================================
echo   EmbrapAI ^| Dados - Maranh^ao
echo   Servidor local com proxy para o Chat IA
echo  ====================================================
echo.

REM Tenta Python 3 (prefere o proxy completo)
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python encontrado. Iniciando servidor proxy na porta 8080...
    echo.
    echo  Acesse no navegador:
    echo     http://localhost:8080
    echo.
    echo  Pressione Ctrl+C para encerrar.
    echo.
    python proxy-server.py
    goto :fim
)

python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python3 encontrado. Iniciando servidor proxy na porta 8080...
    echo.
    echo  Acesse no navegador:
    echo     http://localhost:8080
    echo.
    echo  Pressione Ctrl+C para encerrar.
    echo.
    python3 proxy-server.py
    goto :fim
)

REM Fallback: Node.js (sem proxy — Chat IA nao funcionara em localhost)
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [AVISO] Node.js encontrado, mas sem Python o proxy nao estara ativo.
    echo          O Chat IA pode nao funcionar em localhost com Node.js.
    echo          Instale Python para habilitar o proxy:
    echo          https://www.python.org/downloads/
    echo.
    echo  Iniciando servidor simples na porta 8080...
    echo  Acesse: http://localhost:8080
    echo.
    npx serve -l 8080 .
    goto :fim
)

echo  [ERRO] Python nao encontrado.
echo.
echo  Instale Python (recomendado):
echo    https://www.python.org/downloads/
echo.
echo  Ou use o VS Code com a extensao "Live Server":
echo    Botao direito no index.html ^> Open with Live Server
echo.
pause

:fim
