import React, { useCallback, useState } from 'react';
import { FiUploadCloud, FiFileText, FiZap } from 'react-icons/fi';

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
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
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
            <div className="dropzone-icon-wrap">
              <FiFileText className="dropzone-icon" />
            </div>
            <h2 className="dropzone-title">{selectedFile.name}</h2>
            <p className="dropzone-text">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <div className="dropzone-icon-wrap">
              <FiUploadCloud className="dropzone-icon" />
            </div>
            <h2 className="dropzone-title">Drop your PDF here</h2>
            <p className="dropzone-text">or click to browse your files</p>
            <div className="dropzone-badge">
              <FiZap size={12} /> Instant processing
            </div>
          </>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
