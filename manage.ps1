# Hermes AgentFlow Studio management script for PowerShell
# Usage: .\manage.ps1 [deploy|update|start|stop|restart|status|logs|shell|backup|restore|prune]

param(
    [Parameter(Position=0)]
    [string]$Command,

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$RepoUrl = if ($env:REPO_URL) { $env:REPO_URL } else { "" }
$ProjectDir = if ($env:PROJECT_DIR) { $env:PROJECT_DIR } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$ComposeFile = if ($env:COMPOSE_FILE) { $env:COMPOSE_FILE } else { "docker-compose.yml" }
$BackupDir = Join-Path $ProjectDir "backups"
$DataDir = Join-Path $ProjectDir "data/agentflow"

function Test-Prereqs {
    $cmds = @("docker", "git", "curl")
    foreach ($cmd in $cmds) {
        if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
            Write-Error "ERROR: $cmd is not installed."
            exit 1
        }
    }
}

function Ensure-RepoUrl {
    if ([string]::IsNullOrWhiteSpace($RepoUrl)) {
        $RepoUrl = Read-Host "Enter the GitHub repository URL"
        if ([string]::IsNullOrWhiteSpace($RepoUrl)) {
            Write-Error "ERROR: GitHub URL is required."
            exit 1
        }
        $env:REPO_URL = $RepoUrl
    }
}

function Clone-OrPull {
    Ensure-RepoUrl
    Set-Location $ProjectDir
    if (Test-Path (Join-Path $ProjectDir ".git")) {
        Write-Host "Pulling latest changes from ${RepoUrl}..."
        git pull
    } else {
        Write-Host "Cloning ${RepoUrl} into ${ProjectDir}..."
        git clone $RepoUrl $ProjectDir
    }
}

function Deploy {
    Test-Prereqs
    Ensure-RepoUrl
    Clone-OrPull
    Set-Location $ProjectDir
    Write-Host "Building Docker images and starting services..."
    docker compose -f $ComposeFile up -d --build
    Write-Host "Deployment complete. Run '.\manage.ps1 status' to verify."
}

function Update {
    Test-Prereqs
    Set-Location $ProjectDir
    Write-Host "Pulling latest changes..."
    git pull
    Write-Host "Rebuilding and restarting services..."
    docker compose -f $ComposeFile down
    docker compose -f $ComposeFile up -d --build
    Write-Host "Update complete."
}

function Start-App {
    Test-Prereqs
    Set-Location $ProjectDir
    docker compose -f $ComposeFile up -d
    $frontendPort = if ($env:AGENTFLOW_FRONTEND_PORT) { $env:AGENTFLOW_FRONTEND_PORT } else { 3080 }
    Write-Host "Started. Frontend: http://localhost:${frontendPort}"
}

function Stop-App {
    Set-Location $ProjectDir
    docker compose -f $ComposeFile down
    Write-Host "Stopped."
}

function Restart-App {
    Stop-App
    Start-App
}

function Get-Status {
    Set-Location $ProjectDir
    docker compose -f $ComposeFile ps
    Write-Host ""
    Write-Host "Health checks:"
    $frontendPort = if ($env:AGENTFLOW_FRONTEND_PORT) { $env:AGENTFLOW_FRONTEND_PORT } else { 3080 }
    $backendPort = if ($env:AGENTFLOW_BACKEND_PORT) { $env:AGENTFLOW_BACKEND_PORT } else { 8080 }
    try {
        Invoke-RestMethod -Uri "http://localhost:${frontendPort}/" -UseBasicParsing | Out-Null
        Write-Host "Frontend OK"
    } catch {
        Write-Host "Frontend not reachable"
    }
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:${backendPort}/api/health" -UseBasicParsing
        Write-Host "Backend OK" ($resp | ConvertTo-Json -Compress)
    } catch {
        Write-Host "Backend not reachable"
    }
}

