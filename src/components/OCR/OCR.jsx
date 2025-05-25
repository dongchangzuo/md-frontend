import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { lang } from '../../i18n/lang';
import { useTheme } from '../../theme/ThemeContext';
import './OCR.css';

const OCR = ({ language, setLanguage }) => {
  const { theme, themeMode, toggleTheme } = useTheme();
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
      // 这里应该调用实际的 OCR API
      // 目前使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRecognizedText('这是识别出的文本示例。\n这是第二行。');
    } catch (err) {
      setError(t.recognitionFailed);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(recognizedText);
  };

  return (
    <div className="ocr-container">
      <div className="ocr-header">
        <h1>{t.ocrTitle}</h1>
        <div className="controls">
          <button onClick={toggleTheme}>
            {themeMode === 'dark' ? t.lightMode : t.darkMode}
          </button>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="ocr-content">
        <div className="image-section">
          {selectedImage ? (
            <div className="selected-image">
              <img src={selectedImage} alt="Selected" />
              <button onClick={() => fileInputRef.current.click()}>
                {t.changeImage}
              </button>
            </div>
          ) : (
            <div className="upload-area" onClick={() => fileInputRef.current.click()}>
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
            className="recognize-button"
            onClick={handleRecognize}
            disabled={!selectedImage || isRecognizing}
          >
            {isRecognizing ? t.recognizing : t.recognizeText}
          </button>

          {error && <div className="error">{error}</div>}

          {recognizedText && (
            <div className="recognized-text">
              <h3>{t.recognizedText}</h3>
              <div className="text-content">
                {recognizedText}
              </div>
              <button onClick={handleCopyText}>{t.copyText}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCR; 