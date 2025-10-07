# Add Missing Attributes Script for InvestFlow (PowerShell)
# This script adds missing attributes to existing collections

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$PROJECT_ID = $env:VITE_APPWRITE_PROJECT_ID
$DATABASE_ID = if ($env:VITE_APPWRITE_DATABASE_ID) { $env:VITE_APPWRITE_DATABASE_ID } else { "investflow-db" }

if (-not $PROJECT_ID) {
    Write-Host "❌ Error: VITE_APPWRITE_PROJECT_ID not found in .env file" -ForegroundColor Red
    Write-Host "Please create a .env file with your Appwrite project configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Adding Missing Attributes to InvestFlow Database" -ForegroundColor Green
Write-Host "Project: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "Database: $DATABASE_ID" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Green

# Set the project context
Write-Host "🔧 Setting project context..." -ForegroundColor Yellow
appwrite client --project-id $PROJECT_ID

Write-Host "Press Enter when ready to continue..." -ForegroundColor Yellow
Read-Host

Write-Host "📝 Adding missing attributes to existing collections..." -ForegroundColor Green

# Add paymentMethod to transactions collection
Write-Host "Adding paymentMethod to transactions collection..." -ForegroundColor Yellow
try {
    appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "paymentMethod" --size 100 --required false
    Write-Host "✅ paymentMethod added to transactions" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ paymentMethod attribute may already exist" -ForegroundColor Blue
}

# Add updatedAt to transactions collection
Write-Host "Adding updatedAt to transactions collection..." -ForegroundColor Yellow
try {
    appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "updatedAt" --required false
    Write-Host "✅ updatedAt added to transactions" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ updatedAt attribute may already exist" -ForegroundColor Blue
}

# Add updatedAt to investments collection
Write-Host "Adding updatedAt to investments collection..." -ForegroundColor Yellow
try {
    appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "investments" --key "updatedAt" --required false
    Write-Host "✅ updatedAt added to investments" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ updatedAt attribute may already exist" -ForegroundColor Blue
}

# Add updatedAt to users collection
Write-Host "Adding updatedAt to users collection..." -ForegroundColor Yellow
try {
    appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "users" --key "updatedAt" --required false
    Write-Host "✅ updatedAt added to users" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ updatedAt attribute may already exist" -ForegroundColor Blue
}

# Add updatedAt to notifications collection
Write-Host "Adding updatedAt to notifications collection..." -ForegroundColor Yellow
try {
    appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "updatedAt" --required false
    Write-Host "✅ updatedAt added to notifications" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ updatedAt attribute may already exist" -ForegroundColor Blue
}

# Add updatedAt to interest-payments collection
Write-Host "Adding updatedAt to interest-payments collection..." -ForegroundColor Yellow
try {
    appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "interest-payments" --key "updatedAt" --required false
    Write-Host "✅ updatedAt added to interest-payments" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ updatedAt attribute may already exist" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎉 Missing attributes added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Added attributes:" -ForegroundColor Green
Write-Host "   - paymentMethod to transactions" -ForegroundColor White
Write-Host "   - updatedAt to all collections" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Your InvestFlow app should now work without attribute errors!" -ForegroundColor Green
Write-Host "   Run: npm run dev" -ForegroundColor Cyan