import React, { useState, useRef, useEffect } from 'react';
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

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
`;

const SpeedLabel = styled.span`
  color: #006064;
  font-size: 0.9rem;
  white-space: nowrap;
`;

const SpeedSlider = styled.input`
  width: 100px;
  -webkit-appearance: none;
  height: 4px;
  background: #b2ebf2;
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #00acc1;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.2);
      background: #0097a7;
    }
  }
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

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: ${props => props.$isPreview ? '60%' : '40%'};
  min-height: ${props => props.$isPreview ? '300px' : '200px'};
  overflow: hidden;
`;

const SectionLabel = styled.label`
  color: #006064;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  padding: 0 0.25rem;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  background: white;
  color: #006064;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }

  &::placeholder {
    color: #80deea;
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  display: block;
`;

function ShapeEditor({ language, setLanguage }) {
  const [jsonConfig, setJsonConfig] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1000); // 默认1秒
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const t = lang[language];

  const validateJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.array || !parsed.steps) {
        throw new Error('JSON must contain "array" and "steps" properties');
      }
      if (!Array.isArray(parsed.array.values) || !Array.isArray(parsed.steps)) {
        throw new Error('"array.values" and "steps" must be arrays');
      }
      // Validate steps format
      parsed.steps.forEach((step, index) => {
        if (typeof step.i !== 'number' || typeof step.j !== 'number') {
          throw new Error(`Step ${index} must contain "i" and "j" numbers`);
        }
      });
      return parsed;
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const drawArray = (ctx, data, i = -1, j = -1) => {
    const { values, position, cellSize } = data.array;
    const canvas = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw array elements
    for (let index = 0; index < values.length; index++) {
      const x = position[0] + index * cellSize;
      const y = position[1];
      
      // Determine cell color based on pointer positions
      let cellColor = '#e0f7fa'; // Default color
      if (index === i && index === j) {
        cellColor = '#ffb74d'; // Orange when both pointers are at the same position
      } else if (index === i) {
        cellColor = '#ef5350'; // Red for i pointer
      } else if (index === j) {
        cellColor = '#42a5f5'; // Blue for j pointer
      }
      
      // Draw cell
      ctx.fillStyle = cellColor;
      ctx.fillRect(x, y, cellSize - 5, 40);
      ctx.strokeStyle = '#006064';
      ctx.strokeRect(x, y, cellSize - 5, 40);

      // Draw value
      ctx.fillStyle = '#006064';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(values[index], x + (cellSize - 5) / 2, y + 25);

      // Draw pointer markers
      if (index === i) {
        ctx.beginPath();
        ctx.moveTo(x + (cellSize - 5) / 2, y - 20);
        ctx.lineTo(x + (cellSize - 5) / 2, y);
        ctx.strokeStyle = '#ef5350';
        ctx.stroke();
        
        ctx.fillStyle = '#ef5350';
        ctx.font = '16px sans-serif';
        ctx.fillText('i', x + (cellSize - 5) / 2 - 5, y - 25);
      }
      
      if (index === j) {
        ctx.beginPath();
        ctx.moveTo(x + (cellSize - 5) / 2, y - 40);
        ctx.lineTo(x + (cellSize - 5) / 2, y);
        ctx.strokeStyle = '#42a5f5';
        ctx.stroke();
        
        ctx.fillStyle = '#42a5f5';
        ctx.font = '16px sans-serif';
        ctx.fillText('j', x + (cellSize - 5) / 2 - 5, y - 45);
      }
    }
  };

  const animate = () => {
    const data = validateJson(jsonConfig);
    if (!data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const { steps } = data;
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      setCurrentStep(0);
      return;
    }

    const { i, j } = steps[currentStep];
    drawArray(ctx, data, i, j);
    setCurrentStep(prev => prev + 1);
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(animate, animationSpeed);
    } else {
      clearInterval(animationRef.current);
    }

    return () => clearInterval(animationRef.current);
  }, [isPlaying, currentStep, jsonConfig, animationSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        // Redraw current state
        const data = validateJson(jsonConfig);
        if (data && currentStep > 0) {
          const ctx = canvas.getContext('2d');
          const { i, j } = data.steps[currentStep - 1];
          drawArray(ctx, data, i, j);
        } else if (data) {
          const ctx = canvas.getContext('2d');
          drawArray(ctx, data);
        }
      }
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [jsonConfig, currentStep]);

  const handleJsonChange = (e) => {
    setJsonConfig(e.target.value);
    setError('');
    validateJson(e.target.value);
  };

  const handlePlay = () => {
    if (!validateJson(jsonConfig)) return;
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    setAnimationSpeed(speed);
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

        <EditorContainer>
          <EditorSection>
            <SectionLabel>{t.jsonConfig}</SectionLabel>
            <TextArea
              value={jsonConfig}
              onChange={handleJsonChange}
              placeholder={t.jsonConfigPlaceholder}
            />
            {error && (
              <div style={{ color: '#d32f2f', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                {error}
              </div>
            )}
          </EditorSection>

          <EditorSection $isPreview>
            <SectionLabel>{t.preview}</SectionLabel>
            <Canvas ref={canvasRef} />
          </EditorSection>
        </EditorContainer>

        <Controls>
          <ControlButton onClick={handlePlay} disabled={isPlaying || !!error}>
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
          <ControlButton onClick={handleReplay} disabled={!!error}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {t.replay}
          </ControlButton>
          <SpeedControl>
            <SpeedLabel>速度: {animationSpeed}ms</SpeedLabel>
            <SpeedSlider
              type="range"
              min="200"
              max="6000"
              step="100"
              value={animationSpeed}
              onChange={handleSpeedChange}
            />
          </SpeedControl>
        </Controls>
      </ContentCard>
    </ShapeEditorContainer>
  );
}

export default ShapeEditor; 