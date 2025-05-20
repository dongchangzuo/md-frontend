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

const basicShapes = [
  { type: 'rectangle', width: 100, height: 60, color: '#000000' },
  { type: 'square', width: 80, height: 80, color: '#000000' },
  { type: 'triangle', width: 0, height: 0, color: '#000000' },
  { type: 'arrow', width: 100, height: 40, color: '#000000' },
  { type: 'array', width: 200, height: 60, color: '#4a90e2' },
];

const ShapeEditor = () => {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState(null);
  const [arrayEditorPosition, setArrayEditorPosition] = useState(null);
  const [arrayInput, setArrayInput] = useState('');
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
      rotation: 0,
      arrayData: shape.type === 'array' ? [] : undefined
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

  const handleContextMenu = (e, shape, boxIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedShape(shape);
    setSelectedBoxIndex(boxIndex);
    
    if (shape.type === 'array') {
      if (boxIndex !== null) {
        setColorPickerPosition({ x: e.clientX, y: e.clientY });
        setArrayEditorPosition(null);
      } else {
        setArrayEditorPosition({ x: e.clientX, y: e.clientY });
        setColorPickerPosition(null);
        setArrayInput(shape.arrayData ? shape.arrayData.join(', ') : '');
      }
    } else {
      setColorPickerPosition({ x: e.clientX, y: e.clientY });
      setArrayEditorPosition(null);
    }
  };

  const handleColorChange = (color) => {
    if (selectedShape) {
      if (selectedShape.type === 'array' && selectedBoxIndex !== null) {
        // Update color for specific box in array
        setShapes(shapes.map(shape => {
          if (shape.id === selectedShape.id) {
            const newBoxColors = [...(shape.boxColors || [])];
            newBoxColors[selectedBoxIndex] = color.hex;
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

  const handleClickOutside = (e) => {
    if (colorPickerPosition && !e.target.closest('.color-picker')) {
      setColorPickerPosition(null);
      setSelectedBoxIndex(null);
    }
    if (arrayEditorPosition && !e.target.closest('.array-editor')) {
      setArrayEditorPosition(null);
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
  }, [draggedShape, dragOffset, shapes, colorPickerPosition, arrayEditorPosition]);

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
                backgroundColor: '#e8f4ff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(74, 144, 226, 0.2)'
              }}
              onMouseDown={(e) => handleShapeMouseDown(e, shape)}
              onContextMenu={(e) => handleContextMenu(e, shape)}
            >
              {shape.arrayData && shape.arrayData.map((item, index) => (
                <div
                  key={index}
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
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer'
                  }}
                  onContextMenu={(e) => handleContextMenu(e, shape, index)}
                >
                  {item}
                </div>
              ))}
            </div>
          );
        } else { // If it's the icon in sidebar
          return (
            <>
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
            </>
          );
        }
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
            type={shape.type}
            draggable
            onDragStart={(e) => handleDragStart(e, shape)}
          >
            {shape.type === 'array' ? (
              renderShape(shape)
            ) : (
              renderShape(shape)
            )}
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
      </Canvas>
    </Container>
  );
};

export default ShapeEditor; 