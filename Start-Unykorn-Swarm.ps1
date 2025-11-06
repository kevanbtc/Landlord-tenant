# === CONFIG: paths ===
$stackPath = "C:\Users\Kevan\Desktop\private-dev-stack"
$pythonExe = "C:\Users\Kevan\Desktop\private-dev-stack\venv\Scripts\python.exe"
$repoPath  = "C:\Users\Kevan\stablecoin and cbdc"

Write-Host "Starting Unykorn Avengers swarm from $stackPath ..." -ForegroundColor Cyan

# 1) Start the agent server in a new PowerShell window, keep it open
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$stackPath`"; & `"$pythonExe`" -m uvicorn agent_server:app --reload --host 0.0.0.0 --port 8000"
)

# 2) Open your Unykorn repo in VS Code
Write-Host "Opening VS Code at $repoPath ..." -ForegroundColor Cyan
Start-Process "code" $repoPath
