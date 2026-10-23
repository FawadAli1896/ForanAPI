$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "ForanAPI.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = 'C:\laragon\www\API\start-foranapi.vbs'
$Shortcut.WorkingDirectory = 'C:\laragon\www\API'
$Shortcut.IconLocation = 'C:\laragon\www\API\public\icon.ico,0'
$Shortcut.Description = "ForanAPI - Lightweight Desktop API Client"
$Shortcut.Save()
Write-Host "Created shortcut successfully at $ShortcutPath"
