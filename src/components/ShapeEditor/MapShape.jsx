import React from 'react';

const MAX_PER_COL = 8;

const MapShape = ({
  shape,
  selectedShape,
  selectedBoxIndex,
  editingLabel,
  onShapeMouseDown,
  onContextMenu,
  onArrowLabelChange
}) => {
  // reverse mapData, boxColors, arrows, arrowLabels for visual order
  const mapData = (shape.mapData || []).slice().reverse();
  const boxColors = (shape.boxColors || []).slice().reverse();
  const arrows = shape.arrows ? Object.values(shape.arrows).length ? Object.assign([], ...Object.entries(shape.arrows).map(([i, v]) => ({[mapData.length-1-i]: v}))) : [] : [];
  const arrowLabels = shape.arrowLabels ? Object.values(shape.arrowLabels).length ? Object.assign([], ...Object.entries(shape.arrowLabels).map(([i, v]) => ({[mapData.length-1-i]: v}))) : [] : [];

  // grid 列数
  const colCount = Math.ceil(mapData.length / MAX_PER_COL);
  const rowCount = Math.min(mapData.length, MAX_PER_COL);

  return (
    <div
      key={shape.id}
      style={{
        position: 'absolute',
        left: shape.x,
        top: shape.y,
        transform: `rotate(${shape.rotation}deg)`,
        display: 'grid',
        gridTemplateColumns: `repeat(${colCount}, auto)`,
        gridAutoRows: 'min-content',
        gap: '12px 56px',
        padding: '12px',
        cursor: 'move',
        backgroundColor: '#fffde7',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      onMouseDown={(e) => onShapeMouseDown(e, shape)}
      onContextMenu={(e) => onContextMenu(e, shape)}
    >
      {mapData.map((item, idx) => (
        <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          {/* 左箭头（→） */}
          {arrows?.[idx]?.left && (
            <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
              <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="44" y2="12" />
                <polyline points="36 4 44 12 36 20" />
              </svg>
              <div 
                onClick={(e) => { e.stopPropagation(); onShapeMouseDown(e, shape); onArrowLabelChange('left', idx); }}
                style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
              >
                {editingLabel === 'left' && selectedShape?.id === shape.id && selectedBoxIndex === idx ? (
                  <input
                    type="text"
                    value={arrowLabels?.[idx]?.left || ''}
                    onChange={(e) => onArrowLabelChange('left', e.target.value)}
                    onBlur={() => onArrowLabelChange(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onArrowLabelChange(null); }}
                    autoFocus
                    style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                  />
                ) : (
                  <span>{arrowLabels?.[idx]?.left || '→'}</span>
                )}
              </div>
            </div>
          )}
          {/* box */}
          <div
            style={{
              width: '90px',
              height: '45px',
              backgroundColor: boxColors?.[idx] || '#ffd54f',
              border: '2px solid #ffb300',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              position: 'relative',
              minWidth: 0,
            }}
            onContextMenu={(e) => onContextMenu(e, shape, idx)}
          >
            {item.key}:{item.value}
          </div>
          {/* 右箭头（←） */}
          {arrows?.[idx]?.right && (
            <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
              <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="44" y1="12" x2="4" y2="12" />
                <polyline points="12 4 4 12 12 20" />
              </svg>
              <div 
                onClick={(e) => { e.stopPropagation(); onShapeMouseDown(e, shape); onArrowLabelChange('right', idx); }}
                style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
              >
                {editingLabel === 'right' && selectedShape?.id === shape.id && selectedBoxIndex === idx ? (
                  <input
                    type="text"
                    value={arrowLabels?.[idx]?.right || ''}
                    onChange={(e) => onArrowLabelChange('right', e.target.value)}
                    onBlur={() => onArrowLabelChange(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onArrowLabelChange(null); }}
                    autoFocus
                    style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                  />
                ) : (
                  <span>{arrowLabels?.[idx]?.right || '←'}</span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MapShape; 