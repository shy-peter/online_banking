import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, AlertCircle, Check, CreditCard, FileText } from 'lucide-react';

interface IDDocumentUploadFallbackProps {
  idType: 'drivers-license' | 'passport' | 'state-id' | 'national-id';
  onUpload: (fileId: string, fileName: string, documentSide: string) => void;
  onRemove: (documentSide: string) => void;
  currentFiles?: {
    front?: { id: string; name: string };
    back?: { id: string; name: string };
    dataPage?: { id: string; name: string };
  };
}

const IDDocumentUploadFallback: React.FC<IDDocumentUploadFallbackProps> = ({
  idType,
  onUpload,
  onRemove,
  currentFiles = {}
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: {id: string, name: string}}>({});

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, documentSide: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary file ID and simulate upload
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileName = file.name;
      
      setUploadedFiles(prev => ({
        ...prev,
        [documentSide]: { id: tempId, name: fileName }
      }));
      
      onUpload(tempId, fileName, documentSide);
    }
  };

  const handleRemove = (documentSide: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[documentSide];
      return newFiles;
    });
    onRemove(documentSide);
  };

  const renderUploadArea = (documentSide: 'front' | 'back' | 'dataPage') => {
    const currentFile = currentFiles[documentSide] || uploadedFiles[documentSide];
    
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
                  <p className="text-xs text-green-600">File selected (will be uploaded after account creation)</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(documentSide)}
                className="text-red-600 hover:text-red-700 p-1"
                title="Remove file"
              >
                <File className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        {!currentFile && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-gray-50 transition-colors duration-200">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              onChange={(e) => handleFileSelect(e, documentSide)}
              className="hidden"
              id={`file-input-${documentSide}`}
            />

            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  <label 
                    htmlFor={`file-input-${documentSide}`}
                    className="text-primary-600 hover:text-primary-700 underline cursor-pointer"
                  >
                    Click to select file
                  </label>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPG, PNG, PDF
                </p>
                <p className="text-xs text-gray-500">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>
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
              Please select your {idInfo.name.toLowerCase()} files. They will be uploaded after your account is created.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">File Upload Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              File uploads are temporarily disabled. Your selected files will be uploaded after your account is created and the storage system is configured.
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
    </div>
  );
};

export default IDDocumentUploadFallback;
