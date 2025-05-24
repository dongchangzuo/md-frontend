import React from 'react';

/**
 * SharpEdit YAML 文件编写与上传指南
 *
 * 本指南将帮助您了解如何编写符合 SharpEdit 规范的 YAML 文件，并通过上传该文件在编辑器中生成图形。
 */

const EditorGuide = () => (
  <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', fontSize: 16, lineHeight: 1.8 }}>
    <h1>SharpEdit 图形 YAML 文件指南</h1>
    <h2>1. 文件结构说明</h2>
    <p>YAML 文件需包含 <code>title</code> 和 <code>images</code> 两个顶级字段：</p>
    <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6 }}>
{`title: 示例标题

images:
  - image:
      type: array
      arrayData:
        - value: 1
          color: "#000000"
          arrow: up
        - value: 2
          color: "#ff0000"
          arrow: down
`}
    </pre>
    <h2>2. 字段解释</h2>
    <ul>
      <li><b>title</b>：图形的标题（字符串，可选）。</li>
      <li><b>images</b>：图形数组，每个 <code>image</code> 描述一个图形对象。</li>
      <li><b>image.type</b>：图形类型，目前支持 <code>array</code>。</li>
      <li><b>image.arrayData</b>：数组元素，每个元素为一个 box。</li>
      <li><b>arrayData.value</b>：box 内显示的内容（字符串或数字）。</li>
      <li><b>arrayData.color</b>：box 的颜色（十六进制颜色字符串）。</li>
      <li><b>arrayData.arrow</b>：箭头方向，可选 <code>up</code>、<code>down</code> 或 <code>none</code>。</li>
    </ul>
    <h2>3. 完整示例</h2>
    <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6 }}>
{`title: Two sum

images:
  - image:
      type: array
      arrayData:
        - value: 1
          color: "#000000"
          arrow: up
        - value: 2
          color: "#000000"
          arrow: up
        - value: 3
          color: "#000000"
          arrow: down
  - image:
      type: array
      arrayData:
        - value: 3
          color: "#000000"
          arrow: down
        - value: 444
          color: "#000000"
          arrow: up
        - value: 3
          color: "#000000"
          arrow: up
`}
    </pre>
    <h2>4. 上传步骤</h2>
    <ol>
      <li>在本地编辑好 YAML 文件，保存为 <code>.yaml</code> 或 <code>.yml</code> 格式。</li>
      <li>在 SharpEdit 编辑器左侧点击"加载 YAML 文件"按钮。</li>
      <li>选择您的 YAML 文件，上传后图形会自动生成在画布上。</li>
    </ol>
    <h2>5. 注意事项</h2>
    <ul>
      <li>缩进必须使用空格，建议每级 2 个空格。</li>
      <li>颜色需为合法的十六进制字符串（如 <code>#000000</code>）。</li>
      <li>箭头方向如无需求可省略或填 <code>none</code>。</li>
      <li>如格式错误，编辑器会提示，请检查 YAML 文件结构。</li>
    </ul>
    <h2>6. 参考模板</h2>
    <pre style={{ background: '#f8f8f8', padding: 12, borderRadius: 6 }}>
{`title: 算法可视化

images:
  - image:
      type: array
      arrayData:
        - value: A
          color: "#1a73e8"
          arrow: up
        - value: B
          color: "#e91e63"
          arrow: down
        - value: C
          color: "#4caf50"
          arrow: none
`}
    </pre>
    <p>如需更多帮助，请联系开发团队或查阅项目文档。</p>
  </div>
);

export default EditorGuide; 