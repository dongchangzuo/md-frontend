import React, { useState, useRef } from 'react';
import { lang } from '../../i18n/lang';
import './OCR.css';
import styled from 'styled-components';

const OcrWrapper = styled.div`
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
`;

function OCR({ language, setLanguage }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const t = lang[language];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t.imageTooLarge);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecognize = async () => {
    if (!selectedImage) {
      setError(t.selectImage);
      return;
    }

    setIsRecognizing(true);
    setError('');

    try {
      // TODO: Implement OCR recognition
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRecognizedText('Sample recognized text');
    } catch (err) {
      setError(t.recognitionFailed);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleCopyText = () => {
    if (recognizedText) {
      navigator.clipboard.writeText(recognizedText);
      alert(t.textCopied);
    }
  };

  return (
    <OcrWrapper>
      <div className="ocr-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f5f5', color: '#222', outline: 'none' }}>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="ocr-header">
          <h2>{t.ocrTitle}</h2>
        </div>
        
        <div className="ocr-content">
          <div className="image-section">
            {selectedImage ? (
              <div className="image-preview">
                <img src={selectedImage} alt="Selected" />
                <button onClick={() => fileInputRef.current?.click()} className="change-image">
                  {t.changeImage}
                </button>
              </div>
            ) : (
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <p>{t.selectImage}</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div className="text-section">
            <button
              onClick={handleRecognize}
              disabled={!selectedImage || isRecognizing}
              className="recognize-button"
            >
              {isRecognizing ? t.recognizing : t.recognizeText}
            </button>
            {error && <div className="error-message">{error}</div>}
            {recognizedText && (
              <div className="recognized-text">
                <h3>{t.recognizedText}</h3>
                <p>{recognizedText}</p>
                <button onClick={handleCopyText} className="copy-button">
                  {t.copyText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </OcrWrapper>
  );
}

export default OCR; 