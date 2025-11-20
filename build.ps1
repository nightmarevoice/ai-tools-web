# PowerShell script to build Next.js with static export
# Temporarily rename middleware.ts if it exists

$middlewareExists = Test-Path "middleware.ts"
$backupName = "middleware.ts.bak"

if ($middlewareExists) {
    Write-Host "Temporarily renaming middleware.ts for static export..."
    if (Test-Path $backupName) {
        Remove-Item $backupName -Force
    }
    Rename-Item -Path "middleware.ts" -NewName $backupName -Force
}

try {
    Write-Host "Running next build..."
    & npm run build:next
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "Build failed: $_" -ForegroundColor Red
    if ($middlewareExists -and (Test-Path $backupName)) {
        Write-Host "Restoring middleware.ts..."
        Rename-Item -Path $backupName -NewName "middleware.ts" -Force
    }
    exit 1
} finally {
    if ($middlewareExists -and (Test-Path $backupName)) {
        Write-Host "Restoring middleware.ts..."
        Rename-Item -Path $backupName -NewName "middleware.ts" -Force
    }
}

Write-Host "Build completed successfully!" -ForegroundColor Green

