@echo off
rem Arka planda calisan J.A.R.V.I.S. koprusunu durdurur.
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*kopru.mjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host 'Kopru durduruldu.' }"
pause
