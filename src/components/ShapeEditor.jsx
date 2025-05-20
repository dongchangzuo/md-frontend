import React, { useState, useRef, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import styled from 'styled-components';

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
  background: #fff;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const ShapeItem = styled.div`
  width: 60px;
  height: 60px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
`;

const ColorPickerContainer = styled.div`
  position: absolute;
  z-index: 1000;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const basicShapes = [
  { type: 'rectangle', width: 100, height: 60, color: '#000000' },
  { type: 'square', width: 80, height: 80, color: '#000000' },
  { type: 'triangle', width: 0, height: 0, color: '#000000' },
  { type: 'arrow', width: 100, height: 40, color: '#000000' },
];

const ShapeEditor = () => {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState(null);
  const [draggedShape, setDraggedShape] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleDragStart = (e, shape) => {
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const shape = JSON.parse(e.dataTransfer.getData('shape'));
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setShapes([...shapes, {
      ...shape,
      id: Date.now(),
      x,
      y,
      rotation: 0
    }]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleShapeMouseDown = (e, shape) => {
    e.stopPropagation();
    setSelectedShape(shape);
    setDraggedShape(shape);
    
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (draggedShape) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      setShapes(shapes.map(shape => 
        shape.id === draggedShape.id
          ? { ...shape, x, y }
          : shape
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedShape(null);
  };

  const handleContextMenu = (e, shape) => {
    e.preventDefault();
    setSelectedShape(shape);
    setColorPickerPosition({ x: e.clientX, y: e.clientY });
  };

  const handleColorChange = (color) => {
    if (selectedShape) {
      setShapes(shapes.map(shape => 
        shape.id === selectedShape.id 
          ? { ...shape, color: color.hex }
          : shape
      ));
    }
  };

  const handleClickOutside = (e) => {
    if (colorPickerPosition && !e.target.closest('.color-picker')) {
      setColorPickerPosition(null);
    }
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
  }, [draggedShape, dragOffset, shapes, colorPickerPosition]);

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
              transform: `rotate(${shape.rotation}deg)`
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
              transform: `rotate(${shape.rotation}deg)`
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
              transform: `rotate(${shape.rotation}deg)`
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
              transform: `rotate(${shape.rotation}deg)`
            }}
            onMouseDown={(e) => handleShapeMouseDown(e, shape)}
            onContextMenu={(e) => handleContextMenu(e, shape)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Sidebar>
        <h3>Basic Shapes</h3>
        {basicShapes.map((shape, index) => (
          <ShapeItem
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
          >
            {renderShape(shape)}
          </ShapeItem>
        ))}
      </Sidebar>
      <Canvas
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {shapes.map(shape => renderShape(shape))}
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
          </ColorPickerContainer>
        )}
      </Canvas>
    </Container>
  );
};

export default ShapeEditor; 