import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

export const Sidebar = styled.div`
  width: 200px;
  background: #fff;
  padding: 20px;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
`;

export const Canvas = styled.div`
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

export const ShapeItem = styled.div`
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

export const DraggableShape = styled.div`
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

export const ColorPickerContainer = styled.div`
  position: absolute;
  z-index: 1000;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

export const ArrayEditorContainer = styled.div`
  position: absolute;
  z-index: 1000;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  min-width: 300px;
`;

export const ArrayInput = styled.textarea`
  width: 100%;
  height: 100px;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

export const Button = styled.button`
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

export const CopyButton = styled.button`
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

export const TemplateButton = styled.button`
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

export const TemplateSelector = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

export const GroupContainer = styled.div`
  position: absolute;
  border: 2px dashed #4a90e2;
  background: rgba(74, 144, 226, 0.05);
  pointer-events: none;
  transition: all 0.2s;
`;

export const FileInput = styled.input`
  display: none;
`;

export const FileInputLabel = styled.label`
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