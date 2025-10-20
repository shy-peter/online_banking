# Fix permissions for transfers collection
# This PowerShell script updates the permissions to allow users to create, read, update, and delete transfers

Write-Host "Fixing permissions for transfers collection..." -ForegroundColor Green

# Update collection permissions
try {
    appwrite databases update-collection `
        --database-id investflow-db `
        --collection-id transfers `
        --name "Transfers" `
        --permissions 'read("any")' `
        --permissions 'create("any")' `
        --permissions 'update("any")' `
        --permissions 'delete("any")'

    Write-Host "Permissions updated successfully!" -ForegroundColor Green
    Write-Host "Users can now create, read, update, and delete transfers." -ForegroundColor Green
} catch {
    Write-Host "Error updating permissions: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you have the Appwrite CLI installed and are logged in." -ForegroundColor Yellow
}
