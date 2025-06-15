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
  align-items: center;
  width: 100vw;
  max-width: none;
  margin: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
`;

const Title = styled.h1`
  color: #006064;
  text-align: left;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0.25rem 0;
`;

const ToolBar = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const CanvasWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
`;

const COLORS = ['#222', '#e74c3c', '#3498db', '#27ae60', '#f1c40f', '#9b59b6', '#fff'];
const SIZES = [2, 4, 8, 12, 20];

const TOOL_PEN = 'pen';
const TOOL_ERASER = 'eraser';
const TOOL_LINE = 'line';

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
  const [tool, setTool] = useState(TOOL_PEN); // pen/eraser/line
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
    } else if (op.type === 'clear') {
      clearCanvas();
    } else if (op.type === 'undo') {
      handleUndo(true); // 远程撤销
    }
  }

  const getCtx = () => canvasRef.current.getContext('2d');

  const startDraw = (e) => {
    const pos = getCanvasPos(e.nativeEvent, canvasRef.current);
    if (tool === TOOL_PEN || tool === TOOL_ERASER) {
      setDrawing(true);
      const ctx = getCtx();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      // 记录上一个点
      setLineStart(pos);
    } else if (tool === TOOL_LINE) {
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
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === TOOL_ERASER ? '#fff' : color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      // 发送画笔/橡皮操作
      sendOp({
        type: tool,
        color,
        size,
        from: lineStart,
        to: pos
      });
      setLineStart(pos);
    } else if (tool === TOOL_LINE) {
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
      // 发送直线操作
      sendOp({
        type: 'line',
        color,
        size,
        from: lineStart,
        to: pos
      });
    }
  };

  // 直线预览
  useEffect(() => {
    if (tool === TOOL_LINE && drawing && lineStart && lineEnd) {
      const ctx = getCtx();
      // 先恢复上一步快照
      if (history.length > 0) {
        const img = new window.Image();
        img.src = history[history.length - 1];
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, 0, 0);
          // 画预览线
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lineStart.x, lineStart.y);
          ctx.lineTo(lineEnd.x, lineEnd.y);
          ctx.stroke();
          ctx.restore();
        };
      } else {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(lineEnd.x, lineEnd.y);
        ctx.stroke();
        ctx.restore();
      }
    }
    // eslint-disable-next-line
  }, [lineEnd]);

  const clearCanvas = () => {
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
            <Title>画板实时协作</Title>
          </Header>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <input
              placeholder="输入房间号或自定义"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              style={{ fontSize: 20, padding: 8, borderRadius: 8, border: '1px solid #b2ebf2', width: 240, marginBottom: 16 }}
            />
            <button
              onClick={() => setJoined(true)}
              style={{ fontSize: 18, padding: '8px 32px', borderRadius: 8, background: '#00acc1', color: '#fff', border: 'none', cursor: 'pointer' }}
              disabled={!roomId}
            >加入房间</button>
          </div>
        </ContentCard>
      </DrawBoardContainer>
    );
  }

  return (
    <DrawBoardContainer>
      <ContentCard>
        <Header>
          <Title>画板 DrawBoard（房间号：{roomId}）</Title>
        </Header>
        <ToolBar>
          <span>工具：</span>
          <button
            onClick={handlePen}
            style={{
              marginRight: 8,
              padding: '6px 16px',
              borderRadius: 6,
              background: tool === TOOL_PEN ? '#00acc1' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >画笔</button>
          <button
            onClick={handleEraser}
            style={{
              marginRight: 8,
              padding: '6px 16px',
              borderRadius: 6,
              background: tool === TOOL_ERASER ? '#ffb86c' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >橡皮</button>
          <button
            onClick={handleLine}
            style={{
              marginRight: 24,
              padding: '6px 16px',
              borderRadius: 6,
              background: tool === TOOL_LINE ? '#7fd6ff' : '#444',
              color: '#006064',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >直线</button>
          <span>颜色：</span>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => handleColor(c)}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: color === c && tool === TOOL_PEN ? '2px solid #fff' : '2px solid #888',
                background: c, cursor: 'pointer',
                opacity: tool === TOOL_ERASER ? 0.5 : 1
              }}
            />
          ))}
          <span style={{ marginLeft: 24 }}>粗细：</span>
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: size === s ? '2px solid #fff' : '2px solid #888',
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: s, height: s, borderRadius: '50%',
                background: '#222'
              }} />
            </button>
          ))}
          <button
            onClick={() => handleUndo(false)}
            style={{ marginLeft: 24, padding: '6px 16px', borderRadius: 6, background: '#3498db', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >撤销</button>
          <button
            onClick={handleClearAll}
            style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >全部删除</button>
        </ToolBar>
        <CanvasWrapper ref={wrapperRef}>
          <canvas
            ref={canvasRef}
            width={1}
            height={1}
            style={{
              width: '100%',
              height: '100%',
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px #0003',
              cursor: tool === TOOL_ERASER ? 'cell' : tool === TOOL_LINE ? 'crosshair' : 'crosshair',
              display: 'block'
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
          />
        </CanvasWrapper>
      </ContentCard>
    </DrawBoardContainer>
  );
} 