import React from 'react';

const CanvasArea = ({ children, theme }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 0, background: theme.canvasBg }}>
    {children}
  </div>
);

export default CanvasArea; 