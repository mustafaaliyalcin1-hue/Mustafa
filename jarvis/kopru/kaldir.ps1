# J.A.R.V.I.S. köprüsünü kaldırır: çalışan köprüyü durdurur, Başlangıç kısayolunu ve ayarları siler.
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like '*kopru.mjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path ([Environment]::GetFolderPath('Startup')) 'Jarvis Kopru.lnk')
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $env:APPDATA 'JarvisKopru')
Write-Host "Köprü kaldırıldı."
Read-Host "Kapatmak için Enter"
