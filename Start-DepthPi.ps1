# Depth Pi launcher
# Run from PowerShell with:
#   powershell -ExecutionPolicy Bypass -File .\Start-DepthPi.ps1

$ErrorActionPreference = "Stop"

$piPackage = "@earendil-works/pi-coding-agent"
$defaultModel = "mistral/glm-5-2"

function Test-CommandAvailable {
    param([string]$Name)

    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host "Depth Pi launcher" -ForegroundColor Cyan
Write-Host "Project: $PSScriptRoot"
Write-Host ""

if (-not (Test-CommandAvailable "node") -or -not (Test-CommandAvailable "npm")) {
    Write-Host "Node.js en npm zijn vereist maar werden niet gevonden." -ForegroundColor Yellow
    Write-Host "Installeer de huidige LTS-versie van https://nodejs.org/ en voer dit script opnieuw uit."
    exit 1
}

if (-not (Test-CommandAvailable "pi")) {
    Write-Host "Pi werd niet gevonden. Het wordt nu globaal geïnstalleerd..." -ForegroundColor Yellow

    npm install -g --ignore-scripts $piPackage

    if ($LASTEXITCODE -ne 0) {
        throw "Pi-installatie is mislukt. Controleer de npm-uitvoer hierboven."
    }
}

Set-Location -LiteralPath $PSScriptRoot

Write-Host ""
Write-Host "Pi starten in de depth-omgeving..." -ForegroundColor Green
Write-Host "Model: $defaultModel"
Write-Host "Gebruik /login in Pi als je nog niet geauthenticeerd bent."
Write-Host ""

pi --model $defaultModel

exit $LASTEXITCODE
