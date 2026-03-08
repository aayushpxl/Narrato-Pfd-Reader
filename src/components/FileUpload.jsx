import React, { useCallback, useState } from 'react';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';

const FileUpload = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
      onFileSelect(files[0]);
    } else {
      alert("Please upload a valid PDF file.");
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setSelectedFile(files[0]);
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="animate-fade-in" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <label 
        className={`dropzone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileInput} 
          style={{ display: 'none' }} 
        />
        
        {selectedFile ? (
          <>
            <FiFileText className="dropzone-icon" />
            <h2 className="dropzone-title">{selectedFile.name}</h2>
            <p className="dropzone-text">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <FiUploadCloud className="dropzone-icon" />
            <h2 className="dropzone-title">Upload your PDF Book</h2>
            <p className="dropzone-text">Drag & drop a file here, or click to select one</p>
          </>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
