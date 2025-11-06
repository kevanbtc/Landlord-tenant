# UNYKORN AI LAB ONE-CLICK LAUNCHER
# This script starts your entire sovereign AI development environment

Write-Host "🚀 Starting UNYKORN AI Lab..." -ForegroundColor Green

# Check if Ollama is installed
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
if (!(Test-Path $ollamaPath)) {
    Write-Host "❌ Ollama not found. Please run OllamaSetup.exe first." -ForegroundColor Red
    exit 1
}

# Check if VS Code is available
if (!(Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Host "❌ VS Code not found in PATH. Please install VS Code." -ForegroundColor Red
    exit 1
}

# Get the current directory (AI Lab root)
$labRoot = Get-Location

# Start Ollama server in background
Write-Host "🖥️  Starting Ollama server..." -ForegroundColor Yellow
$ollamaJob = Start-Job -ScriptBlock {
    param($path)
    & $path serve
} -ArgumentList $ollamaPath

# Wait for Ollama to start
Write-Host "⏳ Waiting for Ollama to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verify Ollama is responding
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Ollama server is running and responding" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Ollama server not responding. Please check the logs." -ForegroundColor Red
    exit 1
}

# Open VS Code in the lab folder
Write-Host "🔧 Opening VS Code in AI Lab..." -ForegroundColor Yellow
Start-Process -FilePath "code" -ArgumentList $labRoot -NoNewWindow

# Wait a moment for VS Code to load
Start-Sleep -Seconds 5

# Check if orchestrator exists and run it
$orchestratorPath = Join-Path $labRoot "ai-orchestrator\orchestrator.js"
if (Test-Path $orchestratorPath) {
    Write-Host "🤖 Starting AI Orchestrator..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList $orchestratorPath -NoNewWindow
} else {
    Write-Host "ℹ️  Orchestrator not found. Run manually when ready." -ForegroundColor Cyan
}

Write-Host "" -ForegroundColor White
Write-Host "🎉 UNYKORN AI Lab is now running!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. VS Code should open automatically" -ForegroundColor White
Write-Host "2. Start coding - Supermaven will provide completions" -ForegroundColor White
Write-Host "3. Use Ctrl+Shift+L for Continue chat" -ForegroundColor White
Write-Host "4. Check terminal for orchestrator status" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Launcher completed. AI Lab is running in the background." -ForegroundColor Cyan
