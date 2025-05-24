import React from 'react';

const ArrayShape = ({
  shape,
  selectedShape,
  selectedBoxIndex,
  editingLabel,
  onShapeMouseDown,
  onContextMenu,
  onArrowLabelChange
}) => {
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
      onMouseDown={(e) => onShapeMouseDown(e, shape)}
      onContextMenu={(e) => onContextMenu(e, shape)}
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
                  onContextMenu(e, shape, index);
                  onArrowLabelChange('up', index);
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
                    onChange={(e) => onArrowLabelChange('up', e.target.value)}
                    onBlur={() => onArrowLabelChange(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onArrowLabelChange(null);
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
            onContextMenu={(e) => onContextMenu(e, shape, index)}
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
                  onContextMenu(e, shape, index);
                  onArrowLabelChange('down', index);
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
                    onChange={(e) => onArrowLabelChange('down', e.target.value)}
                    onBlur={() => onArrowLabelChange(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onArrowLabelChange(null);
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
};

export default ArrayShape; 