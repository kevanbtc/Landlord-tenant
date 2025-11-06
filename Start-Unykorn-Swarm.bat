@echo off
echo Starting Unykorn Avengers swarm...

REM Start the agent server in a new PowerShell window
start powershell -NoExit -Command "cd 'C:\Users\Kevan\Desktop\private-dev-stack'; python -m uvicorn agent_server:app --reload --host 0.0.0.0 --port 8000"

REM Open VS Code
start code "C:\Users\Kevan\stablecoin and cbdc"

echo Swarm started and VS Code opened.
pause
