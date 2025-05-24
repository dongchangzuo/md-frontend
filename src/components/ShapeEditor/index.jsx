import React, { useState, useRef, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import styled from 'styled-components';
import EditorGuide from './EditorGuide';
import MapShape from './MapShape';
import GIF from 'gif.js/dist/gif.js';
import html2canvas from 'html2canvas';
import { useLocation } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 200px;
  background: #fff;
  padding: 20px;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

const Canvas = styled.div`
  flex: 1;
  padding: 20px;
  position: relative;
  background: #f0f0f0;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const ShapeItem = styled.div`
  width: 60px;
  height: 60px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  background: ${props => props.type === 'array' ? 'transparent' : '#fff'};
  border: ${props => props.type === 'array' ? 'none' : '1px solid #ddd'};
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    transform: ${props => props.type === 'array' ? 'none' : 'scale(1.05)'};
    box-shadow: ${props => props.type === 'array' ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.1)'};
  }
`;

const DraggableShape = styled.div`
  position: absolute;
  cursor: move;
  user-select: none;
  background: ${props => props.color || '#000'};
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  transform: rotate(${props => props.rotation}deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const ColorPickerContainer = styled.div`
  position: absolute;
  z-index: 1000;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const ArrayEditorContainer = styled.div`
  position: absolute;
  z-index: 1000;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  min-width: 300px;
`;

const ArrayInput = styled.textarea`
  width: 100%;
  height: 100px;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357abd;
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const TemplateButton = styled.button`
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357abd;
  }
`;

const TemplateSelector = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const GroupContainer = styled.div`
  position: absolute;
  border: 2px dashed #4a90e2;
  background: rgba(74, 144, 226, 0.05);
  pointer-events: none;
  transition: all 0.2s;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  padding: 8px 16px;
  margin: 5px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: inline-block;
  transition: background-color 0.2s;

  &:hover {
    background-color: #357abd;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  padding: 32px 24px 24px 24px;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  &:hover { background: #eee; }
`;

const basicShapes = [
  { type: 'rectangle', width: 100, height: 60, color: '#1a73e8' },
  { type: 'square', width: 80, height: 80, color: '#1a73e8' },
  { type: 'triangle', width: 0, height: 0, color: '#1a73e8' },
  { type: 'arrow', width: 100, height: 40, color: '#1a73e8' },
  { type: 'array', width: 200, height: 60, color: '#1a73e8' },
  { type: 'stack', width: 60, height: 200, color: '#1a73e8' },
  { type: 'map', width: 120, height: 60, color: '#ffd54f' },
];

const templates = [
  {
    name: '基础流程图',
    shapes: [
      { type: 'rectangle', width: 100, height: 60, color: '#1a73e8', x: 100, y: 100 },
      { type: 'arrow', width: 100, height: 40, color: '#1a73e8', x: 100, y: 180 },
      { type: 'rectangle', width: 100, height: 60, color: '#1a73e8', x: 100, y: 240 }
    ]
  },
  {
    name: '数组示例',
    shapes: [
      { 
        type: 'array', 
        width: 200, 
        height: 60, 
        color: '#1a73e8', 
        x: 100, 
        y: 100,
        arrayData: ['1', '2', '3'],
        boxColors: ['#4a90e2', '#357abd', '#2c5282']
      }
    ]
  }
];

const ShapeEditor = ({ defaultTab }) => {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState(null);
  const [arrayEditorPosition, setArrayEditorPosition] = useState(null);
  const [arrayInput, setArrayInput] = useState('');
  const [draggedShape, setDraggedShape] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingLabel, setEditingLabel] = useState(null);
  const [copiedShape, setCopiedShape] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isSelectingGroup, setIsSelectingGroup] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [stackEditorPosition, setStackEditorPosition] = useState(null);
  const [stackInput, setStackInput] = useState('');
  const [mapEditorPosition, setMapEditorPosition] = useState(null);
  const [mapInput, setMapInput] = useState('');
  const [gifDelay, setGifDelay] = useState(600);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab || 'all');

  useEffect(() => {
    if (location.pathname.endsWith('/map')) setActiveTab('map');
    else if (location.pathname.endsWith('/tree')) setActiveTab('tree');
    else setActiveTab(defaultTab || 'all');
  }, [location.pathname, defaultTab]);

  const handleDragStart = (e, shape) => {
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const shape = JSON.parse(e.dataTransfer.getData('shape'));
    const rect = canvasRef.current.getBoundingClientRect();
    const gridSize = 20; // 网格大小
    const x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
    const y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;

    setShapes([...shapes, {
      ...shape,
      id: Date.now(),
      x,
      y,
      rotation: 0,
      arrayData: shape.type === 'array' ? [] : undefined
    }]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasMouseDown = (e) => {
    if (e.button === 0 && e.ctrlKey) { // 按住 Ctrl 键左键点击开始选择
      setIsSelectingGroup(true);
      const rect = canvasRef.current.getBoundingClientRect();
      setSelectionStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setSelectionEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isSelectingGroup) {
      const rect = canvasRef.current.getBoundingClientRect();
      setSelectionEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isSelectingGroup && selectionStart && selectionEnd) {
      // 计算选择框的范围
      const left = Math.min(selectionStart.x, selectionEnd.x);
      const top = Math.min(selectionStart.y, selectionEnd.y);
      const right = Math.max(selectionStart.x, selectionEnd.x);
      const bottom = Math.max(selectionStart.y, selectionEnd.y);

      // 找出在选择框内的图形
      const selectedShapes = shapes.filter(shape => {
        const shapeRight = shape.x + shape.width;
        const shapeBottom = shape.y + shape.height;
        return shape.x >= left && shapeRight <= right &&
               shape.y >= top && shapeBottom <= bottom;
      });

      if (selectedShapes.length > 0) {
        // 创建新的 group
        const newGroup = {
          id: Date.now(),
          shapes: selectedShapes.map(shape => shape.id),
          x: left,
          y: top,
          width: right - left,
          height: bottom - top
        };
        setGroups([...groups, newGroup]);
      }

      setIsSelectingGroup(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  };

  const handleShapeMouseDown = (e, shape) => {
    e.stopPropagation();
    
    // 检查是否点击了 group
    const clickedGroup = groups.find(group => 
      group.shapes.includes(shape.id)
    );

    if (clickedGroup) {
      setSelectedGroup(clickedGroup);
      setDraggedShape(clickedGroup);
      
      const rect = e.target.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    } else {
      setSelectedShape(shape);
      setDraggedShape(shape);
      
      const rect = e.target.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (draggedShape) {
      const rect = canvasRef.current.getBoundingClientRect();
      const gridSize = 20;
      const x = Math.round((e.clientX - rect.left - dragOffset.x) / gridSize) * gridSize;
      const y = Math.round((e.clientY - rect.top - dragOffset.y) / gridSize) * gridSize;

      if (selectedGroup) {
        // 移动 group 中的所有图形
        const dx = x - selectedGroup.x;
        const dy = y - selectedGroup.y;
        
        setShapes(shapes.map(shape => 
          selectedGroup.shapes.includes(shape.id)
            ? { ...shape, x: shape.x + dx, y: shape.y + dy }
            : shape
        ));
        
        setGroups(groups.map(group =>
          group.id === selectedGroup.id
            ? { ...group, x, y }
            : group
        ));
      } else {
        setShapes(shapes.map(shape => 
          shape.id === draggedShape.id
            ? { ...shape, x, y }
            : shape
        ));
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedShape(null);
    setSelectedGroup(null);
  };

  const handleCopy = () => {
    if (selectedShape) {
      const newShape = {
        ...selectedShape,
        id: Date.now(),
        x: selectedShape.x + 20, // 向右偏移一点
        y: selectedShape.y + 20  // 向下偏移一点
      };
      setShapes([...shapes, newShape]);
      setCopiedShape(newShape);
    }
  };

  const handleContextMenu = (e, shape, boxIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedShape(shape);
    setSelectedBoxIndex(boxIndex);
    
    if (shape.type === 'array') {
      if (boxIndex !== null) {
        setColorPickerPosition({ x: e.clientX, y: e.clientY });
        setArrayEditorPosition(null);
        setStackEditorPosition(null);
      } else {
        setArrayEditorPosition({ x: e.clientX, y: e.clientY });
        setColorPickerPosition(null);
        setStackEditorPosition(null);
        setArrayInput(shape.arrayData ? shape.arrayData.join(', ') : '');
      }
    } else if (shape.type === 'stack') {
      if (boxIndex !== null) {
        setColorPickerPosition({ x: e.clientX, y: e.clientY });
        setArrayEditorPosition(null);
        setStackEditorPosition(null);
      } else {
        setStackEditorPosition({ x: e.clientX, y: e.clientY });
        setColorPickerPosition(null);
        setArrayEditorPosition(null);
        setStackInput(shape.stackData ? shape.stackData.join(', ') : '');
      }
    } else if (shape.type === 'map') {
      if (boxIndex !== null) {
        setColorPickerPosition({ x: e.clientX, y: e.clientY });
        setArrayEditorPosition(null);
        setStackEditorPosition(null);
        setMapEditorPosition(null);
      } else {
        setMapEditorPosition({ x: e.clientX, y: e.clientY });
        setColorPickerPosition(null);
        setArrayEditorPosition(null);
        setStackEditorPosition(null);
        setMapInput(shape.mapData ? shape.mapData.map(item => `${item.key}:${item.value}`).join(', ') : '');
      }
    } else {
      setColorPickerPosition({ x: e.clientX, y: e.clientY });
      setArrayEditorPosition(null);
      setStackEditorPosition(null);
      setMapEditorPosition(null);
    }
  };

  const handleColorChange = (color) => {
    if (selectedShape) {
      if (selectedShape.type === 'array' && selectedBoxIndex !== null) {
        // Update color for specific box in array
        setShapes(shapes.map(shape => {
          if (shape.id === selectedShape.id) {
            const newBoxColors = [...(shape.boxColors || [])];
            const boxColorsIdx = (shape.boxColors?.length || 0) - 1 - selectedBoxIndex;
            newBoxColors[boxColorsIdx] = color.hex;
            return { ...shape, boxColors: newBoxColors };
          }
          return shape;
        }));
      } else if (selectedShape.type === 'stack' && selectedBoxIndex !== null) {
        // 修正：直接用 selectedBoxIndex
        setShapes(shapes.map(shape => {
          if (shape.id === selectedShape.id) {
            const newBoxColors = [...(shape.boxColors || [])];
            newBoxColors[selectedBoxIndex] = color.hex;
            return { ...shape, boxColors: newBoxColors };
          }
          return shape;
        }));
      } else if (selectedShape.type === 'map' && selectedBoxIndex !== null) {
        // 修正：reverse 索引 + 补全 boxColors 长度
        setShapes(shapes.map(shape => {
          if (shape.id === selectedShape.id) {
            const mapLen = shape.mapData?.length || 0;
            const newBoxColors = [...(shape.boxColors || [])];
            while (newBoxColors.length < mapLen) newBoxColors.push('#ffd54f');
            const boxColorsIdx = newBoxColors.length - 1 - selectedBoxIndex;
            newBoxColors[boxColorsIdx] = color.hex;
            return { ...shape, boxColors: newBoxColors };
          }
          return shape;
        }));
      } else {
        // Update color for entire shape
        setShapes(shapes.map(shape => 
          shape.id === selectedShape.id 
            ? { ...shape, color: color.hex }
            : shape
        ));
      }
    }
  };

  const handleArraySubmit = () => {
    if (selectedShape) {
      const arrayData = arrayInput.split(',').map(item => item.trim()).filter(Boolean);
      setShapes(shapes.map(shape => 
        shape.id === selectedShape.id 
          ? { ...shape, arrayData }
          : shape
      ));
      setArrayEditorPosition(null);
    }
  };

  const handleStackSubmit = () => {
    if (selectedShape) {
      const stackData = stackInput.split(',').map(item => item.trim()).filter(Boolean);
      setShapes(shapes.map(shape =>
        shape.id === selectedShape.id
          ? { ...shape, stackData }
          : shape
      ));
      setStackEditorPosition(null);
    }
  };

  const handleMapSubmit = () => {
    if (selectedShape) {
      // 支持 a:1, b:2, c:3 格式
      const mapData = mapInput.split(',').map(item => {
        const [key, value] = item.split(':').map(s => s.trim());
        return key && value !== undefined ? { key, value } : null;
      }).filter(Boolean);
      setShapes(shapes.map(shape =>
        shape.id === selectedShape.id
          ? { ...shape, mapData }
          : shape
      ));
      setMapEditorPosition(null);
    }
  };

  const handleClickOutside = (e) => {
    if (colorPickerPosition && !e.target.closest('.color-picker')) {
      setColorPickerPosition(null);
      setSelectedBoxIndex(null);
    }
    if (arrayEditorPosition && !e.target.closest('.array-editor')) {
      setArrayEditorPosition(null);
    }
    if (stackEditorPosition && !e.target.closest('.stack-editor')) {
      setStackEditorPosition(null);
    }
    if (mapEditorPosition && !e.target.closest('.map-editor')) {
      setMapEditorPosition(null);
    }
  };

  const handleAddArrow = (position) => {
    if (selectedShape && selectedBoxIndex !== null) {
      if (selectedShape.type === 'array') {
        setShapes(shapes.map(shape => {
          if (shape.id === selectedShape.id) {
            const arrows = { ...(shape.arrows || {}) };
            if (!arrows[selectedBoxIndex]) {
              arrows[selectedBoxIndex] = {};
            }
            arrows[selectedBoxIndex][position] = !arrows[selectedBoxIndex][position];
            if (!arrows[selectedBoxIndex].up && !arrows[selectedBoxIndex].down) {
              delete arrows[selectedBoxIndex];
            }
            return { ...shape, arrows };
          }
          return shape;
        }));
        setColorPickerPosition(null);
        setSelectedBoxIndex(null);
      } else if (selectedShape.type === 'stack') {
        setShapes(shapes.map(shape => {
          if (shape.id === selectedShape.id) {
            const arrows = { ...(shape.arrows || {}) };
            const idx = (shape.stackData?.length || 0) - 1 - selectedBoxIndex;
            if (!arrows[idx]) {
              arrows[idx] = {};
            }
            arrows[idx][position] = !arrows[idx][position];
            if (!arrows[idx].left && !arrows[idx].right) {
              delete arrows[idx];
            }
            return { ...shape, arrows };
          }
          return shape;
        }));
        setColorPickerPosition(null);
        setSelectedBoxIndex(null);
      } else if (selectedShape.type === 'map') {
        setShapes(shapes.map(shape => {
          if (shape.id === selectedShape.id) {
            const arrows = { ...(shape.arrows || {}) };
            const idx = (shape.mapData?.length || 0) - 1 - selectedBoxIndex;
            if (!arrows[idx]) arrows[idx] = {};
            arrows[idx][position] = !arrows[idx][position];
            if (!arrows[idx].left && !arrows[idx].right) delete arrows[idx];
            return { ...shape, arrows };
          }
          return shape;
        }));
        setColorPickerPosition(null);
        setSelectedBoxIndex(null);
      }
    }
  };

  const handleArrowLabelChange = (position, value) => {
    if (selectedShape && selectedShape.type === 'array' && selectedBoxIndex !== null) {
      setShapes(shapes.map(shape => {
        if (shape.id === selectedShape.id) {
          const arrowLabels = { ...(shape.arrowLabels || {}) };
          if (!arrowLabels[selectedBoxIndex]) {
            arrowLabels[selectedBoxIndex] = {};
          }
          arrowLabels[selectedBoxIndex][position] = value;
          return { ...shape, arrowLabels };
        }
        return shape;
      }));
    }
  };

  const applyTemplate = (template) => {
    const newShapes = template.shapes.map(shape => ({
      ...shape,
      id: Date.now() + Math.random(),
      rotation: 0
    }));
    setShapes([...shapes, ...newShapes]);
    setShowTemplates(false);
  };

  const handleDeleteGroup = (groupId) => {
    setGroups(groups.filter(group => group.id !== groupId));
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 先清除画布上的所有内容
      setShapes([]);
      setGroups([]);
      setSelectedShape(null);
      setSelectedGroup(null);
      setColorPickerPosition(null);
      setArrayEditorPosition(null);
      setStackEditorPosition(null);
      setMapEditorPosition(null);
      setCopiedShape(null);
      setEditingLabel(null);

      console.log('Reading file:', file.name);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const yamlContent = event.target.result;
          console.log('File content:', yamlContent);
          
          const shapes = parseYamlToShapes(yamlContent);
          console.log('Parsed shapes:', shapes);
          
          if (shapes.length === 0) {
            alert('No shapes found in the YAML file.');
            return;
          }

          // 添加新图形
          setShapes(shapes);
        } catch (error) {
          console.error('Error parsing YAML:', error);
          alert('Error parsing YAML file. Please check the format.');
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
      };

      reader.readAsText(file);
    }
  };

  const parseYamlToShapes = (yamlContent) => {
    console.log('Parsing YAML content:', yamlContent);
    
    try {
      // 解析 YAML 内容
      const data = yamlContent.split('\n').reduce((acc, line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return acc;

        // 解析标题
        if (trimmedLine.startsWith('title:')) {
          acc.title = trimmedLine.split(':')[1].trim();
          return acc;
        }

        // 解析图像
        if (trimmedLine.startsWith('images:')) {
          acc.images = [];
          return acc;
        }

        // 解析单个图像
        if (trimmedLine.startsWith('- image:')) {
          acc.images.push({ type: '', arrayData: [] });
          return acc;
        }

        // 解析类型
        if (trimmedLine.startsWith('type:')) {
          if (acc.images && acc.images.length > 0) {
            acc.images[acc.images.length - 1].type = trimmedLine.split(':')[1].trim();
          }
          return acc;
        }

        // 解析数组数据
        if (trimmedLine.startsWith('arrayData:')) {
          return acc;
        }

        // 解析数组项
        if (trimmedLine.startsWith('- value:')) {
          const currentImage = acc.images[acc.images.length - 1];
          if (currentImage) {
            currentImage.arrayData.push({
              value: trimmedLine.split(':')[1].trim(),
              color: '#000000',
              arrow: 'none'
            });
          }
          return acc;
        }

        // 解析颜色
        if (trimmedLine.startsWith('color:')) {
          const currentImage = acc.images[acc.images.length - 1];
          if (currentImage && currentImage.arrayData.length > 0) {
            currentImage.arrayData[currentImage.arrayData.length - 1].color = 
              trimmedLine.split(':')[1].trim();
          }
          return acc;
        }

        // 解析箭头
        if (trimmedLine.startsWith('arrow:')) {
          const currentImage = acc.images[acc.images.length - 1];
          if (currentImage && currentImage.arrayData.length > 0) {
            const arrowValue = trimmedLine.split(':')[1].trim();
            currentImage.arrayData[currentImage.arrayData.length - 1].arrow = arrowValue;
            console.log('Parsed arrow value:', arrowValue); // 添加日志
          }
          return acc;
        }

        return acc;
      }, { title: '', images: [] });

      console.log('Parsed data:', data);

      // 转换为图形数组
      const shapes = data.images.map((image, index) => {
        const shape = {
          type: image.type,
          id: Date.now() + index,
          x: 100 + index * 300, // 水平排列
          y: 100,
          rotation: 0,
          width: 200,
          height: 60,
          color: '#1a73e8',
          arrayData: image.arrayData.map(item => item.value),
          boxColors: image.arrayData.map(item => item.color),
          arrows: {}
        };

        // 处理箭头
        image.arrayData.forEach((item, i) => {
          if (item.arrow && item.arrow !== 'none') {
            if (!shape.arrows[i]) {
              shape.arrows[i] = {};
            }
            // 根据箭头值设置上下箭头
            if (item.arrow.includes('up')) {
              shape.arrows[i].up = true;
            }
            if (item.arrow.includes('down')) {
              shape.arrows[i].down = true;
            }
            console.log(`Setting arrows for index ${i}:`, shape.arrows[i]); // 添加日志
          }
        });

        console.log('Final shape:', shape); // 添加日志
        return shape;
      });

      console.log('Final shapes:', shapes);
      return shapes;
    } catch (error) {
      console.error('Error parsing YAML:', error);
      throw error;
    }
  };

  const exportGif = async () => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.offsetWidth;
    const height = canvasRef.current.offsetHeight;
    const gif = new GIF({ workers: 2, quality: 10, width, height, workerScript: '/gif.worker.js' });

    // 记录原背景样式
    const origBgImg = canvasRef.current.style.backgroundImage;
    const origBgSize = canvasRef.current.style.backgroundSize;
    // 移除背景格子
    canvasRef.current.style.backgroundImage = 'none';
    canvasRef.current.style.backgroundSize = '';

    for (let i = 0; i < shapes.length; i++) {
      // 只显示第i个shape
      const prevDisplay = [];
      for (let j = 0; j < canvasRef.current.children.length; j++) {
        const el = canvasRef.current.children[j];
        if (j !== i) {
          prevDisplay[j] = el.style.display;
          el.style.display = 'none';
        }
      }
      await new Promise(resolve => setTimeout(resolve, 50)); // 等待DOM刷新
      // 获取当前 shape 的 DOM 元素
      const shapeEl = canvasRef.current.children[i];
      if (!shapeEl) continue;
      // 用 html2canvas 截 shape 元素
      const shapeCanvas = await html2canvas(shapeEl, { backgroundColor: null });
      // 创建与主画布同尺寸的新 canvas，shape 居中
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = width;
      frameCanvas.height = height;
      const fctx = frameCanvas.getContext('2d');
      // 计算 shape 居中位置
      const dx = (width - shapeCanvas.width) / 2;
      const dy = (height - shapeCanvas.height) / 2;
      fctx.clearRect(0, 0, width, height);
      fctx.drawImage(shapeCanvas, dx, dy);
      gif.addFrame(frameCanvas, { delay: gifDelay });
      // 恢复显示
      for (let j = 0; j < canvasRef.current.children.length; j++) {
        if (j !== i) {
          canvasRef.current.children[j].style.display = prevDisplay[j] || '';
        }
      }
    }
    // 恢复背景格子
    canvasRef.current.style.backgroundImage = origBgImg;
    canvasRef.current.style.backgroundSize = origBgSize;

    gif.on('finished', function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shapes.gif';
      a.click();
      URL.revokeObjectURL(url);
    });
    gif.render();
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [draggedShape, dragOffset, shapes, colorPickerPosition, arrayEditorPosition, stackEditorPosition, mapEditorPosition]);

  const renderShape = (shape) => {
    switch (shape.type) {
      case 'rectangle':
        return (
          <DraggableShape
            key={shape.id}
            style={{
              left: shape.x,
              top: shape.y,
              backgroundColor: shape.color,
              width: shape.width,
              height: shape.height,
              transform: `rotate(${shape.rotation}deg)`,
              border: '2px solid #000',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            onMouseDown={(e) => handleShapeMouseDown(e, shape)}
            onContextMenu={(e) => handleContextMenu(e, shape)}
          />
        );
      case 'square':
        return (
          <DraggableShape
            key={shape.id}
            style={{
              left: shape.x,
              top: shape.y,
              backgroundColor: shape.color,
              width: shape.width,
              height: shape.height,
              transform: `rotate(${shape.rotation}deg)`,
              border: '2px solid #000',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            onMouseDown={(e) => handleShapeMouseDown(e, shape)}
            onContextMenu={(e) => handleContextMenu(e, shape)}
          />
        );
      case 'triangle':
        return (
          <DraggableShape
            key={shape.id}
            style={{
              left: shape.x,
              top: shape.y,
              width: 0,
              height: 0,
              borderLeft: '50px solid transparent',
              borderRight: '50px solid transparent',
              borderBottom: '86px solid ' + shape.color,
              transform: `rotate(${shape.rotation}deg)`,
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
            }}
            onMouseDown={(e) => handleShapeMouseDown(e, shape)}
            onContextMenu={(e) => handleContextMenu(e, shape)}
          />
        );
      case 'arrow':
        return (
          <DraggableShape
            key={shape.id}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              backgroundColor: shape.color,
              clipPath: 'polygon(0% 50%, 80% 0%, 80% 30%, 100% 30%, 100% 70%, 80% 70%, 80% 100%)',
              transform: `rotate(${shape.rotation}deg)`,
              border: '2px solid #000',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            onMouseDown={(e) => handleShapeMouseDown(e, shape)}
            onContextMenu={(e) => handleContextMenu(e, shape)}
          />
        );
      case 'array':
        if (shape.id) { // If it's a shape on canvas
          return (
            <div
              key={shape.id}
              style={{
                position: 'absolute',
                left: shape.x,
                top: shape.y,
                transform: `rotate(${shape.rotation}deg)`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px',
                cursor: 'move',
                backgroundColor: 'red',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseDown={(e) => handleShapeMouseDown(e, shape)}
              onContextMenu={(e) => handleContextMenu(e, shape)}
            >
              {shape.arrayData?.map((item, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  {/* 上方箭头 - 指向下方 */}
                  {shape.arrows?.[index]?.up && (
                    <div style={{
                      position: 'absolute',
                      top: '-55px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      zIndex: 1
                    }}>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShape(shape);
                          setSelectedBoxIndex(index);
                          setEditingLabel('up');
                        }}
                        style={{
                          fontSize: '12px',
                          color: '#1a73e8',
                          fontWeight: '500',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #1a73e8',
                          transition: 'all 0.2s',
                          marginBottom: '4px'
                        }}
                      >
                        {editingLabel === 'up' && selectedShape?.id === shape.id && selectedBoxIndex === index ? (
                          <input
                            type="text"
                            value={shape.arrowLabels?.[index]?.up || ''}
                            onChange={(e) => handleArrowLabelChange('up', e.target.value)}
                            onBlur={() => setEditingLabel(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingLabel(null);
                              }
                            }}
                            autoFocus
                            style={{
                              width: '80px',
                              border: 'none',
                              outline: 'none',
                              fontSize: '12px',
                              textAlign: 'center',
                              backgroundColor: 'transparent',
                              color: '#1a73e8',
                              fontWeight: '500',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'keep-all',
                              wordWrap: 'normal'
                            }}
                          />
                        ) : (
                          <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordBreak: 'keep-all',
                            wordWrap: 'normal',
                            maxWidth: '80px'
                          }}>
                            {shape.arrowLabels?.[index]?.up || 'start'}
                          </div>
                        )}
                      </div>
                      <div style={{
                        width: '16px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="30" viewBox="0 0 24 48" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="4" x2="12" y2="44" />
                          <polyline points="4 36 12 44 20 36" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* 框框 */}
                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      backgroundColor: shape.boxColors?.[index] || '#4a90e2',
                      border: '2px solid #357abd',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onContextMenu={(e) => handleContextMenu(e, shape, index)}
                  >
                    {item}
                  </div>
                  {/* 下方箭头 - 指向上方 */}
                  {shape.arrows?.[index]?.down && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-55px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      zIndex: 1
                    }}>
                      <div style={{
                        width: '16px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="30" viewBox="0 0 24 48" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="44" x2="12" y2="4" />
                          <polyline points="4 12 12 4 20 12" />
                        </svg>
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShape(shape);
                          setSelectedBoxIndex(index);
                          setEditingLabel('down');
                        }}
                        style={{
                          fontSize: '12px',
                          color: '#1a73e8',
                          fontWeight: '500',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #1a73e8',
                          transition: 'all 0.2s',
                          marginTop: '4px'
                        }}
                      >
                        {editingLabel === 'down' && selectedShape?.id === shape.id && selectedBoxIndex === index ? (
                          <input
                            type="text"
                            value={shape.arrowLabels?.[index]?.down || ''}
                            onChange={(e) => handleArrowLabelChange('down', e.target.value)}
                            onBlur={() => setEditingLabel(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingLabel(null);
                              }
                            }}
                            autoFocus
                            style={{
                              width: '80px',
                              border: 'none',
                              outline: 'none',
                              fontSize: '12px',
                              textAlign: 'center',
                              backgroundColor: 'transparent',
                              color: '#1a73e8',
                              fontWeight: '500',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'keep-all',
                              wordWrap: 'normal'
                            }}
                          />
                        ) : (
                          <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordBreak: 'keep-all',
                            wordWrap: 'normal',
                            maxWidth: '80px'
                          }}>
                            {shape.arrowLabels?.[index]?.down || 'end'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        } else { // If it's the icon in sidebar
          return (
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#4a90e2',
                border: '2px solid #357abd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>1</div>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#4a90e2',
                border: '2px solid #357abd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>2</div>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#4a90e2',
                border: '2px solid #357abd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>3</div>
            </div>
          );
        }
      case 'stack':
        if (shape.id) {
          const stackData = (shape.stackData || []).slice().reverse();
          const boxColors = (shape.boxColors || []).slice().reverse();
          const arrows = shape.arrows ? Object.values(shape.arrows).length ? Object.assign([], ...Object.entries(shape.arrows).map(([i, v]) => ({[stackData.length-1-i]: v}))) : [] : [];
          const arrowLabels = shape.arrowLabels ? Object.values(shape.arrowLabels).length ? Object.assign([], ...Object.entries(shape.arrowLabels).map(([i, v]) => ({[stackData.length-1-i]: v}))) : [] : [];
          return (
            <div
              key={shape.id}
              style={{
                position: 'absolute',
                left: shape.x,
                top: shape.y,
                transform: `rotate(${shape.rotation}deg)`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '12px',
                cursor: 'move',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseDown={(e) => handleShapeMouseDown(e, shape)}
              onContextMenu={(e) => handleContextMenu(e, shape)}
            >
              {stackData.map((item, index) => (
                <div key={index} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {/* 左箭头（→） */}
                  {arrows?.[index]?.left && (
                    <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                      <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="12" x2="44" y2="12" />
                        <polyline points="36 4 44 12 36 20" />
                      </svg>
                      <div 
                        onClick={(e) => { e.stopPropagation(); setSelectedShape(shape); setSelectedBoxIndex(index); setEditingLabel('left'); }}
                        style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
                      >
                        {editingLabel === 'left' && selectedShape?.id === shape.id && selectedBoxIndex === index ? (
                          <input
                            type="text"
                            value={arrowLabels?.[index]?.left || ''}
                            onChange={(e) => handleArrowLabelChange('left', e.target.value)}
                            onBlur={() => setEditingLabel(null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setEditingLabel(null); }}
                            autoFocus
                            style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                          />
                        ) : (
                          <span>{arrowLabels?.[index]?.left || '→'}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* box */}
                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      backgroundColor: boxColors?.[index] || '#4a90e2',
                      border: '2px solid #357abd',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      position: 'relative',
                      margin: '0 40px',
                    }}
                    onContextMenu={(e) => handleContextMenu(e, shape, index)}
                  >
                    {item}
                  </div>
                  {/* 右箭头（←） */}
                  {arrows?.[index]?.right && (
                    <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                      <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="44" y1="12" x2="4" y2="12" />
                        <polyline points="12 4 4 12 12 20" />
                      </svg>
                      <div 
                        onClick={(e) => { e.stopPropagation(); setSelectedShape(shape); setSelectedBoxIndex(index); setEditingLabel('right'); }}
                        style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
                      >
                        {editingLabel === 'right' && selectedShape?.id === shape.id && selectedBoxIndex === index ? (
                          <input
                            type="text"
                            value={arrowLabels?.[index]?.right || ''}
                            onChange={(e) => handleArrowLabelChange('right', e.target.value)}
                            onBlur={() => setEditingLabel(null)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setEditingLabel(null); }}
                            autoFocus
                            style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                          />
                        ) : (
                          <span>{arrowLabels?.[index]?.right || '←'}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        } else { // sidebar icon
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#4a90e2', border: '2px solid #357abd', borderRadius: '4px', margin: '0 auto' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#4a90e2', border: '2px solid #357abd', borderRadius: '4px', margin: '0 auto' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#4a90e2', border: '2px solid #357abd', borderRadius: '4px', margin: '0 auto' }}></div>
            </div>
          );
        }
      case 'map':
        return (
          <MapShape
            key={shape.id}
            shape={shape}
            selectedShape={selectedShape}
            selectedBoxIndex={selectedBoxIndex}
            editingLabel={editingLabel}
            onShapeMouseDown={handleShapeMouseDown}
            onContextMenu={handleContextMenu}
            onArrowLabelChange={handleArrowLabelChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Sidebar>
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <Button onClick={() => setActiveTab('all')} style={{ background: activeTab === 'all' ? '#357abd' : undefined }}>全部</Button>
          <Button onClick={() => setActiveTab('map')} style={{ background: activeTab === 'map' ? '#ffd54f' : undefined, color: activeTab === 'map' ? '#333' : undefined }}>Map</Button>
          <Button onClick={() => setActiveTab('tree')} style={{ background: activeTab === 'tree' ? '#c8e6c9' : undefined, color: activeTab === 'tree' ? '#333' : undefined }}>Tree</Button>
        </div>
        <h3>Basic Shapes</h3>
        {basicShapes.filter(shape => activeTab === 'all' || shape.type === activeTab).map((shape, index) => (
          <ShapeItem
            key={index}
            type={shape.type}
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
          >
            {renderShape(shape)}
          </ShapeItem>
        ))}
        <div style={{ marginTop: '20px' }}>
          <h3>File Input</h3>
          <FileInput
            type="file"
            accept=".yaml,.yml"
            onChange={handleFileInput}
            ref={fileInputRef}
          />
          <FileInputLabel onClick={() => fileInputRef.current?.click()}>
            加载 YAML 文件
          </FileInputLabel>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h3>Templates</h3>
          <TemplateButton onClick={() => setShowTemplates(!showTemplates)}>
            选择模板
          </TemplateButton>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h3>Group 操作</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>
            按住 Ctrl 键并拖动鼠标来选择图形创建 group
          </p>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h3>帮助</h3>
          <Button onClick={() => setShowGuide(true)}>
            YAML 文件指南
          </Button>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h3>导出</h3>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 14, marginRight: 8 }}>帧间隔(ms):</label>
            <input type="number" min={50} max={5000} step={50} value={gifDelay} onChange={e => setGifDelay(Number(e.target.value))} style={{ width: 80, fontSize: 14, padding: 2 }} />
          </div>
          <Button onClick={exportGif}>导出 GIF</Button>
        </div>
      </Sidebar>
      <Canvas
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        {shapes.map(shape => renderShape(shape))}
        
        {/* 渲染 group 选择框 */}
        {isSelectingGroup && selectionStart && selectionEnd && (
          <GroupContainer
            style={{
              left: Math.min(selectionStart.x, selectionEnd.x),
              top: Math.min(selectionStart.y, selectionEnd.y),
              width: Math.abs(selectionEnd.x - selectionStart.x),
              height: Math.abs(selectionEnd.y - selectionStart.y)
            }}
          />
        )}

        {/* 渲染已创建的 groups */}
        {groups.map(group => (
          <GroupContainer
            key={group.id}
            style={{
              left: group.x,
              top: group.y,
              width: group.width,
              height: group.height,
              borderColor: selectedGroup?.id === group.id ? '#ff4081' : '#4a90e2'
            }}
          />
        ))}

        {showTemplates && (
          <TemplateSelector>
            <h4>选择模板</h4>
            {templates.map((template, index) => (
              <TemplateButton
                key={index}
                onClick={() => applyTemplate(template)}
                style={{ display: 'block', width: '100%', marginBottom: '8px' }}
              >
                {template.name}
              </TemplateButton>
            ))}
          </TemplateSelector>
        )}
        {colorPickerPosition && (
          <ColorPickerContainer
            className="color-picker"
            style={{
              left: colorPickerPosition.x,
              top: colorPickerPosition.y
            }}
          >
            <ChromePicker
              color={selectedShape?.color}
              onChange={handleColorChange}
            />
            {selectedShape?.type === 'array' && selectedBoxIndex !== null ? (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Button onClick={() => handleAddArrow('up')}>
                  {selectedShape.arrows?.[selectedBoxIndex]?.up ? '删除上方箭头' : '添加上方箭头'}
                </Button>
                <Button onClick={() => handleAddArrow('down')}>
                  {selectedShape.arrows?.[selectedBoxIndex]?.down ? '删除下方箭头' : '添加下方箭头'}
                </Button>
              </div>
            ) : selectedShape?.type === 'stack' && selectedBoxIndex !== null ? (
              (() => {
                const idx = selectedShape.stackData ? selectedShape.stackData.length - 1 - selectedBoxIndex : 0;
                return (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Button onClick={() => handleAddArrow('left')}>
                      {selectedShape.arrows?.[idx]?.left ? '删除左箭头' : '添加左箭头'}
                    </Button>
                    <Button onClick={() => handleAddArrow('right')}>
                      {selectedShape.arrows?.[idx]?.right ? '删除右箭头' : '添加右箭头'}
                    </Button>
                  </div>
                );
              })()
            ) : selectedShape?.type === 'map' && selectedBoxIndex !== null ? (
              (() => {
                const mapLen = selectedShape.mapData ? selectedShape.mapData.length : 0;
                const idx = mapLen - 1 - selectedBoxIndex;
                return (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Button onClick={() => handleAddArrow('left')}>
                      {selectedShape.arrows?.[idx]?.left ? '删除左箭头' : '添加左箭头'}
                    </Button>
                    <Button onClick={() => handleAddArrow('right')}>
                      {selectedShape.arrows?.[idx]?.right ? '删除右箭头' : '添加右箭头'}
                    </Button>
                  </div>
                );
              })()
            ) : (
              <div style={{ marginTop: 10 }}>
                <Button onClick={handleCopy}>
                  复制图形
                </Button>
              </div>
            )}
          </ColorPickerContainer>
        )}
        {arrayEditorPosition && (
          <ArrayEditorContainer
            className="array-editor"
            style={{
              left: arrayEditorPosition.x,
              top: arrayEditorPosition.y
            }}
          >
            <h4>Edit Array</h4>
            <p>Enter numbers separated by commas:</p>
            <ArrayInput
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              placeholder="e.g., 1, 2, 3, 4, 5"
            />
            <div>
              <Button onClick={handleArraySubmit}>Apply</Button>
              <Button onClick={() => setArrayEditorPosition(null)}>Cancel</Button>
            </div>
          </ArrayEditorContainer>
        )}
        {stackEditorPosition && (
          <ArrayEditorContainer
            className="stack-editor"
            style={{
              left: stackEditorPosition.x,
              top: stackEditorPosition.y
            }}
          >
            <h4>Edit Stack</h4>
            <p>Enter values separated by commas (bottom → top):</p>
            <ArrayInput
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              placeholder="e.g., 1, 2, 3, 4"
            />
            <div>
              <Button onClick={handleStackSubmit}>Apply</Button>
              <Button onClick={() => setStackEditorPosition(null)}>Cancel</Button>
            </div>
          </ArrayEditorContainer>
        )}
        {mapEditorPosition && (
          <ArrayEditorContainer
            className="map-editor"
            style={{
              left: mapEditorPosition.x,
              top: mapEditorPosition.y
            }}
          >
            <h4>Edit Map</h4>
            <p>Enter key:value pairs separated by commas (e.g., a:1, b:2, c:3):</p>
            <ArrayInput
              value={mapInput}
              onChange={(e) => setMapInput(e.target.value)}
              placeholder="e.g., a:1, b:2, c:3"
            />
            <div>
              <Button onClick={handleMapSubmit}>Apply</Button>
              <Button onClick={() => setMapEditorPosition(null)}>Cancel</Button>
            </div>
          </ArrayEditorContainer>
        )}
      </Canvas>
      {showGuide && (
        <ModalOverlay onClick={() => setShowGuide(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseBtn onClick={() => setShowGuide(false)}>&times;</CloseBtn>
            <EditorGuide />
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ShapeEditor; 