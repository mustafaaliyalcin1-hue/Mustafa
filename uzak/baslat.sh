#!/bin/sh
cd "$(dirname "$0")"
python3 -m pip install -q -r gereksinimler.txt
python3 uzak_kontrol.py
