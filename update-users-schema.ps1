# PowerShell script to update the users collection schema in Appwrite
# This adds the missing fields needed for enhanced signup functionality

Write-Host "🚀 Updating Appwrite Users Collection Schema" -ForegroundColor Blue
Write-Host "=================================================="

# Check if Appwrite CLI is installed
try {
    $null = Get-Command appwrite -ErrorAction Stop
    Write-Host "✅ Appwrite CLI is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Appwrite CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "npm install -g appwrite-cli"
    Write-Host "or"
    Write-Host "curl -sL https://appwrite.io/cli/install.sh | bash"
    exit 1
}

# Check if user is logged in
try {
    appwrite account get | Out-Null
    Write-Host "✅ Logged in to Appwrite CLI" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Appwrite CLI." -ForegroundColor Red
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "appwrite login"
    exit 1
}

# Database and Collection IDs
$DATABASE_ID = "investflow-db"
$COLLECTION_ID = "users"

Write-Host "📋 Adding new attributes to users collection..." -ForegroundColor Blue

# Add secretPhrase attribute (string)
Write-Host "Adding secretPhrase (string)..." -ForegroundColor Yellow
try {
    appwrite databases createStringAttribute --databaseId="$DATABASE_ID" --collectionId="$COLLECTION_ID" --key="secretPhrase" --size=255 --required=false --default="" --array=false
    Write-Host "✅ secretPhrase attribute added" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add secretPhrase attribute" -ForegroundColor Red
}

# Add documents attribute (object)
Write-Host "Adding documents (object)..." -ForegroundColor Yellow
try {
    appwrite databases createStringAttribute --databaseId="$DATABASE_ID" --collectionId="$COLLECTION_ID" --key="documents" --size=10000 --required=false --default="{}" --array=false
    Write-Host "✅ documents attribute added" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add documents attribute" -ForegroundColor Red
}

# Add personalInfo attribute (object)
Write-Host "Adding personalInfo (object)..." -ForegroundColor Yellow
try {
    appwrite databases createStringAttribute --databaseId="$DATABASE_ID" --collectionId="$COLLECTION_ID" --key="personalInfo" --size=10000 --required=false --default="{}" --array=false
    Write-Host "✅ personalInfo attribute added" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add personalInfo attribute" -ForegroundColor Red
}

# Add isVerified attribute (boolean)
Write-Host "Adding isVerified (boolean)..." -ForegroundColor Yellow
try {
    appwrite databases createBooleanAttribute --databaseId="$DATABASE_ID" --collectionId="$COLLECTION_ID" --key="isVerified" --required=false --default=false --array=false
    Write-Host "✅ isVerified attribute added" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add isVerified attribute" -ForegroundColor Red
}

# Add verificationStatus attribute (string)
Write-Host "Adding verificationStatus (string)..." -ForegroundColor Yellow
try {
    appwrite databases createStringAttribute --databaseId="$DATABASE_ID" --collectionId="$COLLECTION_ID" --key="verificationStatus" --size=50 --required=false --default="pending" --array=false
    Write-Host "✅ verificationStatus attribute added" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add verificationStatus attribute" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Summary of added attributes:" -ForegroundColor Blue
Write-Host "=================================================="
Write-Host "✅ secretPhrase - String (255 chars, optional)" -ForegroundColor Green
Write-Host "✅ documents - String/JSON (10KB, optional)" -ForegroundColor Green
Write-Host "✅ personalInfo - String/JSON (10KB, optional)" -ForegroundColor Green
Write-Host "✅ isVerified - Boolean (optional, default: false)" -ForegroundColor Green
Write-Host "✅ verificationStatus - String (50 chars, optional, default: 'pending')" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Blue
Write-Host "1. Update your AuthContext.tsx to include these fields"
Write-Host "2. Test the enhanced signup functionality"
Write-Host "3. Verify that all data is being saved correctly"

Write-Host ""
Write-Host "🎉 Schema update completed!" -ForegroundColor Green
Write-Host "Note: If some attributes already exist, you'll see warnings but the script will continue." -ForegroundColor Yellow
