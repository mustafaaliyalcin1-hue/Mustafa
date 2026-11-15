<#
  J.A.R.V.I.S. BİLGİSAYAR KÖPRÜSÜ — Windows kurulumu
  Çalıştırma: bu klasörde kur.ps1'e sağ tık → "PowerShell ile çalıştır"
  (ya da: powershell -ExecutionPolicy Bypass -File kur.ps1)

  Yaptıkları:
   1) Node.js ve Claude Code kurulu mu, Claude Code'a giriş yapılmış mı kontrol eder
   2) Gerekli paketi kurar (npm install)
   3) Sunucu adresini ve KOPRU_SIFRESI'ni sorar → %APPDATA%\JarvisKopru\ayar.json (yalnızca bu bilgisayarda)
   4) Başlangıç klasörüne gizli çalışan kısayol koyar → bilgisayar açılınca köprü kendiliğinden başlar
   5) Köprüyü hemen başlatır
#>
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$burasi = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $burasi
function Tamam($m) { Write-Host "  [OK] $m" -ForegroundColor Green }
function Uyari($m) { Write-Host "  [!]  $m" -ForegroundColor Yellow }

Write-Host "`nJ.A.R.V.I.S. bilgisayar köprüsü kuruluyor...`n" -ForegroundColor Cyan

# 1) Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Uyari "Node.js bulunamadı. https://nodejs.org adresinden LTS sürümünü kurun, sonra bu dosyayı tekrar çalıştırın."
  Read-Host "Kapatmak için Enter"; exit 1
}
Tamam "Node.js $(node --version)"

# Claude Code
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Uyari "Claude Code (claude komutu) bulunamadı. Önce Claude Code'u kurup 'claude' yazarak giriş yapın."
  Read-Host "Kapatmak için Enter"; exit 1
}
Tamam "Claude Code bulundu"

# Giriş yapılmış mı? (kısa bir deneme sorusu)
Write-Host "  Claude Code deneniyor (birkaç saniye sürebilir)..."
$deneme = "Sadece 'tamam' yaz." | claude -p --output-format json --tools '""' --no-session-persistence --strict-mcp-config 2>&1 | Out-String
if ($deneme -match '"is_error"\s*:\s*false') { Tamam "Claude Code çalışıyor ve giriş yapılmış" }
else {
  Uyari "Claude Code cevap vermedi ya da giriş yapılmamış. Bir terminalde 'claude' yazıp giriş yapın."
  Uyari "Kurulum yine de devam ediyor; giriş yapana kadar Jarvis API'yi kullanır."
}

# 2) Paketler
Write-Host "  Paketler kuruluyor..."
npm install --omit=dev --no-audit --no-fund | Out-Null
Tamam "Paketler kuruldu"

# 3) Ayarlar
$ayarKlasoru = Join-Path $env:APPDATA 'JarvisKopru'
New-Item -ItemType Directory -Force -Path $ayarKlasoru | Out-Null
$ayarDosyasi = Join-Path $ayarKlasoru 'ayar.json'
$eski = $null
if (Test-Path $ayarDosyasi) { try { $eski = Get-Content $ayarDosyasi -Raw | ConvertFrom-Json } catch {} }

$varsayilan = if ($eski.sunucu) { $eski.sunucu } else { '' }
$sunucu = Read-Host "Bulut Jarvis sunucu adresi (ör. https://jarvis-server-xxxx.onrender.com) [$varsayilan]"
if (-not $sunucu) { $sunucu = $varsayilan }
if ($sunucu -notmatch '^https?://') { Uyari "Adres https:// ile başlamalı."; Read-Host "Kapatmak için Enter"; exit 1 }

$guvenli = Read-Host "KOPRU_SIFRESI (sunucudakiyle aynı; yazarken görünmez$(if ($eski.sifre) { ', boş bırakırsanız eskisi kalır' }))" -AsSecureString
$sifre = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($guvenli))
if (-not $sifre -and $eski.sifre) { $sifre = $eski.sifre }
if (-not $sifre) { Uyari "Şifre boş olamaz."; Read-Host "Kapatmak için Enter"; exit 1 }

$json = @{ sunucu = $sunucu.TrimEnd('/'); sifre = $sifre } | ConvertTo-Json
[System.IO.File]::WriteAllText($ayarDosyasi, $json, (New-Object System.Text.UTF8Encoding($false)))
# Dosyayı yalnızca bu kullanıcı okuyabilsin
icacls $ayarDosyasi /inheritance:r /grant:r "$($env:USERNAME):(R,W)" | Out-Null
Tamam "Ayarlar kaydedildi: $ayarDosyasi"

# 4) Başlangıç kısayolu (gizli çalışır)
$baslangic = [Environment]::GetFolderPath('Startup')
$kisayol = Join-Path $baslangic 'Jarvis Kopru.lnk'
$wsh = New-Object -ComObject WScript.Shell
$lnk = $wsh.CreateShortcut($kisayol)
$lnk.TargetPath = Join-Path $env:WINDIR 'System32\wscript.exe'
$lnk.Arguments = '"' + (Join-Path $burasi 'gizli-baslat.vbs') + '"'
$lnk.WorkingDirectory = $burasi
$lnk.WindowStyle = 7
$lnk.Description = 'J.A.R.V.I.S. bilgisayar köprüsü'
$lnk.Save()
Tamam "Başlangıç kısayolu oluşturuldu (bilgisayar açılınca köprü sessizce başlar)"

# 5) Eski kopyayı durdur, yenisini başlat
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like '*kopru.mjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Start-Process -FilePath (Join-Path $env:WINDIR 'System32\wscript.exe') -ArgumentList ('"' + (Join-Path $burasi 'gizli-baslat.vbs') + '"')
Start-Sleep -Seconds 4
$log = Join-Path $ayarKlasoru 'kopru.log'
if (Test-Path $log) { Write-Host "`nSon günlük satırları:"; Get-Content $log -Tail 4 }
Write-Host "`nKöprü arka planda çalışıyor. Günlük: $log" -ForegroundColor Cyan
Write-Host "Durdurmak için: durdur.cmd   ·   Görünür çalıştırmak için: baslat.cmd   ·   Kaldırmak için: kaldir.ps1`n"
Read-Host "Kapatmak için Enter"
