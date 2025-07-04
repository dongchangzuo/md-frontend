import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// 电流效果动画
const electricArc = keyframes`
  0% { 
    stroke-dasharray: 0, 1000;
    stroke-dashoffset: 0;
    opacity: 0;
  }
  10% { 
    stroke-dasharray: 50, 1000;
    stroke-dashoffset: 0;
    opacity: 1;
  }
  50% { 
    stroke-dasharray: 200, 1000;
    stroke-dashoffset: -100;
    opacity: 0.8;
  }
  90% { 
    stroke-dasharray: 50, 1000;
    stroke-dashoffset: -200;
    opacity: 1;
  }
  100% { 
    stroke-dasharray: 0, 1000;
    stroke-dashoffset: -300;
    opacity: 0;
  }
`;

const electricPulse = keyframes`
  0% { 
    transform: scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: scale(1.2);
    opacity: 1;
  }
  100% { 
    transform: scale(1);
    opacity: 0.8;
  }
`;

const electricGlow = keyframes`
  0% { 
    box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff;
  }
  50% { 
    box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;
  }
  100% { 
    box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff;
  }
`;

// Move grid constants to the top
const GRID_SIZE = 40;
const GRID_COLOR = '#e0f7fa';

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
  flex-wrap: wrap;
  min-height: 64px;
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
  width: 100px;
  justify-content: center;
  white-space: nowrap;
  flex-shrink: 0;

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

const ColorPickerIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$active ? '#00acc1' : '#b2ebf2'};
  box-shadow: ${props => props.$active 
    ? '0 0 0 3px #00acc1, 0 0 0 6px rgba(0, 172, 193, 0.2)' 
    : 'none'};
  transform: ${props => props.$active ? 'scale(1.1)' : 'scale(1)'};

  &:hover {
    transform: translateY(-2px) ${props => props.$active ? 'scale(1.1)' : 'scale(1)'};
    box-shadow: ${props => props.$active 
      ? '0 0 0 3px #00acc1, 0 0 0 6px rgba(0, 172, 193, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => props.color};
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: linear-gradient(45deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%);
  }

  ${props => props.$active && `
    &::before {
      content: '✓';
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: bold;
      background: rgba(0, 172, 193, 0.8);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  `}
`;

const SizePickerIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$active ? '#00acc1' : '#b2ebf2'};
  box-shadow: ${props => props.$active 
    ? '0 0 0 3px #00acc1, 0 0 0 6px rgba(0, 172, 193, 0.2)' 
    : 'none'};
  transform: ${props => props.$active ? 'scale(1.1)' : 'scale(1)'};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px) ${props => props.$active ? 'scale(1.1)' : 'scale(1)'};
    box-shadow: ${props => props.$active 
      ? '0 0 0 3px #00acc1, 0 0 0 6px rgba(0, 172, 193, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }

  &::before {
    content: '';
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    border-radius: 50%;
    background: #006064;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
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
const TOOL_AUXLINE = 'auxline';

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
  const [tool, setTool] = useState(TOOL_PEN);
  const [color, setColor] = useState('#006064');
  const [size, setSize] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [lineStart, setLineStart] = useState(null);
  const [lineEnd, setLineEnd] = useState(null);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [historyImage, setHistoryImage] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [drawingShape, setDrawingShape] = useState(null);
  const [auxLinePoints, setAuxLinePoints] = useState([]);
  const [hoveredSnapPoint, setHoveredSnapPoint] = useState(null);
  const [electricConnections, setElectricConnections] = useState([]); // 电流连接状态
  const [electricTimer, setElectricTimer] = useState(null); // 电流效果定时器

  // Remove all socket.io related useEffect hooks
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawAllShapes();
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // 清理电流效果定时器
      if (electricTimer) {
        clearInterval(electricTimer);
      }
    };
  }, []);

  const drawGridAndAxes = () => {
    const ctx = canvasRef.current.getContext('2d');
    const rect = wrapperRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw grid
    for (let x = 0; x < canvasRef.current.width; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasRef.current.height);
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    for (let y = 0; y < canvasRef.current.height; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasRef.current.width, y);
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(0, canvasRef.current.height / 2);
    ctx.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvasRef.current.width / 2, 0);
    ctx.lineTo(canvasRef.current.width / 2, canvasRef.current.height);
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  };

  // 检查鼠标是否在所有图形端点附近，命中则返回精确点坐标和索引（pointIndex: 0|1）
  const getHitPoint = (x, y) => {
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape.type === 'line') {
        const hitRadius = Math.max(10, shape.size * 2); // 检测半径至少10像素，最大为线条粗细的2倍
        for (let j = 0; j < 2; j++) {
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < hitRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'line' };
          }
        }
      } else if (shape.type === 'triangle') {
        const hitRadius = Math.max(10, shape.size * 2); // 检测半径至少10像素，最大为线条粗细的2倍
        for (let j = 0; j < 3; j++) {
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < hitRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'triangle' };
          }
        }
      } else if (shape.type === 'angle') {
        const hitRadius = Math.max(10, shape.size * 2); // 检测半径至少10像素，最大为线条粗细的2倍
        for (let j = 0; j < 3; j++) {
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < hitRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'angle' };
          }
        }
      } else if (shape.type === 'auxline') {
        const hitRadius = Math.max(10, shape.size * 2); // 检测半径至少10像素，最大为线条粗细的2倍
        for (let j = 0; j < 2; j++) {
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < hitRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'auxline' };
          }
        }
      }
    }
    return null;
  };

  // 专门的吸附检测函数，用于拖动时的端点吸附
  const getSnapPoint = (x, y, excludeShapeIndex, excludePointIndex) => {
    const snapRadius = 15; // 统一的吸附检测半径
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape.type === 'line') {
        for (let j = 0; j < 2; j++) {
          if (i === excludeShapeIndex && j === excludePointIndex) continue;
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < snapRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'line', point: shape.points[j] };
          }
        }
      } else if (shape.type === 'triangle') {
        for (let j = 0; j < 3; j++) {
          if (i === excludeShapeIndex && j === excludePointIndex) continue;
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < snapRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'triangle', point: shape.points[j] };
          }
        }
      } else if (shape.type === 'angle') {
        for (let j = 0; j < 3; j++) {
          if (i === excludeShapeIndex && j === excludePointIndex) continue;
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < snapRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'angle', point: shape.points[j] };
          }
        }
      } else if (shape.type === 'auxline') {
        for (let j = 0; j < 2; j++) {
          if (i === excludeShapeIndex && j === excludePointIndex) continue;
          if (Math.hypot(x - shape.points[j].x, y - shape.points[j].y) < snapRadius) {
            return { shapeIndex: i, pointIndex: j, type: 'auxline', point: shape.points[j] };
          }
        }
      }
    }
    return null;
  };

  // 检测所有端点之间的电流连接
  const detectElectricConnections = () => {
    const connections = [];
    const connectionRadius = 50; // 增加电流连接检测半径，让效果更容易触发
    
    // 遍历所有形状的端点
    for (let i = 0; i < shapes.length; i++) {
      const shape1 = shapes[i];
      const points1 = shape1.type === 'triangle' ? 3 : 2;
      
      for (let j = 0; j < points1; j++) {
        const point1 = shape1.points[j];
        
        // 与其他形状的端点比较
        for (let k = i; k < shapes.length; k++) {
          const shape2 = shapes[k];
          const points2 = shape2.type === 'triangle' ? 3 : 2;
          const startJ = k === i ? j + 1 : 0; // 避免重复检测
          
          for (let l = startJ; l < points2; l++) {
            const point2 = shape2.points[l];
            const distance = Math.hypot(point1.x - point2.x, point1.y - point2.y);
            
            if (distance <= connectionRadius) {
              connections.push({
                from: { shapeIndex: i, pointIndex: j, point: point1 },
                to: { shapeIndex: k, pointIndex: l, point: point2 },
                distance: distance,
                strength: Math.max(0.3, 1 - (distance / connectionRadius)) // 最小强度0.3，确保可见性
              });
            }
          }
        }
      }
    }
    
    return connections;
  };

  // 绘制电流连接效果
  const drawElectricConnection = (ctx, connection) => {
    const { from, to, strength } = connection;
    
    // 创建锯齿状的电流路径
    const dx = to.point.x - from.point.x;
    const dy = to.point.y - from.point.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance < 5) return;
    
    const segments = Math.max(3, Math.floor(distance / 15));
    const path = [];
    
    // 起点
    path.push({ x: from.point.x, y: from.point.y });
    
    // 生成锯齿状路径
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const baseX = from.point.x + dx * t;
      const baseY = from.point.y + dy * t;
      
      // 添加随机偏移，模拟电流的锯齿状
      const offset = (Math.random() - 0.5) * 12 * strength;
      const perpX = -dy / distance * offset;
      const perpY = dx / distance * offset;
      
      path.push({
        x: baseX + perpX,
        y: baseY + perpY
      });
    }
    
    // 终点
    path.push({ x: to.point.x, y: to.point.y });
    
    // 绘制电流路径 - 增强版本
    ctx.save();
    
    // 外层发光效果
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 6 * strength;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20 * strength;
    ctx.globalAlpha = 0.3 * strength;
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    
    // 中层电流
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4 * strength;
    ctx.shadowBlur = 15 * strength;
    ctx.globalAlpha = 0.8 * strength;
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    
    // 内层亮电流
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * strength;
    ctx.shadowBlur = 10 * strength;
    ctx.globalAlpha = 1 * strength;
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    
    // 电流分支效果 - 增强版本
    ctx.globalAlpha = 0.6 * strength;
    ctx.lineWidth = 2 * strength;
    ctx.strokeStyle = '#00ffff';
    ctx.shadowBlur = 12 * strength;
    
    for (let i = 0; i < 3; i++) {
      const branchPath = [];
      branchPath.push({ x: from.point.x, y: from.point.y });
      
      for (let j = 1; j < segments; j++) {
        const t = j / segments;
        const baseX = from.point.x + dx * t;
        const baseY = from.point.y + dy * t;
        
        const offset = (Math.random() - 0.5) * 18 * strength;
        const perpX = -dy / distance * offset;
        const perpY = dx / distance * offset;
        
        branchPath.push({
          x: baseX + perpX,
          y: baseY + perpY
        });
      }
      
      branchPath.push({ x: to.point.x, y: to.point.y });
      
      ctx.beginPath();
      ctx.moveTo(branchPath[0].x, branchPath[0].y);
      for (let k = 1; k < branchPath.length; k++) {
        ctx.lineTo(branchPath[k].x, branchPath[k].y);
      }
      ctx.stroke();
    }
    
    // 端点脉冲效果
    const pulseRadius = 8 * strength;
    
    // 从端点
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 15 * strength;
    ctx.globalAlpha = 0.8 * strength;
    ctx.beginPath();
    ctx.arc(from.point.x, from.point.y, pulseRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // 到端点
    ctx.beginPath();
    ctx.arc(to.point.x, to.point.y, pulseRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // 中心亮点
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8 * strength;
    ctx.globalAlpha = 1 * strength;
    ctx.beginPath();
    ctx.arc(from.point.x, from.point.y, pulseRadius * 0.4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(to.point.x, to.point.y, pulseRadius * 0.4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  };

  // 重绘所有图形
  const drawAllShapes = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawGridAndAxes();
    shapes.forEach((shape, idx) => {
      if (shape.type === 'pen' || shape.type === 'eraser') {
        ctx.save();
        ctx.strokeStyle = shape.type === 'eraser' ? '#fff' : shape.color;
        ctx.lineWidth = shape.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        shape.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      } else if (shape.type === 'line') {
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        ctx.lineTo(shape.points[1].x, shape.points[1].y);
        ctx.stroke();
        // 画端点 - 端点大小与线条粗细成比例
        ctx.save();
        const endpointRadius = Math.max(6, shape.size * 1.5); // 最小6像素，最大为线条粗细的1.5倍
        for (let j = 0; j < 2; j++) {
          const isSnapHovered = hoveredSnapPoint && hoveredSnapPoint.shapeIndex === idx && hoveredSnapPoint.pointIndex === j;
          ctx.fillStyle = isSnapHovered ? '#ff9800' : '#2196f3';
          ctx.beginPath();
          ctx.arc(shape.points[j].x, shape.points[j].y, isSnapHovered ? endpointRadius * 1.5 : endpointRadius, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      } else if (shape.type === 'triangle') {
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        ctx.lineTo(shape.points[1].x, shape.points[1].y);
        ctx.lineTo(shape.points[2].x, shape.points[2].y);
        ctx.closePath();
        ctx.stroke();
        // 画三个顶点 - 顶点大小与线条粗细成比例
        const vertexRadius = Math.max(6, shape.size * 1.5); // 最小6像素，最大为线条粗细的1.5倍
        for (let j = 0; j < 3; j++) {
          const isSnapHovered = hoveredSnapPoint && hoveredSnapPoint.shapeIndex === idx && hoveredSnapPoint.pointIndex === j;
          ctx.fillStyle = isSnapHovered ? '#ff9800' : '#2196f3';
          ctx.beginPath();
          ctx.arc(shape.points[j].x, shape.points[j].y, isSnapHovered ? vertexRadius * 1.5 : vertexRadius, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
      } else if (shape.type === 'auxline') {
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.size;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        ctx.lineTo(shape.points[1].x, shape.points[1].y);
        ctx.stroke();
        ctx.setLineDash([]);
        // 画端点 - 端点大小与线条粗细成比例
        const auxEndpointRadius = Math.max(6, shape.size * 1.5);
        for (let j = 0; j < 2; j++) {
          const isSnapHovered = hoveredSnapPoint && hoveredSnapPoint.shapeIndex === idx && hoveredSnapPoint.pointIndex === j;
          ctx.fillStyle = isSnapHovered ? '#ff9800' : '#2196f3';
          ctx.beginPath();
          ctx.arc(shape.points[j].x, shape.points[j].y, isSnapHovered ? auxEndpointRadius * 1.5 : auxEndpointRadius, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
      } else if (shape.type === 'angle') {
        // 画三个端点高亮
        for (let j = 0; j < 3; j++) {
          const isSnapHovered = hoveredSnapPoint && hoveredSnapPoint.shapeIndex === idx && hoveredSnapPoint.pointIndex === j;
          ctx.fillStyle = isSnapHovered ? '#ff9800' : '#2196f3';
          ctx.beginPath();
          ctx.arc(shape.points[j].x, shape.points[j].y, isSnapHovered ? 12 : 6, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
      }
    });
    // 辅助线预览
    if (tool === TOOL_AUXLINE && auxLinePoints.length === 1) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(auxLinePoints[0].x, auxLinePoints[0].y);
      ctx.lineTo(auxLinePoints[0].x, auxLinePoints[0].y); // 先画一个点
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    // 绘制当前正在绘制的 shape（预览）
    if (drawingShape) {
      if (drawingShape.type === 'pen' || drawingShape.type === 'eraser') {
        ctx.save();
        ctx.strokeStyle = drawingShape.type === 'eraser' ? '#fff' : drawingShape.color;
        ctx.lineWidth = drawingShape.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        drawingShape.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      } else if (drawingShape.type === 'line') {
        ctx.save();
        ctx.strokeStyle = drawingShape.color;
        ctx.lineWidth = drawingShape.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(drawingShape.points[0].x, drawingShape.points[0].y);
        ctx.lineTo(drawingShape.points[1].x, drawingShape.points[1].y);
        ctx.stroke();
        // 画端点 - 端点大小与线条粗细成比例
        const previewEndpointRadius = Math.max(6, drawingShape.size * 1.5);
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(drawingShape.points[0].x, drawingShape.points[0].y, previewEndpointRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(drawingShape.points[1].x, drawingShape.points[1].y, previewEndpointRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      } else if (drawingShape.type === 'triangle') {
        ctx.save();
        ctx.strokeStyle = drawingShape.color;
        ctx.lineWidth = drawingShape.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(drawingShape.points[0].x, drawingShape.points[0].y);
        ctx.lineTo(drawingShape.points[1].x, drawingShape.points[1].y);
        ctx.lineTo(drawingShape.points[2].x, drawingShape.points[2].y);
        ctx.closePath();
        ctx.stroke();
        // 画三个顶点 - 顶点大小与线条粗细成比例
        const previewVertexRadius = Math.max(6, drawingShape.size * 1.5);
        ctx.fillStyle = '#2196f3';
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.arc(drawingShape.points[j].x, drawingShape.points[j].y, previewVertexRadius, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    
    // 绘制电流连接效果
    electricConnections.forEach(connection => {
      drawElectricConnection(ctx, connection);
    });
  };

  useEffect(() => {
    drawAllShapes();
    // eslint-disable-next-line
  }, [shapes, drawingShape, tool, auxLinePoints, electricConnections]);

  // 拖动时的电流效果定时器
  useEffect(() => {
    if (dragging && electricConnections.length > 0) {
      // 清除之前的定时器
      if (electricTimer) {
        clearInterval(electricTimer);
      }
      
      // 创建新的定时器，每50ms重新绘制一次电流效果
      const timer = setInterval(() => {
        drawAllShapes();
      }, 50);
      
      setElectricTimer(timer);
    } else {
      // 清除定时器
      if (electricTimer) {
        clearInterval(electricTimer);
        setElectricTimer(null);
      }
    }
    
    // 清理函数
    return () => {
      if (electricTimer) {
        clearInterval(electricTimer);
      }
    };
  }, [dragging, electricConnections]);

  // 检测拖动时的电流连接
  const detectDragElectricConnections = (dragPoint, excludeShapeIndex, excludePointIndex) => {
    const connections = [];
    const connectionRadius = 30; // 拖动时的电流连接检测半径
    
    if (!dragPoint) return connections;
    
    // 遍历所有形状的端点
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      const points = shape.type === 'triangle' ? 3 : 2;
      
      for (let j = 0; j < points; j++) {
        // 排除当前正在拖动的端点
        if (i === excludeShapeIndex && j === excludePointIndex) continue;
        
        const point = shape.points[j];
        const distance = Math.hypot(dragPoint.x - point.x, dragPoint.y - point.y);
        
        if (distance <= connectionRadius) {
          connections.push({
            from: { point: dragPoint },
            to: { shapeIndex: i, pointIndex: j, point: point },
            distance: distance,
            strength: Math.max(0.3, 1 - (distance / connectionRadius))
          });
        }
      }
    }
    
    return connections;
  };

  // 鼠标按下
  const startDraw = (e) => {
    const pos = getCanvasPos(e.nativeEvent, canvasRef.current);
    
    // 检查是否点击到任何形状的端点，如果点击到则开始拖动
    const hit = getHitPoint(pos.x, pos.y);
    if (hit && typeof hit.pointIndex === 'number') {
      setDragging(hit);
      return;
    }
    
    if (tool === TOOL_AUXLINE) {
      // 检查是否点中已存在的点或端点
      if (hit && hit.type === 'auxline') {
        setDragging({ shapeIndex: hit.shapeIndex, pointIndex: hit.pointIndex, type: 'auxline' });
        return;
      }
      // 使用新的吸附检测函数来获取吸附点
      const snapHit = getSnapPoint(pos.x, pos.y, -1, -1);
      const usePos = snapHit ? snapHit.point : pos;
      if (auxLinePoints.length === 0) {
        setAuxLinePoints([usePos]);
      } else if (auxLinePoints.length === 1) {
        setShapes(prev => [...prev, {
          type: 'auxline',
          color,
          size: 2,
          points: [auxLinePoints[0], usePos]
        }]);
        setAuxLinePoints([]);
      }
      return;
    }
    
    if (tool === TOOL_PEN || tool === TOOL_ERASER) {
      setDrawingShape({
        type: tool === TOOL_PEN ? 'pen' : 'eraser',
        color,
        size,
        points: [pos]
      });
    } else if (tool === TOOL_LINE) {
      setDrawingShape({
        type: 'line',
        color,
        size,
        points: [pos, pos]
      });
    } else if (tool === TOOL_TRIANGLE) {
      setDrawingShape({
        type: 'triangle',
        color,
        size,
        points: [pos, pos, pos]
      });
    }
  };

  // 鼠标移动
  const draw = (e) => {
    const pos = getCanvasPos(e.nativeEvent, canvasRef.current);
    
    // 拖动端点 - 根据被拖动形状的实际类型执行相应操作
    if (dragging && typeof dragging.pointIndex === 'number') {
      const shape = shapes[dragging.shapeIndex];
      let newX = pos.x, newY = pos.y;
      
      // 检测拖动时的电流连接
      const dragConnections = detectDragElectricConnections(pos, dragging.shapeIndex, dragging.pointIndex);
      setElectricConnections(dragConnections);
      
      if (shape.type === 'line') {
        // 直线端点拖动逻辑
        if (e.shiftKey) {
          // Shift: 斜率锁定
          const other = shape.points[1 - dragging.pointIndex];
          const vx = shape.points[0].x - shape.points[1].x;
          const vy = shape.points[0].y - shape.points[1].y;
          const dx = pos.x - other.x;
          const dy = pos.y - other.y;
          const len2 = vx * vx + vy * vy;
          if (len2 !== 0) {
            const dot = dx * vx + dy * vy;
            const t = dot / len2;
            newX = other.x + vx * t;
            newY = other.y + vy * t;
          }
          setHoveredSnapPoint(null);
        } else {
          // 端点吸附
          const hit = getSnapPoint(pos.x, pos.y, dragging.shapeIndex, dragging.pointIndex);
          if (hit && !(hit.shapeIndex === dragging.shapeIndex && hit.pointIndex === dragging.pointIndex)) {
            newX = hit.point.x;
            newY = hit.point.y;
            setHoveredSnapPoint(hit);
          } else {
            setHoveredSnapPoint(null);
          }
        }
      } else if (shape.type === 'triangle') {
        // 三角形顶点拖动逻辑
        if (!e.shiftKey) {
          // 端点吸附
          const hit = getSnapPoint(pos.x, pos.y, dragging.shapeIndex, dragging.pointIndex);
          if (hit && !(hit.shapeIndex === dragging.shapeIndex && hit.pointIndex === dragging.pointIndex)) {
            newX = hit.point.x;
            newY = hit.point.y;
            setHoveredSnapPoint(hit);
          } else {
            setHoveredSnapPoint(null);
          }
        } else {
          setHoveredSnapPoint(null);
        }
      } else if (shape.type === 'auxline') {
        // 辅助线端点拖动逻辑
        if (!e.shiftKey) {
          const hit = getSnapPoint(pos.x, pos.y, dragging.shapeIndex, dragging.pointIndex);
          if (hit && !(hit.shapeIndex === dragging.shapeIndex && hit.pointIndex === dragging.pointIndex)) {
            newX = hit.point.x;
            newY = hit.point.y;
            setHoveredSnapPoint(hit);
          } else {
            setHoveredSnapPoint(null);
          }
        } else {
          setHoveredSnapPoint(null);
        }
      } else if (shape.type === 'angle') {
        // 角度端点拖动逻辑
        if (!e.shiftKey) {
          const hit = getSnapPoint(pos.x, pos.y, dragging.shapeIndex, dragging.pointIndex);
          if (hit && !(hit.shapeIndex === dragging.shapeIndex && hit.pointIndex === dragging.pointIndex)) {
            newX = hit.point.x;
            newY = hit.point.y;
            setHoveredSnapPoint(hit);
          } else {
            setHoveredSnapPoint(null);
          }
        } else {
          setHoveredSnapPoint(null);
        }
      }
      
      // 获取当前拖动点的原始位置
      const originalPoint = shape.points[dragging.pointIndex];
      
      // 更新形状 - 同时更新所有与该点位置相同的端点
      setShapes(prev => prev.map((shape, idx) => {
        if (idx !== dragging.shapeIndex) {
          // 检查其他形状是否有端点与当前拖动点位置相同
          const points = shape.type === 'triangle' ? 3 : 2;
          let hasMatchingPoint = false;
          let newPoints = [...shape.points];
          
          for (let j = 0; j < points; j++) {
            // 检查是否与原始拖动点位置相同（允许小的误差）
            const point = shape.points[j];
            const distance = Math.hypot(point.x - originalPoint.x, point.y - originalPoint.y);
            if (distance < 1) { // 1像素的误差范围
              newPoints[j] = { x: newX, y: newY };
              hasMatchingPoint = true;
            }
          }
          
          return hasMatchingPoint ? { ...shape, points: newPoints } : shape;
        } else {
          // 更新当前拖动的形状
          const newPoints = shape.points.map((pt, j) =>
            j === dragging.pointIndex ? { x: newX, y: newY } : pt
          );
          return { ...shape, points: newPoints };
        }
      }));
      return;
    }
    if (!drawingShape) return;
    if (drawingShape.type === 'pen' || drawingShape.type === 'eraser') {
      setDrawingShape({
        ...drawingShape,
        points: [...drawingShape.points, pos]
      });
    } else if (drawingShape.type === 'line') {
      setDrawingShape({
        ...drawingShape,
        points: [drawingShape.points[0], pos]
      });
    } else if (drawingShape.type === 'triangle') {
      // 三角形：第一个点为底边左端，第二个点为底边右端，第三个点为顶点
      const x1 = drawingShape.points[0].x, y1 = drawingShape.points[0].y;
      const x2 = pos.x, y2 = drawingShape.points[0].y;
      const x3 = x1 + (x2 - x1) / 2, y3 = pos.y;
      setDrawingShape({
        ...drawingShape,
        points: [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
          { x: x3, y: y3 }
        ]
      });
    }
  };

  // 鼠标松开
  const endDraw = (e) => {
    if (dragging) {
      setDragging(null);
      setHoveredSnapPoint(null);
      setElectricConnections([]); // 清除电流连接
      return;
    }
    if (!drawingShape) return;
    setShapes(prev => [...prev, drawingShape]);
    setDrawingShape(null);
  };

  // 撤销
  const handleUndo = () => {
    setShapes(prev => prev.slice(0, -1));
    setAuxLinePoints([]);
  };

  // 删除全部
  const handleClearAll = () => {
    setShapes([]);
    setAuxLinePoints([]);
  };

  // 工具切换
  const handlePen = () => setTool(TOOL_PEN);
  const handleEraser = () => setTool(TOOL_ERASER);
  const handleLine = () => setTool(TOOL_LINE);
  const handleTriangle = () => setTool(TOOL_TRIANGLE);
  const handleAuxLine = () => {
    setTool(TOOL_AUXLINE);
    setAuxLinePoints([]);
  };

  // 颜色切换
  const handleColor = (c) => {
    setColor(c);
  };

  // 粗细切换
  const handleSize = (s) => {
    setSize(s);
  };

  return (
    <DrawBoardContainer>
      <ContentCard>
        <Header>
          <Title>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875z" />
              <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 001.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 12.164 9.315 12.75 12 12.75z" />
              <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 15.914 9.315 16.5 12 16.5z" />
            </svg>
            DrawBoard
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
          <ToolButton
            onClick={handleAuxLine}
            $active={tool === TOOL_AUXLINE}
          >
            辅助线
          </ToolButton>
          <span style={{ color: '#006064', fontWeight: 500, marginLeft: '1rem' }}>颜色：</span>
          {COLORS.map(c => (
            <ColorPickerIcon
              key={c}
              color={c}
              $active={color === c}
              onClick={() => handleColor(c)}
              style={{ opacity: tool === TOOL_ERASER ? 0.5 : 1 }}
            />
          ))}
          <span style={{ color: '#006064', fontWeight: 500, marginLeft: '1rem' }}>粗细：</span>
          {SIZES.map(s => (
            <SizePickerIcon
              key={s}
              size={s}
              $active={size === s}
              onClick={() => handleSize(s)}
            />
          ))}
          <ToolButton
            onClick={handleUndo}
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