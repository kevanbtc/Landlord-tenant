# UNYKORN AI LAB BOOTSTRAP SCRIPT
# This script sets up your complete AI development environment

Write-Host "🚀 Starting UNYKORN AI Lab Bootstrap..." -ForegroundColor Green

# Check if Ollama is installed
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
if (!(Test-Path $ollamaPath)) {
    Write-Host "❌ Ollama not found. Please run OllamaSetup.exe first." -ForegroundColor Red
    exit 1
}

# Create environment file if it doesn't exist
$envFile = "$env:USERPROFILE\.unykorn_env"
if (!(Test-Path $envFile)) {
    Write-Host "📝 Creating environment configuration file..." -ForegroundColor Yellow
    $envContent = @"
# Unified AI Environment Configuration
# Add your API keys here

OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OLLAMA_HOST=http://localhost:11434
GITHUB_TOKEN=your_github_token_here

DEFAULT_LOCAL_MODEL=llama3.2
DEFAULT_CLOUD_MODEL=gpt-4
SECURE_AT_INCEPTION=true
CLEAN_CODE=true
LOCAL_FIRST=true
"@
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "Created $envFile - Please add your API keys!" -ForegroundColor Green
} else {
    Write-Host "✅ Environment file already exists at $envFile" -ForegroundColor Green
}

# Load environment variables
Write-Host "🔧 Loading environment variables..." -ForegroundColor Yellow
Get-Content $envFile | Where-Object { $_ -match '^[^#]' -and $_ -match '=' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), "Process")
}

# Start Ollama server
Write-Host "🖥️  Starting Ollama server..." -ForegroundColor Yellow
Start-Process -FilePath $ollamaPath -ArgumentList "serve" -NoNewWindow

# Wait for Ollama to start
Start-Sleep -Seconds 5

# Pull essential models
Write-Host "📥 Pulling essential AI models..." -ForegroundColor Yellow
$models = @("llama3.2", "deepseek-coder-v2:16b", "mistral", "nomic-embed-text")

foreach ($model in $models) {
    Write-Host "  Pulling $model..." -ForegroundColor Cyan
    & $ollamaPath pull $model
}

# Install VS Code extensions
Write-Host "🔌 Installing VS Code extensions..." -ForegroundColor Yellow
$extensions = @(
    "ms-windows-ai-studio.windows-ai-studio",
    "continue.continue",
    "rooveterinaryinc.roo-cline",
    "supermaven.supermaven",
    "github.copilot",
    "github.copilot-chat",
    "ms-python.python",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers",
    "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-wsl",
    "ms-vscode.powershell",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
)

foreach ($ext in $extensions) {
    Write-Host "  Installing $ext..." -ForegroundColor Cyan
    & code --install-extension $ext --force
}

# Create Continue config
Write-Host "⚙️  Configuring Continue extension..." -ForegroundColor Yellow
$continueConfig = "$env:USERPROFILE\.continue\config.json"
if (!(Test-Path (Split-Path $continueConfig))) {
    New-Item -ItemType Directory -Path (Split-Path $continueConfig) -Force
}

@"
{
  "models": [
    {
      "title": "Ollama Llama3.2",
      "provider": "ollama",
      "model": "llama3.2",
      "apiBase": "http://localhost:11434"
    },
    {
      "title": "Ollama DeepSeek Coder",
      "provider": "ollama",
      "model": "deepseek-coder-v2:16b",
      "apiBase": "http://localhost:11434"
    },
    {
      "title": "Ollama Mistral",
      "provider": "ollama",
      "model": "mistral",
      "apiBase": "http://localhost:11434"
    },
    {
      "title": "OpenAI GPT-4",
      "provider": "openai",
      "model": "gpt-4",
      "apiKey": "`${env:OPENAI_API_KEY}"
    },
    {
      "title": "Anthropic Claude",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "`${env:ANTHROPIC_API_KEY}"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Ollama DeepSeek Coder",
    "provider": "ollama",
    "model": "deepseek-coder-v2:16b"
  },
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text"
  }
}
"@ | Out-File -FilePath $continueConfig -Encoding UTF8

# Create Blackbox config
Write-Host "⚙️  Configuring Blackbox extension..." -ForegroundColor Yellow
$blackboxConfig = "$env:USERPROFILE\.blackbox\config.json"
if (!(Test-Path (Split-Path $blackboxConfig))) {
    New-Item -ItemType Directory -Path (Split-Path $blackboxConfig) -Force
}

@"
{
  "models": {
    "ollama": {
      "apiBase": "http://localhost:11434",
      "models": ["llama3.2", "deepseek-coder-v2:16b", "mistral"]
    },
    "openai": {
      "apiBase": "https://api.openai.com/v1",
      "apiKey": "`${env:OPENAI_API_KEY}",
      "models": ["gpt-4", "gpt-3.5-turbo"]
    },
    "anthropic": {
      "apiBase": "https://api.anthropic.com",
      "apiKey": "`${env:ANTHROPIC_API_KEY}",
      "models": ["claude-3-5-sonnet-20241022"]
    },
    "google": {
      "apiBase": "https://generativelanguage.googleapis.com",
      "apiKey": "`${env:GEMINI_API_KEY}",
      "models": ["gemini-pro"]
    }
  },
  "defaultModel": "ollama/llama3.2",
  "fallbackModel": "openai/gpt-4",
  "localFirst": true,
  "secureAtInception": true,
  "cleanCode": true,
  "multiAgent": true,
  "parallelProcessing": true
}
"@ | Out-File -FilePath $blackboxConfig -Encoding UTF8

# Configure VS Code settings for AI integration
Write-Host "⚙️  Configuring VS Code settings..." -ForegroundColor Yellow
$vsCodeSettings = "$env:APPDATA\Code\User\settings.json"
$settings = Get-Content $vsCodeSettings -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json -ErrorAction SilentlyContinue

if (!$settings) {
    $settings = @{}
}

# Add AI-related settings
$settings | Add-Member -NotePropertyName "continue.telemetryEnabled" -NotePropertyValue $false -Force
$settings | Add-Member -NotePropertyName "github.copilot.enable" -NotePropertyValue $true -Force
$settings | Add-Member -NotePropertyName "blackbox.localFirst" -NotePropertyValue $true -Force
$settings | Add-Member -NotePropertyName "window.titleBarStyle" -NotePropertyValue "custom" -Force

# Supermaven settings
$settings | Add-Member -NotePropertyName "supermaven.disable" -NotePropertyValue $false -Force
$settings | Add-Member -NotePropertyName "supermaven.maxContextLength" -NotePropertyValue 2048 -Force
$settings | Add-Member -NotePropertyName "supermaven.maxCompletionLength" -NotePropertyValue 256 -Force
$settings | Add-Member -NotePropertyName "supermaven.suggestionDelay" -NotePropertyValue 0 -Force
$settings | Add-Member -NotePropertyName "supermaven.filterCompletions" -NotePropertyValue $true -Force

$settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $vsCodeSettings -Encoding UTF8

Write-Host "🎉 UNYKORN AI Lab setup complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit $envFile and add your API keys" -ForegroundColor White
Write-Host "2. Restart VS Code to load all extensions" -ForegroundColor White
Write-Host "3. Open Continue chat (Ctrl+Shift+L) to test models" -ForegroundColor White
Write-Host "4. Use Blackbox for multi-agent workflows" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Your sovereign AI grid is ready! 🚀" -ForegroundColor Green
