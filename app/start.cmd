@echo off
set PATH=C:\Program Files\nodejs;%PATH%
if "%PORT%"=="" set PORT=5174
cd /d "C:\LLM wiki\web\app"
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev -- --port %PORT%
