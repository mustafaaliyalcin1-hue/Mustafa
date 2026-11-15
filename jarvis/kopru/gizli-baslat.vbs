' J.A.R.V.I.S. kopru: pencere acmadan (gizli) baslatir.
' Windows Baslangic klasorundeki kisayol bu dosyayi calistirir.
Set fso = CreateObject("Scripting.FileSystemObject")
klasor = fso.GetParentFolderName(WScript.ScriptFullName)
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = klasor
' 0 = gizli pencere, False = bekleme
sh.Run "node """ & klasor & "\kopru.mjs""", 0, False
