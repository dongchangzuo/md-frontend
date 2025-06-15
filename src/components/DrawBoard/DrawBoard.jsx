import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { io } from 'socket.io-client';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const DrawBoardContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 0.5rem;
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

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  margin-bottom: 1rem;
`;

const ToolButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active ? '#00acc1' : '#e0f7fa'};
  color: ${props => props.$active ? 'white' : '#006064'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: ${props => props.$active ? '#0097a7' : '#b2ebf2'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ColorButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => props.$active ? '#00acc1' : '#b2ebf2'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SizeButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => props.$active ? '#00acc1' : '#b2ebf2'};
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CanvasWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #b2ebf2;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  display: block;
`;

const RoomInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #b2ebf2;
  border-radius: 8px;
  background: white;
  color: #006064;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  width: 300px;

  &:focus {
    border-color: #00acc1;
    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.1);
  }

  &::placeholder {
    color: #80deea;
  }
`;

const JoinButton = styled.button`
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
  min-width: 100px;
  justify-content: center;

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
`;

const COLORS = ['#222', '#e74c3c', '#3498db', '#27ae60', '#f1c40f', '#9b59b6', '#fff'];
const SIZES = [2, 4, 8, 12, 20];

const TOOL_PEN = 'pen';
const TOOL_ERASER = 'eraser';
const TOOL_LINE = 'line';
const TOOL_TRIANGLE = 'triangle';

// Add grid and coordinate system constants
const GRID_SIZE = 40; // Increased grid size for better visibility
const AXIS_COLOR = '#006064'; // Match the theme color
const GRID_COLOR = '#e0f7fa'; // Lighter theme color for grid
const AXIS_LINE_WIDTH = 2;
const GRID_LINE_WIDTH = 0.5;
const LABEL_FONT = '14px Arial';
const ORIGIN_RADIUS = 4;

// Function to draw grid and coordinate axes
const drawGridAndAxes = (ctx, width, height) => {
  // Clear the canvas first
  ctx.clearRect(0, 0, width, height);

  // Draw grid
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = GRID_LINE_WIDTH;

  // Draw vertical grid lines
  for (let x = 0; x <= width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal grid lines
  for (let y = 0; y <= height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw coordinate axes
  ctx.strokeStyle = AXIS_COLOR;
  ctx.lineWidth = AXIS_LINE_WIDTH;

  // Draw X axis
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Draw Y axis
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  // Draw axis labels
  ctx.fillStyle = AXIS_COLOR;
  ctx.font = LABEL_FONT;
  ctx.textAlign = 'center';

  // X axis labels
  for (let x = -Math.floor(width / (2 * GRID_SIZE)); x <= Math.floor(width / (2 * GRID_SIZE)); x++) {
    if (x === 0) continue;
    const screenX = x * GRID_SIZE + width / 2;
    ctx.fillText(x.toString(), screenX, height / 2 + 20);
  }

  // Y axis labels
  for (let y = -Math.floor(height / (2 * GRID_SIZE)); y <= Math.floor(height / (2 * GRID_SIZE)); y++) {
    if (y === 0) continue;
    const screenY = height / 2 - y * GRID_SIZE;
    ctx.fillText(y.toString(), width / 2 - 20, screenY);
  }

  // Draw origin point
  ctx.fillStyle = AXIS_COLOR;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, ORIGIN_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Draw axis arrows
  const arrowSize = 10;
  
  // X axis arrow
  ctx.beginPath();
  ctx.moveTo(width - arrowSize, height / 2 - arrowSize);
  ctx.lineTo(width, height / 2);
  ctx.lineTo(width - arrowSize, height / 2 + arrowSize);
  ctx.stroke();

  // Y axis arrow
  ctx.beginPath();
  ctx.moveTo(width / 2 - arrowSize, arrowSize);
  ctx.lineTo(width / 2, 0);
  ctx.lineTo(width / 2 + arrowSize, arrowSize);
  ctx.stroke();

  // Add axis labels
  ctx.fillText('x', width - 15, height / 2 - 15);
  ctx.fillText('y', width / 2 + 15, 15);
};

// 获取 canvas 上的真实坐标（考虑缩放比）
function getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

export default function DrawBoard() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const socket = useRef(null);
  const [color, setColor] = useState('#222');
  const [size, setSize] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState(TOOL_PEN); // pen/eraser/line/triangle
  const [history, setHistory] = useState([]);
  const [lineStart, setLineStart] = useState(null);
  const [lineEnd, setLineEnd] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);

  // canvas 自适应
  useEffect(() => {
    const resizeCanvas = () => {
      if (wrapperRef.current && canvasRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        
        // Draw grid and axes after resizing
        const ctx = canvasRef.current.getContext('2d');
        drawGridAndAxes(ctx, rect.width, rect.height);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // socket.io 连接和事件
  useEffect(() => {
    if (!joined || !roomId) return;
    socket.current = io('http://localhost:3001'); // 生产环境请替换为你的服务器地址
    socket.current.emit('join', roomId);
    socket.current.on('draw-op', (op) => {
      handleRemoteOp(op);
    });
    return () => {
      socket.current && socket.current.disconnect();
    };
    // eslint-disable-next-line
  }, [joined, roomId]);

  function sendOp(op) {
    if (socket.current && joined && roomId) {
      socket.current.emit('draw-op', { roomId, op });
    }
  }

  // 处理远程操作
  function handleRemoteOp(op) {
    const ctx = getCtx();
    if (op.type === 'pen' || op.type === 'eraser') {
      ctx.save();
      ctx.strokeStyle = op.type === 'eraser' ? '#fff' : op.color;
      ctx.lineWidth = op.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(op.from.x, op.from.y);
      ctx.lineTo(op.to.x, op.to.y);
      ctx.stroke();
      ctx.restore();
    } else if (op.type === 'line') {
      ctx.save();
      ctx.strokeStyle = op.color;
      ctx.lineWidth = op.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(op.from.x, op.from.y);
      ctx.lineTo(op.to.x, op.to.y);
      ctx.stroke();
      ctx.restore();
    } else if (op.type === 'triangle') {
      ctx.save();
      ctx.strokeStyle = op.color;
      ctx.lineWidth = op.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(op.points[0].x, op.points[0].y);
      ctx.lineTo(op.points[1].x, op.points[1].y);
      ctx.lineTo(op.points[2].x, op.points[2].y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else if (op.type === 'clear') {
      clearCanvas();
    } else if (op.type === 'undo') {
      handleUndo(true);
    }
  }

  const getCtx = () => canvasRef.current.getContext('2d');

  const startDraw = (e) => {
    const pos = getCanvasPos(e.nativeEvent, canvasRef.current);
    if (tool === TOOL_PEN || tool === TOOL_ERASER) {
      console.log('startDraw', pos);
      setDrawing(true);
      const ctx = getCtx();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setLineStart(pos);
    } else if (tool === TOOL_LINE || tool === TOOL_TRIANGLE) {
      setLineStart(pos);
      setLineEnd(null);
      setDrawing(true);
    }
  };

  const draw = (e) => {
    if (!drawing) return;
    const pos = getCanvasPos(e.nativeEvent, canvasRef.current);
    if (tool === TOOL_PEN || tool === TOOL_ERASER) {
      const ctx = getCtx();
      // Save the current state
      ctx.save();
      // Draw the grid and axes first
      drawGridAndAxes(ctx, canvasRef.current.width, canvasRef.current.height);
      // Then draw the line
      ctx.beginPath();
      ctx.moveTo(lineStart.x, lineStart.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === TOOL_ERASER ? '#fff' : color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      // Restore the state
      ctx.restore();
      sendOp({
        type: tool,
        color,
        size,
        from: lineStart,
        to: pos
      });
      setLineStart(pos);
    } else if (tool === TOOL_LINE || tool === TOOL_TRIANGLE) {
      setLineEnd(pos);
    }
  };

  const endDraw = (e) => {
    if (!drawing) return;
    setDrawing(false);
    const ctx = getCtx();
    if (tool === TOOL_PEN || tool === TOOL_ERASER) {
      ctx.closePath();
      const url = canvasRef.current.toDataURL();
      setHistory((prev) => [...prev, url]);
    } else if (tool === TOOL_LINE && lineStart) {
      const pos = getCanvasPos(e.nativeEvent, canvasRef.current);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lineStart.x, lineStart.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
      setLineStart(null);
      setLineEnd(null);
      const url = canvasRef.current.toDataURL();
      setHistory((prev) => [...prev, url]);
      sendOp({
        type: 'line',
        color,
        size,
        from: lineStart,
        to: pos
      });
    } else if (tool === TOOL_TRIANGLE && lineStart) {
      const pos = getCanvasPos(e.nativeEvent, canvasRef.current);
      // 计算等腰三角形第三个点
      const x1 = lineStart.x, y1 = lineStart.y;
      const x2 = pos.x, y2 = pos.y;
      // 第三个点横坐标为两点中点，纵坐标为 y1 - (y2 - y1)
      const x3 = x1 - (x2 - x1);
      const y3 = y2;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      setLineStart(null);
      setLineEnd(null);
      const url = canvasRef.current.toDataURL();
      setHistory((prev) => [...prev, url]);
      sendOp({
        type: 'triangle',
        color,
        size,
        points: [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
          { x: x3, y: y3 }
        ]
      });
    }
  };

  // 直线/三角形预览
  useEffect(() => {
    if ((tool === TOOL_LINE || tool === TOOL_TRIANGLE) && drawing && lineStart && lineEnd) {
      const ctx = getCtx();
      // Save the current state
      ctx.save();
      // Clear and redraw grid and axes
      drawGridAndAxes(ctx, canvasRef.current.width, canvasRef.current.height);
      // Draw the preview
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (tool === TOOL_LINE) {
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(lineEnd.x, lineEnd.y);
      } else if (tool === TOOL_TRIANGLE) {
        const x1 = lineStart.x, y1 = lineStart.y;
        const x2 = lineEnd.x, y2 = lineEnd.y;
        const x3 = x1 - (x2 - x1);
        const y3 = y2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
      }
      ctx.stroke();
      // Restore the state
      ctx.restore();
    }
    // eslint-disable-next-line
  }, [lineEnd]);

  const clearCanvas = () => {
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawGridAndAxes(ctx, canvasRef.current.width, canvasRef.current.height);
  };

  const handleUndo = (isRemote) => {
    if (history.length === 0) return;
    const prev = [...history];
    prev.pop();
    setHistory(prev);
    const ctx = getCtx();
    clearCanvas();
    if (prev.length > 0) {
      const img = new window.Image();
      img.src = prev[prev.length - 1];
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
    if (!isRemote) {
      sendOp({ type: 'undo' });
    }
  };

  const handleClearAll = () => {
    clearCanvas();
    setHistory([]);
    sendOp({ type: 'clear' });
  };

  // 工具切换
  const handlePen = () => setTool(TOOL_PEN);
  const handleEraser = () => setTool(TOOL_ERASER);
  const handleLine = () => setTool(TOOL_LINE);
  const handleTriangle = () => setTool(TOOL_TRIANGLE);

  // 切换颜色时自动切回画笔
  const handleColor = (c) => {
    setColor(c);
    setTool(TOOL_PEN);
  };

  // 房间号输入页
  if (!joined) {
    return (
      <DrawBoardContainer>
        <ContentCard>
          <Header>
            <Title>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              画板实时协作
            </Title>
          </Header>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <RoomInput
              placeholder="输入房间号或自定义"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
            />
            <JoinButton
              onClick={() => setJoined(true)}
              disabled={!roomId}
            >
              加入房间
            </JoinButton>
          </div>
        </ContentCard>
      </DrawBoardContainer>
    );
  }

  return (
    <DrawBoardContainer>
      <ContentCard>
        <Header>
          <Title>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            画板 DrawBoard（房间号：{roomId}）
          </Title>
        </Header>
        <ToolBar>
          <span style={{ color: '#006064', fontWeight: 500 }}>工具：</span>
          <ToolButton
            onClick={handlePen}
            $active={tool === TOOL_PEN}
          >
            画笔
          </ToolButton>
          <ToolButton
            onClick={handleEraser}
            $active={tool === TOOL_ERASER}
          >
            橡皮
          </ToolButton>
          <ToolButton
            onClick={handleLine}
            $active={tool === TOOL_LINE}
          >
            直线
          </ToolButton>
          <ToolButton
            onClick={handleTriangle}
            $active={tool === TOOL_TRIANGLE}
          >
            三角形
          </ToolButton>
          <span style={{ color: '#006064', fontWeight: 500, marginLeft: '1rem' }}>颜色：</span>
          {COLORS.map(c => (
            <ColorButton
              key={c}
              color={c}
              $active={color === c && tool === TOOL_PEN}
              onClick={() => handleColor(c)}
              style={{ opacity: tool === TOOL_ERASER ? 0.5 : 1 }}
            />
          ))}
          <span style={{ color: '#006064', fontWeight: 500, marginLeft: '1rem' }}>粗细：</span>
          {SIZES.map(s => (
            <SizeButton
              key={s}
              $active={size === s}
              onClick={() => setSize(s)}
            >
              <div style={{
                width: s,
                height: s,
                borderRadius: '50%',
                background: '#006064'
              }} />
            </SizeButton>
          ))}
          <ToolButton
            onClick={() => handleUndo(false)}
            style={{ marginLeft: '1rem' }}
          >
            撤销
          </ToolButton>
          <ToolButton
            onClick={handleClearAll}
            style={{ background: '#ffebee', color: '#d32f2f' }}
          >
            全部删除
          </ToolButton>
        </ToolBar>
        <CanvasWrapper ref={wrapperRef}>
          <Canvas
            ref={canvasRef}
            width={1}
            height={1}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            style={{
              cursor: tool === TOOL_ERASER ? 'cell' : 'crosshair'
            }}
          />
        </CanvasWrapper>
      </ContentCard>
    </DrawBoardContainer>
  );
} 