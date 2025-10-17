@echo off
echo ========================================
echo  Iniciando Condominio App - Mobile
echo ========================================
echo.

echo [1/3] Verificando backend Laravel...
tasklist /FI "IMAGENAME eq php.exe" 2>NUL | find /I /N "php.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Backend ja esta rodando!
) else (
    echo Iniciando backend Laravel...
    start "Backend Laravel" cmd /k "cd backend && php artisan serve --host=0.0.0.0 --port=8000"
    timeout /t 3 /nobreak > nul
)

echo.
echo [2/3] Obtendo IP da maquina...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4" ^| findstr /V "127.0.0.1"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo IP encontrado: %IP%

echo.
echo [3/3] Iniciando app mobile...
echo.
echo ========================================
echo  IMPORTANTE:
echo  - Celular e PC devem estar na mesma WiFi
echo  - IP da API configurado: %IP%:8000
echo  - Use Expo Go para escanear o QR Code
echo ========================================
echo.

cd mobile
npm start

pause
