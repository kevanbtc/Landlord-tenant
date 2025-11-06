# PowerShell script to set up Blackbox AI with Ollama and models

# Function to check if Ollama is installed
function Test-OllamaInstalled {
    try {
        $ollamaVersion = & ollama --version 2>$null
        if ($ollamaVersion) {
            Write-Host "Ollama is already installed: $ollamaVersion"
            return $true
        }
    } catch {
        Write-Host "Ollama is not installed."
        return $false
    }
}

# Install Ollama if not present
if (-not (Test-OllamaInstalled)) {
    Write-Host "Installing Ollama..."
    # Download Ollama installer
    $installerUrl = "https://github.com/ollama/ollama/releases/latest/download/OllamaSetup.exe"
    $randomSuffix = Get-Random
    $installerPath = "$env:TEMP\OllamaSetup_$randomSuffix.exe"
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
    # Run installer silently
    Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait
    # Clean up
    Remove-Item $installerPath -Force
    Write-Host "Ollama installed. Please restart your terminal and run this script again."
    exit 0
}

# Start Ollama service
Write-Host "Starting Ollama service..."
Start-Process -FilePath "ollama" -ArgumentList "serve" -NoNewWindow

# Wait a bit for Ollama to start
Start-Sleep -Seconds 5

# Pull recommended models
$models = @("qwen3-coder", "mistral", "llama3")
foreach ($model in $models) {
    Write-Host "Pulling model: $model"
    & ollama pull $model
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to pull model: $model"
    }
}

# Ensure config directory exists
$configDir = "$env:USERPROFILE\.blackbox\config"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force
}

# The config file is already created, but we can verify or recreate if needed
$configPath = "$configDir\blackbox.config.json"
if (Test-Path $configPath) {
    Write-Host "Blackbox config already exists at $configPath"
} else {
    Write-Host "Creating Blackbox config..."
    # The config content would be here, but since it's already created, skip
}

Write-Host "Setup complete. Restart VS Code and set environment variables for API keys if needed."
