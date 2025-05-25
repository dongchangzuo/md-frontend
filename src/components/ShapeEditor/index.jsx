import React, { useState, useRef } from 'react';
import { lang } from '../../i18n/lang';
import './ShapeEditor.css';

function ShapeEditor({ language, setLanguage }) {
  const [selectedShape, setSelectedShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameDelay, setFrameDelay] = useState(1000);
  const canvasRef = useRef(null);
  const t = lang[language];

  const handleShapeSelect = (shape) => {
    setSelectedShape(shape);
  };

  const handleAddShape = (shape) => {
    setShapes([...shapes, shape]);
  };

  const handleRemoveShape = (index) => {
    const newShapes = [...shapes];
    newShapes.splice(index, 1);
    setShapes(newShapes);
  };

  const handleFrameChange = (frame) => {
    setCurrentFrame(frame);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReplay = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  const handleExportGif = () => {
    // TODO: Implement GIF export
  };

  return (
    <div className="shape-editor">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f5f5', color: '#222', outline: 'none' }}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
      <div className="editor-container">
        <div className="toolbar">
          <div className="tool-group">
            <h3>{t.components}</h3>
            <button onClick={() => handleShapeSelect('array')}>{t.array}</button>
            <button onClick={() => handleShapeSelect('stack')}>{t.stack}</button>
            <button onClick={() => handleShapeSelect('map')}>{t.map}</button>
            <button onClick={() => handleShapeSelect('tree')}>{t.tree}</button>
          </div>
          <div className="tool-group">
            <button onClick={handleExportGif}>{t.exportGif}</button>
            <div className="frame-control">
              <label>{t.frameDelay}</label>
              <input
                type="number"
                value={frameDelay}
                onChange={(e) => setFrameDelay(Number(e.target.value))}
                min="100"
                max="5000"
                step="100"
              />
            </div>
          </div>
        </div>
        <div className="canvas-container">
          <canvas ref={canvasRef} />
        </div>
        <div className="controls">
          <button onClick={handlePlay} disabled={isPlaying}>{t.play}</button>
          <button onClick={handlePause} disabled={!isPlaying}>{t.pause}</button>
          <button onClick={handleReplay}>{t.replay}</button>
          <button onClick={() => handleFrameChange(currentFrame - 1)} disabled={currentFrame === 0}>
            {t.prevFrame}
          </button>
          <button onClick={() => handleFrameChange(currentFrame + 1)} disabled={currentFrame === shapes.length - 1}>
            {t.nextFrame}
          </button>
          <span>{t.frame} {currentFrame + 1}</span>
        </div>
      </div>
    </div>
  );
}

export default ShapeEditor; 