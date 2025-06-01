import React, { useState, useRef } from 'react';
import { lang } from '../../i18n/lang';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ShapeEditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #b2ebf2;
`;

const Title = styled.h1`
  color: #006064;
  text-align: left;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 28px;
    height: 28px;
    color: #00acc1;
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  margin-bottom: 1rem;
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ToolButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active ? '#00acc1' : 'white'};
  color: ${props => props.$active ? 'white' : '#006064'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid #b2ebf2;

  &:hover {
    background: ${props => props.$active ? '#0097a7' : '#e0f7fa'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CanvasContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  position: relative;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  overflow: auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #b2ebf2;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #00acc1;
  }
`;

const FrameControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
`;

const FrameLabel = styled.label`
  color: #006064;
  font-size: 1rem;
  font-weight: 500;
`;

const FrameInput = styled.input`
  padding: 0.5rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  width: 100px;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  margin-top: 1rem;
`;

const ControlButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #00acc1;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #0097a7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FrameCounter = styled.span`
  font-size: 1rem;
  color: #006064;
  margin-left: 1rem;
`;

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
    <ShapeEditorContainer>
      <ContentCard>
        <Header>
          <Title>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            {t.shapeEditor}
          </Title>
        </Header>

        <Toolbar>
          <ToolGroup>
            <ToolButton onClick={() => handleAddShape({ type: 'rectangle' })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              {t.addRectangle}
            </ToolButton>
            <ToolButton onClick={() => handleAddShape({ type: 'circle' })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
              {t.addCircle}
            </ToolButton>
            <ToolButton onClick={() => handleAddShape({ type: 'triangle' })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 19 21 5 21" />
              </svg>
              {t.addTriangle}
            </ToolButton>
          </ToolGroup>
        </Toolbar>

        <CanvasContainer ref={canvasRef}>
          {shapes.map((shape, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: shape.x || 0,
                top: shape.y || 0,
                width: shape.width || 100,
                height: shape.height || 100,
                backgroundColor: shape.color || '#00acc1',
                borderRadius: shape.type === 'circle' ? '50%' : '0',
                transform: `rotate(${shape.rotation || 0}deg)`,
                cursor: 'move',
                border: selectedShape === shape ? '2px solid #006064' : 'none',
              }}
              onClick={() => handleShapeSelect(shape)}
            />
          ))}
        </CanvasContainer>

        <FrameControl>
          <FrameLabel>{t.frameDelay}</FrameLabel>
          <FrameInput
            type="number"
            value={frameDelay}
            onChange={(e) => setFrameDelay(Number(e.target.value))}
            min="100"
            max="5000"
            step="100"
          />
          <FrameCounter>
            {t.frame}: {currentFrame}
          </FrameCounter>
        </FrameControl>

        <Controls>
          <ControlButton onClick={handlePlay} disabled={isPlaying}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {t.play}
          </ControlButton>
          <ControlButton onClick={handlePause} disabled={!isPlaying}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            {t.pause}
          </ControlButton>
          <ControlButton onClick={handleReplay}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t.replay}
          </ControlButton>
          <ControlButton onClick={handleExportGif}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t.exportGif}
          </ControlButton>
        </Controls>
      </ContentCard>
    </ShapeEditorContainer>
  );
}

export default ShapeEditor; 