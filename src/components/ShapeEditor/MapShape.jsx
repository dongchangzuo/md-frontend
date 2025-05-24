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

  // 分列处理
  const columns = [];
  for (let i = 0; i < mapData.length; i += MAX_PER_COL) {
    columns.push(mapData.slice(i, i + MAX_PER_COL));
  }

  return (
    <div
      key={shape.id}
      style={{
        position: 'absolute',
        left: shape.x,
        top: shape.y,
        transform: `rotate(${shape.rotation}deg)`,
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        padding: '12px',
        cursor: 'move',
        backgroundColor: '#fffde7',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      onMouseDown={(e) => onShapeMouseDown(e, shape)}
      onContextMenu={(e) => onContextMenu(e, shape)}
    >
      {columns.map((col, colIdx) => (
        <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {col.map((item, index) => {
            const realIndex = colIdx * MAX_PER_COL + index;
            return (
              <div key={realIndex} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {/* 左箭头（→） */}
                {arrows?.[realIndex]?.left && (
                  <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                    <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="12" x2="44" y2="12" />
                      <polyline points="36 4 44 12 36 20" />
                    </svg>
                    <div 
                      onClick={(e) => { e.stopPropagation(); onShapeMouseDown(e, shape); onArrowLabelChange('left', realIndex); }}
                      style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
                    >
                      {editingLabel === 'left' && selectedShape?.id === shape.id && selectedBoxIndex === realIndex ? (
                        <input
                          type="text"
                          value={arrowLabels?.[realIndex]?.left || ''}
                          onChange={(e) => onArrowLabelChange('left', e.target.value)}
                          onBlur={() => onArrowLabelChange(null)}
                          onKeyDown={(e) => { if (e.key === 'Enter') onArrowLabelChange(null); }}
                          autoFocus
                          style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                        />
                      ) : (
                        <span>{arrowLabels?.[realIndex]?.left || '→'}</span>
                      )}
                    </div>
                  </div>
                )}
                {/* box */}
                <div
                  style={{
                    width: '90px',
                    height: '45px',
                    backgroundColor: boxColors?.[realIndex] || '#ffd54f',
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
                    margin: '0 40px',
                  }}
                  onContextMenu={(e) => onContextMenu(e, shape, realIndex)}
                >
                  {item.key}:{item.value}
                </div>
                {/* 右箭头（←） */}
                {arrows?.[realIndex]?.right && (
                  <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                    <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="44" y1="12" x2="4" y2="12" />
                      <polyline points="12 4 4 12 12 20" />
                    </svg>
                    <div 
                      onClick={(e) => { e.stopPropagation(); onShapeMouseDown(e, shape); onArrowLabelChange('right', realIndex); }}
                      style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
                    >
                      {editingLabel === 'right' && selectedShape?.id === shape.id && selectedBoxIndex === realIndex ? (
                        <input
                          type="text"
                          value={arrowLabels?.[realIndex]?.right || ''}
                          onChange={(e) => onArrowLabelChange('right', e.target.value)}
                          onBlur={() => onArrowLabelChange(null)}
                          onKeyDown={(e) => { if (e.key === 'Enter') onArrowLabelChange(null); }}
                          autoFocus
                          style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                        />
                      ) : (
                        <span>{arrowLabels?.[realIndex]?.right || '←'}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MapShape; 