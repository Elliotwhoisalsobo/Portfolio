@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-DepthPi.ps1"
if errorlevel 1 (
    echo.
    echo Depth Pi could not be started. See the message above.
    pause
)
endlocal
