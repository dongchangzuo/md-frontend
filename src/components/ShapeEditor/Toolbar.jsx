import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenManager } from '../../services/api';

const Toolbar = ({
  fileInputRef,
  handleFileInput,
  t,
  gifDelay,
  setGifDelay,
  exportGif,
  setShowGuide,
  language,
  setLanguage,
  themeMode,
  setThemeMode,
  theme,
  isLocalMode,
  onModeChange
}) => {
  const navigate = useNavigate();
  const handleModeSwitch = useCallback((mode) => {
    if (mode === 'cloud') {
      const token = tokenManager.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      onModeChange('cloud');
    } else {
      onModeChange('local');
    }
  }, [navigate, onModeChange]);

  return (
    <div style={{
      width: '100%',
      background: theme.card,
      boxShadow: theme.shadow,
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      minHeight: 64,
      borderBottom: `1px solid ${theme.border}`
    }}>
      {/* 文件上传 */}
      <div>
        <input
          type="file"
          accept=".yaml,.yml"
          onChange={handleFileInput}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <label
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            display: 'inline-block',
            transition: 'background-color 0.2s',
            marginRight: 8
          }}
        >
          {t.upload}
        </label>
      </div>
      {/* 帮助文档 */}
      <div>
        <button
          onClick={() => setShowGuide(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            marginRight: 8
          }}
        >
          {t.guide}
        </button>
      </div>
      {/* 导出 */}
      <div>
        <label style={{ fontSize: 14, marginRight: 8 }}>{t.delay}</label>
        <input type="number" min={50} max={5000} step={50} value={gifDelay} onChange={e => setGifDelay(Number(e.target.value))} style={{ width: 80, fontSize: 14, padding: 2 }} />
        <button
          onClick={exportGif}
          style={{
            marginLeft: 8,
            padding: '8px 16px',
            backgroundColor: theme.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          {t.export}
        </button>
      </div>
      {/* 右侧切换 */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => handleModeSwitch('cloud')}
          style={{
            padding: '6px 16px',
            background: !isLocalMode ? '#1976d2' : '#e3f2fd',
            color: !isLocalMode ? '#fff' : '#1976d2',
            border: !isLocalMode ? '1.5px solid #1976d2' : '1.5px solid #90caf9',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            marginRight: 4,
            cursor: 'pointer',
            transition: 'all 0.18s'
          }}
        >
          云端模式
        </button>
        <button
          onClick={() => handleModeSwitch('local')}
          style={{
            padding: '6px 16px',
            background: isLocalMode ? '#ffd54f' : '#fffde7',
            color: isLocalMode ? '#b26a00' : '#b26a00',
            border: isLocalMode ? '1.5px solid #ffd54f' : '1.5px solid #ffe082',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            marginRight: 16,
            cursor: 'pointer',
            transition: 'all 0.18s'
          }}
        >
          本地模式
        </button>
        <select value={themeMode} onChange={e => setThemeMode(e.target.value)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: themeMode==='dark'? '#232733' : '#f5f5f5', color: theme.text, outline: 'none', marginLeft: 16 }}>
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="auto">🖥️ Auto</option>
        </select>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: themeMode==='dark'? '#232733' : '#f5f5f5', color: theme.text, outline: 'none', marginLeft: 8 }}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
};

export default Toolbar; 