function Get-Logs {
    param([string]$Service = "")
    Set-Location $ProjectDir
    if ($Service) {
        docker compose -f $ComposeFile logs -f $Service
    } else {
        docker compose -f $ComposeFile logs -f
    }
}

function Open-Shell {
    param([string]$Service = "agentflow-backend")
    Set-Location $ProjectDir
    docker compose -f $ComposeFile exec $Service sh
}

function Backup-Data {
    if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $archive = Join-Path $BackupDir "agentflow-${stamp}.tar.gz"
    Write-Host "Backing up ${DataDir} to ${archive}..."
    tar -czf $archive -C $ProjectDir "data/agentflow"
    Write-Host "Backup complete: ${archive}"
}

function Restore-Data {
    $backups = Get-ChildItem -Path $BackupDir -Filter "*.tar.gz" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if (-not $backups) {
        Write-Host "No backups found."
        exit 1
    }
    Write-Host "Available backups:"
    $backups | ForEach-Object { Write-Host $_.Name }
    $file = Read-Host "Enter backup filename to restore"
    $fullPath = Join-Path $BackupDir $file
    if (-not (Test-Path $fullPath)) {
        Write-Error "ERROR: backup not found."
        exit 1
    }
    Stop-App
    Write-Host "Restoring ${file}..."
    $bakDir = "${DataDir}.bak"
    if (Test-Path $bakDir) { Remove-Item -Recurse -Force $bakDir }
    if (Test-Path $DataDir) { Move-Item $DataDir $bakDir }
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
    tar -xzf $fullPath -C $ProjectDir
    Start-App
    Write-Host "Restore complete."
}

function Prune-Resources {
    Write-Host "Stopping services and cleaning Docker images/volumes..."
    Set-Location $ProjectDir
    docker compose -f $ComposeFile down -v
    docker system prune -af
    Write-Host "Pruned."
}

function Show-Menu {
    Write-Host "Hermes AgentFlow Studio Manager"
    Write-Host "Project: ${ProjectDir}"
    Write-Host "Compose: ${ComposeFile}"
    Write-Host ""
    Write-Host "1) deploy   - Clone/pull repo and start"
    Write-Host "2) update   - Pull latest and rebuild"
    Write-Host "3) start    - Start services"
    Write-Host "4) stop     - Stop services"
    Write-Host "5) restart  - Restart services"
    Write-Host "6) status   - Show status and health"
    Write-Host "7) logs     - Follow logs"
    Write-Host "8) shell    - Open container shell"
    Write-Host "9) backup   - Backup SQLite data"
    Write-Host "10) restore - Restore SQLite data"
    Write-Host "11) prune   - Clean Docker resources"
    Write-Host ""
    $choice = Read-Host "Choose an action [1-11]"
    switch ($choice) {
        "1" { Deploy }
        "2" { Update }
        "3" { Start-App }
        "4" { Stop-App }
        "5" { Restart-App }
        "6" { Get-Status }
        "7" { $svc = Read-Host "Service name (optional)"; Get-Logs $svc }
        "8" { $svc = Read-Host "Service name [agentflow-backend]"; if ($svc) { Open-Shell $svc } else { Open-Shell "agentflow-backend" } }
        "9" { Backup-Data }
        "10" { Restore-Data }
        "11" { Prune-Resources }
        default { Write-Host "Invalid choice."; exit 1 }
    }
}

switch ($Command.ToLower()) {
    "deploy" { Deploy }
    "update" { Update }
    "start" { Start-App }
    "stop" { Stop-App }
    "restart" { Restart-App }
    "status" { Get-Status }
    "logs" { Get-Logs $Args[0] }
    "shell" { Open-Shell $Args[0] }
    "backup" { Backup-Data }
    "restore" { Restore-Data }
    "prune" { Prune-Resources }
    "" { Show-Menu }
    default {
        Write-Host "Unknown command: $Command"
        Write-Host "Usage: .\manage.ps1 [deploy|update|start|stop|restart|status|logs|shell|backup|restore|prune]"
        exit 1
    }
}
