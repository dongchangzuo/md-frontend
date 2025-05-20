import { useState } from 'react';
import { tokenManager } from '../../services/api';
import './OCR.css';

function OCR() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // 创建预览URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setRecognizedText('');
      setError(null);
    }
  };

  const handleRecognize = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = tokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:8080/api/ocr/recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to recognize text');
      }

      const data = await response.json();
      setRecognizedText(data.text || 'No text recognized');
    } catch (error) {
      console.error('Error recognizing text:', error);
      setError(error.message);
      if (error.message === 'No authentication token found') {
        alert('Please login first');
      } else if (error.message === 'Authentication failed') {
        alert('Authentication failed. Please login again');
      } else {
        alert('Failed to recognize text');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ocr-container">
      <div className="ocr-header">
        <h2>OCR Text Recognition</h2>
      </div>
      
      <div className="ocr-content">
        <div className="upload-section">
          <div className="file-input-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="file-input-label">
              {selectedFile ? 'Change Image' : 'Select Image'}
            </label>
          </div>
          
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
          
          <button
            className="recognize-button"
            onClick={handleRecognize}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Recognizing...' : 'Recognize Text'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {recognizedText && (
          <div className="result-section">
            <h3>Recognized Text:</h3>
            <div className="recognized-text">
              {recognizedText}
            </div>
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(recognizedText);
                alert('Text copied to clipboard!');
              }}
            >
              Copy Text
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OCR; 