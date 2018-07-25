echo '
delay 1.5
tell application "Photoshop" to activate
delay 0.1
tell application "System Events" to keystroke "t" using command down
delay 0.02
tell application "System Events" to key code 36
' | osascript