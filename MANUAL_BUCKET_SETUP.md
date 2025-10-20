# Manual Storage Bucket Setup - CRITICAL

## 🚨 URGENT: You MUST create the storage bucket manually

The error "The current user is not authorized to perform the requested action" means the storage bucket either:
1. **Doesn't exist** - You need to create it
2. **Has wrong permissions** - You need to fix the permissions

## Step-by-Step Setup (REQUIRED)

### Step 1: Go to Appwrite Console
1. Open: https://cloud.appwrite.io
2. Sign in to your account
3. Select your project

### Step 2: Create the Storage Bucket
1. Click **"Storage"** in the left sidebar
2. Click **"Create Bucket"** button
3. Fill in these EXACT details:

```
Bucket ID: files
Name: Files
File Security: ✅ ENABLED
Maximum File Size: 10485760
Allowed File Extensions: jpg,jpeg,png,gif,webp,pdf,doc,docx,txt
Encryption: ❌ DISABLED
Antivirus: ❌ DISABLED
```

4. Click **"Create"**

### Step 3: Set Permissions (CRITICAL)
1. After creating the bucket, click on the **"files"** bucket
2. Go to the **"Settings"** tab
3. Scroll down to **"Permissions"** section
4. Add these permissions (one by one):
   - `read("any")`
   - `write("any")`
5. Click **"Update"**

### Step 4: Verify Setup
1. Go back to **"Storage"** → **"files"** bucket
2. Check that permissions show:
   - `read("any")`
   - `write("any")`
3. Test the signup form

## Alternative: Use CLI (if you have Appwrite CLI)

If you have Appwrite CLI installed, run these commands:

```bash
# Create the bucket
appwrite storage create-bucket \
  --bucket-id "files" \
  --name "Files" \
  --file-security true \
  --allowed-file-extensions "jpg,jpeg,png,gif,webp,pdf,doc,docx,txt" \
  --maximum-file-size 10485760 \
  --encryption false \
  --antivirus false

# Set permissions
appwrite storage update-bucket \
  --bucket-id "files" \
  --permissions "read(\"any\")" \
  --permissions "write(\"any\")"
```

## Troubleshooting

### If you still get authorization errors:

1. **Check bucket exists**: Go to Storage → Look for "files" bucket
2. **Check bucket ID**: Must be exactly "files" (case-sensitive)
3. **Check permissions**: Must have `read("any")` and `write("any")`
4. **Check file extensions**: Must include the file types you're uploading
5. **Check file size**: Your files must be under 10MB

### Common Issues:

**"Bucket not found"**
- Bucket doesn't exist → Create it with ID "files"

**"Not authorized"**
- Wrong permissions → Set `read("any")` and `write("any")`

**"File type not allowed"**
- Wrong extensions → Add your file type to allowed extensions

**"File too large"**
- File > 10MB → Reduce file size or increase bucket limit

## Test After Setup

1. Try the enhanced signup form
2. Select "United States" as country
3. Choose an ID type (e.g., Driver's License)
4. Try uploading a small image file
5. Check browser console for any errors

## If Still Having Issues

The bucket setup is the most critical part. Without it, file uploads will not work. Make sure you:

1. ✅ Created bucket with ID "files"
2. ✅ Set permissions to `read("any")` and `write("any")`
3. ✅ Allowed the correct file extensions
4. ✅ Set appropriate file size limit

Once the bucket is properly set up, the enhanced signup form will work perfectly!
