@echo off
chcp 65001 > nul

start "backend" cmd /k "cd /d "%~dp0" && "C:\Program Files\nodejs\node.exe" server/index.js"
ping -n 3 127.0.0.1 > nul

start "frontend" cmd /k "cd /d "%~dp0" && "C:\Program Files\nodejs\npm.cmd" run dev"
ping -n 5 127.0.0.1 > nul

start http://localhost:5173
