import React from 'react';

const StackShape = ({
  shape,
  selectedShape,
  selectedBoxIndex,
  editingLabel,
  onShapeMouseDown,
  onContextMenu,
  onArrowLabelChange
}) => {
  // reverse stackData, boxColors, arrows, arrowLabels for visual order
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
      onMouseDown={(e) => onShapeMouseDown(e, shape)}
      onContextMenu={(e) => onContextMenu(e, shape)}
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
                onClick={(e) => { e.stopPropagation(); onShapeMouseDown(e, shape); onArrowLabelChange('left', index); }}
                style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
              >
                {editingLabel === 'left' && selectedShape?.id === shape.id && selectedBoxIndex === index ? (
                  <input
                    type="text"
                    value={arrowLabels?.[index]?.left || ''}
                    onChange={(e) => onArrowLabelChange('left', e.target.value)}
                    onBlur={() => onArrowLabelChange(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onArrowLabelChange(null); }}
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
            onContextMenu={(e) => onContextMenu(e, shape, index)}
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
                onClick={(e) => { e.stopPropagation(); onShapeMouseDown(e, shape); onArrowLabelChange('right', index); }}
                style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
              >
                {editingLabel === 'right' && selectedShape?.id === shape.id && selectedBoxIndex === index ? (
                  <input
                    type="text"
                    value={arrowLabels?.[index]?.right || ''}
                    onChange={(e) => onArrowLabelChange('right', e.target.value)}
                    onBlur={() => onArrowLabelChange(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onArrowLabelChange(null); }}
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
};

export default StackShape; 