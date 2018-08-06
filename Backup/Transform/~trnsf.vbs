WScript.Sleep 1500

' x=msgbox("Your Text Here" ,0, "Your Title Here")

Set WshShell = WScript.CreateObject("WScript.Shell")

WshShell.SendKeys "^t"
WshShell.SendKeys "~"