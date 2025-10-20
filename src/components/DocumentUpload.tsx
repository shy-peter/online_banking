import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle, Download } from 'lucide-react';
import { uploadDocument, validateDocumentFile, getFileUrl } from '../lib/storage';
import LoadingSpinner from './LoadingSpinner';

interface DocumentUploadProps {
  label: string;
  documentType: string;
  userId: string;
  onUpload: (fileId: string, fileName: string) => void;
  onRemove: () => void;
  required?: boolean;
  description?: string;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  currentFile?: {
    id: string;
    name: string;
  };
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  documentType,
  userId,
  onUpload,
  onRemove,
  required = false,
  description,
  acceptedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  maxSize = 10,
  currentFile
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError('');
    
    // Validate file
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDocument(file, userId, documentType);
      
      if (result.success && result.fileId) {
        onUpload(result.fileId, file.name);
      } else {
        setError(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemove = () => {
    setError('');
    onRemove();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className="space-y-2">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {/* Current File Display */}
      {currentFile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getFileIcon(currentFile.name)}</span>
              <div>
                <p className="text-sm font-medium text-green-800">{currentFile.name}</p>
                <p className="text-xs text-green-600">Successfully uploaded</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(getFileUrl(currentFile.id), '_blank')}
                className="text-green-600 hover:text-green-700 p-1"
                title="View file"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 p-1"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Area */}
      {!currentFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.map(type => `.${type}`).join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600">Uploading file...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drop your file here or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: {acceptedTypes.join(', ').toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  Maximum file size: {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentUpload;


