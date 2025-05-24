import React from 'react';
import ShapeItem from './ShapeItem';

const Sidebar = ({ basicShapes, renderShape, t, handleDragStart, theme }) => (
  <div style={{ width: 200, background: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, height: '100vh', padding: 20 }}>
    <div style={{
      fontSize: 20,
      fontWeight: 700,
      padding: '8px 0 8px 8px',
      borderRadius: '8px',
      marginBottom: 8,
      borderBottom: `2px solid ${theme.accent}`,
      letterSpacing: 2
    }}>
      <span style={{
        backgroundImage: theme.gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
      }}>{t.components}</span>
    </div>
    {basicShapes.map((shape, index) => (
      <ShapeItem
        key={index}
        type={shape.type}
        draggable
        onDragStart={e => handleDragStart(e, shape)}
      >
        {renderShape(shape)}
      </ShapeItem>
    ))}
  </div>
);

export default Sidebar; 