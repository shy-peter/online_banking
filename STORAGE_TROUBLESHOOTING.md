# Storage Troubleshooting Guide

## Current Issues

### 1. "Storage bucket with the requested ID could not be found"
**Cause**: The `files` bucket doesn't exist in your Appwrite project.

**Solution**:
1. Go to https://cloud.appwrite.io
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"Create Bucket"**
5. Fill in these exact details:
   - **Bucket ID**: `files`
   - **Name**: `Files`
   - **File Security**: ✅ **Enabled**
   - **Maximum File Size**: `10485760` (10MB)
   - **Allowed File Extensions**: `jpg,jpeg,png,gif,webp,pdf,doc,docx,txt`
   - **Encryption**: ❌ **Disabled**
   - **Antivirus**: ❌ **Disabled**
6. Click **"Create"**

### 2. "The current user is not authorized to perform the requested action"
**Cause**: Bucket permissions are not set correctly for unauthenticated users.

**Solution**:
1. After creating the bucket, click on it to open settings
2. Go to the **"Settings"** tab
3. In the **"Permissions"** section, add these permissions:
   - `read("any")`
   - `write("any")`
4. Click **"Update"**

## Step-by-Step Setup

### Step 1: Create the Bucket
```
Bucket ID: files
Name: Files
File Security: Enabled
Max File Size: 10485760
Allowed Extensions: jpg,jpeg,png,gif,webp,pdf,doc,docx,txt
Encryption: Disabled
Antivirus: Disabled
```

### Step 2: Set Permissions
```
Permissions:
- read("any")
- write("any")
```

### Step 3: Test the Setup
1. Try the enhanced signup form
2. Select "United States" as country
3. Try uploading an ID document
4. Check browser console for any errors

## Debugging Steps

### Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try the signup process
4. Look for any error messages

### Common Error Messages and Solutions

**"Storage bucket with the requested ID could not be found"**
- Bucket doesn't exist → Create the `files` bucket

**"The current user is not authorized to perform the requested action"**
- Wrong permissions → Set `read("any")` and `write("any")` permissions

**"File size exceeds maximum allowed size"**
- File too large → Reduce file size or increase bucket limit

**"File type not allowed"**
- Wrong file type → Check allowed extensions in bucket settings

## Testing the Enhanced Signup

### Test Cases:
1. **Basic Info**: Fill first name, last name, email, password, phone
2. **Personal Info**: Fill all fields, select "United States" as country
3. **SSN Field**: Should appear when country is "US"
4. **ID Selection**: Choose any ID type (Driver's License, Passport, etc.)
5. **Document Upload**: Try uploading front/back of ID
6. **Secret Phrase**: Set up 6-digit phrase

### Expected Behavior:
- SSN field appears when country = "US"
- ID type selection shows different upload requirements
- File uploads work without authentication errors
- All validation works correctly

## If Issues Persist

### Check These:
1. **Bucket exists**: Go to Storage in Appwrite Console
2. **Bucket ID is exactly**: `files` (case-sensitive)
3. **Permissions are set**: `read("any")` and `write("any")`
4. **File extensions include**: `jpg,jpeg,png,gif,webp,pdf,doc,docx,txt`
5. **Max file size is**: `10485760` bytes (10MB)

### Alternative Solution:
If the bucket setup is still problematic, you can temporarily disable file uploads by commenting out the upload functionality in the components until the bucket is properly configured.

## Contact Support
If you continue to have issues:
1. Check Appwrite documentation: https://appwrite.io/docs
2. Verify your project settings
3. Ensure you have the correct API keys in your `.env` file
