@echo off
rem J.A.R.V.I.S. koprusunu pencerede (gorunur) calistirir: sorun ararken kullanin.
chcp 65001 >nul
cd /d "%~dp0"
node kopru.mjs
pause
