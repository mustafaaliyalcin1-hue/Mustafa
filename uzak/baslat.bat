@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Gerekli paketler kontrol ediliyor...
python -m pip install -q -r gereksinimler.txt
python uzak_kontrol.py
pause
