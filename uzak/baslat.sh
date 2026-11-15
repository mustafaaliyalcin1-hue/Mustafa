#!/bin/sh
cd "$(dirname "$0")"
python3 -c "import pyautogui, PIL, pyperclip" 2>/dev/null || python3 -m pip install -q -r gereksinimler.txt
python3 uzak_kontrol.py
