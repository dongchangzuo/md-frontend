import React from 'react';

// 计算树最大深度
function getMaxDepth(node) {
  if (!node) return 0;
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getMaxDepth));
}

// 递归渲染树节点（锚点定位）
const renderTreeNode = ({ node, path, boxColors, arrows, arrowLabels, selectedShape, selectedBoxIndex, editingLabel, onShapeMouseDown, onContextMenu, onArrowLabelChange, depth = 0, maxDepth = 1 }) => {
  const idx = path.join('-');
  const color = boxColors?.[idx] || '#c8e6c9';
  const nodeArrows = arrows?.[idx] || {};
  const nodeArrowLabels = arrowLabels?.[idx] || {};
  const leftChild = node.children && node.children[0];
  const rightChild = node.children && node.children[1];
  // 斜率严格为±1
  const boxW = 90, boxH = 45;
  const offset = 60;
  // 根节点加背景框
  const wrapStyle = depth === 0 ? {
    backgroundColor: '#f1f8e9',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '16px',
    display: 'inline-block',
    position: 'relative'
  } : {};
  return (
    <div style={wrapStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
        {/* 箭头和 box（box为锚点） */}
        <div style={{ position: 'relative', width: `${boxW}px`, height: `${boxH}px`, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            {/* 左箭头 */}
            {nodeArrows.left && (
              <div style={{ position: 'absolute', left: '-28px', top: '50%', transform: 'translateY(-50%)', zIndex: 3 }}>
                <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="44" y2="12" />
                  <polyline points="36 4 44 12 36 20" />
                </svg>
                <div 
                  onClick={e => { e.stopPropagation(); onShapeMouseDown(e); onArrowLabelChange('left', idx); }}
                  style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
                >
                  {editingLabel === 'left' && selectedBoxIndex === idx ? (
                    <input
                      type="text"
                      value={nodeArrowLabels.left || ''}
                      onChange={e => onArrowLabelChange('left', idx, e.target.value)}
                      onBlur={() => onArrowLabelChange(null)}
                      onKeyDown={e => { if (e.key === 'Enter') onArrowLabelChange(null); }}
                      autoFocus
                      style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                    />
                  ) : (
                    <span>{nodeArrowLabels.left || '→'}</span>
                  )}
                </div>
              </div>
            )}
            {/* box */}
            <div
              style={{
                width: `${boxW}px`,
                height: `${boxH}px`,
                backgroundColor: color,
                border: '2px solid #388e3c',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '500',
                color: '#333',
                cursor: 'pointer',
                position: 'relative',
                minWidth: 0,
                zIndex: 2
              }}
              onContextMenu={e => onContextMenu(e, null, idx)}
            >
              {node.label}
            </div>
            {/* 右箭头 */}
            {nodeArrows.right && (
              <div style={{ position: 'absolute', right: '-28px', top: '50%', transform: 'translateY(-50%)', zIndex: 3 }}>
                <svg width="30" height="16" viewBox="0 0 48 24" fill="none" stroke="#1a73e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="44" y1="12" x2="4" y2="12" />
                  <polyline points="12 4 4 12 12 20" />
                </svg>
                <div 
                  onClick={e => { e.stopPropagation(); onShapeMouseDown(e); onArrowLabelChange('right', idx); }}
                  style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '500', cursor: 'pointer', marginTop: 2 }}
                >
                  {editingLabel === 'right' && selectedBoxIndex === idx ? (
                    <input
                      type="text"
                      value={nodeArrowLabels.right || ''}
                      onChange={e => onArrowLabelChange('right', idx, e.target.value)}
                      onBlur={() => onArrowLabelChange(null)}
                      onKeyDown={e => { if (e.key === 'Enter') onArrowLabelChange(null); }}
                      autoFocus
                      style={{ width: '60px', border: 'none', outline: 'none', fontSize: '12px', backgroundColor: 'transparent', color: '#1a73e8' }}
                    />
                  ) : (
                    <span>{nodeArrowLabels.right || '←'}</span>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* 子节点连线和递归 */}
          {(leftChild || rightChild) && (
            <>
              {/* 连线 */}
              <svg style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} width={boxW} height={offset + boxH}>
                {/* 左下斜线 */}
                {leftChild && (
                  <line x1={boxW/2} y1={boxH} x2={boxW/2 - offset} y2={boxH + offset} stroke="#388e3c" strokeWidth="2" />
                )}
                {/* 右下斜线 */}
                {rightChild && (
                  <line x1={boxW/2} y1={boxH} x2={boxW/2 + offset} y2={boxH + offset} stroke="#388e3c" strokeWidth="2" />
                )}
              </svg>
              {/* 左子节点 */}
              {leftChild && (
                <div style={{ position: 'absolute', left: `${boxW/2 - offset - boxW/2}px`, top: boxH + offset }}>
                  {renderTreeNode({
                    node: leftChild,
                    path: [...path, 0],
                    boxColors,
                    arrows,
                    arrowLabels,
                    selectedShape,
                    selectedBoxIndex,
                    editingLabel,
                    onShapeMouseDown,
                    onContextMenu,
                    onArrowLabelChange,
                    depth: depth + 1,
                    maxDepth
                  })}
                </div>
              )}
              {/* 右子节点 */}
              {rightChild && (
                <div style={{ position: 'absolute', left: `${boxW/2 + offset - boxW/2}px`, top: boxH + offset }}>
                  {renderTreeNode({
                    node: rightChild,
                    path: [...path, 1],
                    boxColors,
                    arrows,
                    arrowLabels,
                    selectedShape,
                    selectedBoxIndex,
                    editingLabel,
                    onShapeMouseDown,
                    onContextMenu,
                    onArrowLabelChange,
                    depth: depth + 1,
                    maxDepth
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TreeShape = ({
  shape,
  selectedShape,
  selectedBoxIndex,
  editingLabel,
  onShapeMouseDown,
  onContextMenu,
  onArrowLabelChange
}) => {
  const treeData = shape.treeData || [];
  const boxColors = shape.boxColors || {};
  const arrows = shape.arrows || {};
  const arrowLabels = shape.arrowLabels || {};
  // 计算最大深度
  const maxDepth = treeData.length > 0 ? getMaxDepth(treeData[0]) : 1;

  return (
    <div
      key={shape.id}
      style={{
        position: 'absolute',
        left: shape.x,
        top: shape.y,
        transform: `rotate(${shape.rotation}deg)`,
        cursor: 'move'
      }}
      onMouseDown={e => onShapeMouseDown(e, shape)}
      onContextMenu={e => onContextMenu(e, shape)}
    >
      {treeData.map((node, i) => renderTreeNode({
        node,
        path: [i],
        boxColors,
        arrows,
        arrowLabels,
        selectedShape,
        selectedBoxIndex,
        editingLabel,
        onShapeMouseDown: (e) => onShapeMouseDown(e, shape, [i].join('-')),
        onContextMenu: (e, _shape, idx) => onContextMenu(e, shape, idx),
        onArrowLabelChange: (pos, idx, val) => onArrowLabelChange(pos, idx, val),
        depth: 0,
        maxDepth
      }))}
    </div>
  );
};

export default TreeShape; 