Set ws = CreateObject("WScript.Shell")
Set shortcut = ws.CreateShortcut(ws.SpecialFolders("Desktop") & "\GraphLab Studio.lnk")
shortcut.TargetPath = "c:\Users\akg11\OneDrive\Desktop\GraphLab_Source\build3\win-unpacked\GraphLab Studio.exe"
shortcut.WorkingDirectory = "c:\Users\akg11\OneDrive\Desktop\GraphLab_Source\build3\win-unpacked"
shortcut.IconLocation = "c:\Users\akg11\OneDrive\Desktop\GraphLab_Source\icon.ico,0"
shortcut.Description = "GraphLab Studio"
shortcut.Save
WScript.Echo "Shortcut updated with new icon!"
