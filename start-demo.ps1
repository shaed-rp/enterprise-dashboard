#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DealerX Enterprise Dashboard Demo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "dealerbuilt-dashboard\package.json")) {
    Write-Host "ERROR: Please run this script from the root directory of the project." -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "Expected to find: dealerbuilt-dashboard\package.json" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm version $pnpmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "ERROR: pnpm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install pnpm: npm install -g pnpm" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting the demo frontend..." -ForegroundColor Green
Write-Host ""

# Navigate to frontend directory and start dev server
Set-Location "dealerbuilt-dashboard"

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "The demo will be available at: http://localhost:5173/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Login Credentials:" -ForegroundColor Yellow
Write-Host "- Executive: executive@dealership.com / StrongPassword123!" -ForegroundColor White
Write-Host "- Service Manager: service.manager@dealership.com / StrongPassword123!" -ForegroundColor White
Write-Host "- Sales Manager: sales.manager@dealership.com / StrongPassword123!" -ForegroundColor White
Write-Host "- Staff: staff@dealership.com / StrongPassword123!" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

pnpm dev
