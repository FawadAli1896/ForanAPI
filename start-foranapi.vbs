Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\laragon\www\API"
WshShell.Run "cmd /c npx electron .", 0, False
