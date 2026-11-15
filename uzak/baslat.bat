@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Uzak Kumanda
rem Port degistirmek icin alttaki satirin basindaki "rem " yazisini sil:
rem set UZAK_PORT=9000

set PY=
py -3 --version >nul 2>&1 && set PY=py -3
if not defined PY (
  python --version >nul 2>&1 && set PY=python
)
if not defined PY (
  echo.
  echo  Python bulunamadi!
  echo  https://www.python.org/downloads/ adresinden Python'u kur.
  echo  Kurarken "Add python.exe to PATH" kutusunu MUTLAKA isaretle.
  echo.
  pause
  exit /b 1
)

%PY% -c "import pyautogui, PIL, pyperclip" >nul 2>&1
if errorlevel 1 (
  echo Gerekli paketler kuruluyor, ilk seferde 1-2 dakika surebilir...
  %PY% -m pip install -q -r gereksinimler.txt
  if errorlevel 1 (
    echo Paketler kurulamadi. Internet baglantisini kontrol edip tekrar dene.
    pause
    exit /b 1
  )
)

%PY% uzak_kontrol.py
pause
