import { storage } from './appwrite';
import { ID } from 'appwrite';

// Bucket ID for file storage
export const BUCKET_ID = 'files';

// File upload utility
export const uploadFile = async (
  file: File,
  folder: string = 'general',
  userId?: string
): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> => {
  try {
    // Create unique file ID
    const fileId = ID.unique();
    
    // For signup process, use "any" permissions since user isn't authenticated yet
    const permissions = [
      'read("any")',
      'write("any")'
    ];
    
    // Upload file to bucket
    const response = await storage.createFile(
      BUCKET_ID,
      fileId,
      file,
      permissions,
      [
        `folder:${folder}`
      ]
    );

    // Get file URL
    const url = getFileUrl(response.$id);

    return {
      success: true,
      fileId: response.$id,
      url: url
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file'
    };
  }
};

// Get file URL
export const getFileUrl = (fileId: string): string => {
  return storage.getFileView(BUCKET_ID, fileId).toString();
};

// Get file download URL
export const getFileDownloadUrl = (fileId: string): string => {
  return storage.getFileDownload(BUCKET_ID, fileId).toString();
};

// Delete file
export const deleteFile = async (fileId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file'
    };
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file: File, userId: string): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'Please select an image file'
    };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: 'File size must be less than 5MB'
    };
  }

  // Upload to profile-pictures folder with user permissions
  return await uploadFile(file, `profile-pictures/${userId}`, userId);
};

// Upload document
export const uploadDocument = async (file: File, userId: string, documentType: string): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> => {
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'File type not allowed. Please upload PDF, DOC, DOCX, TXT, or image files.'
    };
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: 'File size must be less than 10MB'
    };
  }

  // Upload to documents folder with user permissions
  return await uploadFile(file, `documents/${userId}/${documentType}`, userId);
};

// File validation utilities
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please select an image file'
    };
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { valid: true };
};

export const validateDocumentFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload PDF, DOC, DOCX, TXT, or image files.'
    };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'File size must be less than 10MB'
    };
  }

  return { valid: true };
};