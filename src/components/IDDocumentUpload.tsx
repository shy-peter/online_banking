import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle, Download, CreditCard, FileText } from 'lucide-react';
import { uploadDocument, validateDocumentFile, getFileUrl } from '../lib/storage';
import LoadingSpinner from './LoadingSpinner';

interface IDDocumentUploadProps {
  idType: 'drivers-license' | 'passport' | 'state-id' | 'national-id';
  userId: string;
  onUpload: (fileId: string, fileName: string, documentSide: string) => void;
  onRemove: (documentSide: string) => void;
  currentFiles?: {
    front?: { id: string; name: string };
    back?: { id: string; name: string };
    dataPage?: { id: string; name: string };
  };
}

const IDDocumentUpload: React.FC<IDDocumentUploadProps> = ({
  idType,
  userId,
  onUpload,
  onRemove,
  currentFiles = {}
}) => {
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState<string | null>(null);
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    dataPage: useRef<HTMLInputElement>(null)
  };

  const getIDTypeInfo = () => {
    switch (idType) {
      case 'drivers-license':
        return {
          name: 'Driver\'s License',
          icon: '🚗',
          frontLabel: 'Front of Driver\'s License',
          backLabel: 'Back of Driver\'s License',
          frontDescription: 'Upload the front side of your driver\'s license',
          backDescription: 'Upload the back side of your driver\'s license',
          showBack: true,
          showDataPage: false
        };
      case 'passport':
        return {
          name: 'Passport',
          icon: '📘',
          frontLabel: 'Passport Photo Page',
          backLabel: 'Passport Data Page',
          frontDescription: 'Upload the photo page of your passport',
          backDescription: 'Upload the data page of your passport',
          showBack: true,
          showDataPage: true
        };
      case 'state-id':
        return {
          name: 'State ID',
          icon: '🆔',
          frontLabel: 'Front of State ID',
          backLabel: 'Back of State ID',
          frontDescription: 'Upload the front side of your state ID',
          backDescription: 'Upload the back side of your state ID',
          showBack: true,
          showDataPage: false
        };
      case 'national-id':
        return {
          name: 'National ID',
          icon: '🆔',
          frontLabel: 'Front of National ID',
          backLabel: 'Back of National ID',
          frontDescription: 'Upload the front side of your national ID',
          backDescription: 'Upload the back side of your national ID',
          showBack: true,
          showDataPage: false
        };
      default:
        return {
          name: 'ID Document',
          icon: '📄',
          frontLabel: 'Front of ID',
          backLabel: 'Back of ID',
          frontDescription: 'Upload the front side of your ID',
          backDescription: 'Upload the back side of your ID',
          showBack: true,
          showDataPage: false
        };
    }
  };

  const idInfo = getIDTypeInfo();

  const handleFileSelect = async (file: File, documentSide: string) => {
    setError('');
    
    // Validate file
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(documentSide);
    try {
      const result = await uploadDocument(file, userId, `${idType}-${documentSide}`);
      
      if (result.success && result.fileId) {
        onUpload(result.fileId, file.name, documentSide);
      } else {
        setError(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload file');
    } finally {
      setIsUploading(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, documentSide: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, documentSide);
    }
  };

  const handleDrop = (e: React.DragEvent, documentSide: string) => {
    e.preventDefault();
    setDragActive(null);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file, documentSide);
    }
  };

  const handleDragOver = (e: React.DragEvent, documentSide: string) => {
    e.preventDefault();
    setDragActive(documentSide);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(null);
  };

  const handleRemove = (documentSide: string) => {
    setError('');
    onRemove(documentSide);
  };

  const renderUploadArea = (documentSide: 'front' | 'back' | 'dataPage') => {
    const isUploadingThis = isUploading === documentSide;
    const currentFile = currentFiles[documentSide];
    const isDragActiveThis = dragActive === documentSide;
    
    const getLabel = () => {
      switch (documentSide) {
        case 'front': return idInfo.frontLabel;
        case 'back': return idInfo.backLabel;
        case 'dataPage': return 'Passport Data Page';
        default: return 'Document';
      }
    };

    const getDescription = () => {
      switch (documentSide) {
        case 'front': return idInfo.frontDescription;
        case 'back': return idInfo.backDescription;
        case 'dataPage': return 'Upload the data page of your passport';
        default: return 'Upload your document';
      }
    };

    return (
      <div className="space-y-2">
        <label className="form-label">
          {getLabel()} *
        </label>
        
        <p className="text-sm text-gray-600">{getDescription()}</p>

        {/* Current File Display */}
        {currentFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{idInfo.icon}</span>
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
                  onClick={() => handleRemove(documentSide)}
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
              isDragActiveThis
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            } ${isUploadingThis ? 'opacity-50 pointer-events-none' : ''}`}
            onDrop={(e) => handleDrop(e, documentSide)}
            onDragOver={(e) => handleDragOver(e, documentSide)}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRefs[documentSide]}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              onChange={(e) => handleFileInputChange(e, documentSide)}
              className="hidden"
            />

            {isUploadingThis ? (
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
                      onClick={() => fileInputRefs[documentSide].current?.click()}
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum file size: 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ID Type Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{idInfo.icon}</span>
          <div>
            <h4 className="text-lg font-semibold text-blue-800">{idInfo.name}</h4>
            <p className="text-sm text-blue-700">
              Please upload clear, high-quality images of your {idInfo.name.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Front Upload */}
      {renderUploadArea('front')}

      {/* Back Upload (if applicable) */}
      {idInfo.showBack && renderUploadArea('back')}

      {/* Data Page Upload (for passport only) */}
      {idInfo.showDataPage && renderUploadArea('dataPage')}

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

export default IDDocumentUpload;
