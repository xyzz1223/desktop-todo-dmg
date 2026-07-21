' Desktop Todo - 开机自启脚本
' 静默启动，不显示命令行窗口
Set ws = CreateObject("WScript.Shell")
ws.Run """C:\Users\86136\Desktop\desktop-todo\node_modules\electron\dist\electron.exe"" ""C:\Users\86136\Desktop\desktop-todo""", 0, False
