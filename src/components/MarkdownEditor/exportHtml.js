import { marked } from 'marked';
import emoji from 'emoji-toolkit';

export function handleExportHtml(content, currentFile, setShowExportSuccess) {
  try {
    // 使用 marked 将 markdown 转换为 HTML，并处理 emoji
    const htmlContent = marked(emoji.toImage(content));

    // 创建完整的 HTML 文档，使用内联样式
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentFile ? currentFile.name : 'Markdown Export'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  <div style="font-size: 16px; line-height: 1.75;">
    ${htmlContent.split('\n').map(line => {
      // 处理标题
      if (line.startsWith('<h1')) {
        return line.replace('<h1', '<h1 style="font-size: 2em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; border-bottom: 2px solid #dfe2e5; padding-bottom: 0.2em;"');
      }
      if (line.startsWith('<h2')) {
        return line.replace('<h2', '<h2 style="font-size: 1.5em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; border-bottom: 1px solid #dfe2e5; padding-bottom: 0.15em;"');
      }
      if (line.startsWith('<h3')) {
        return line.replace('<h3', '<h3 style="font-size: 1.25em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25;"');
      }
      // 处理段落
      if (line.startsWith('<p')) {
        return line.replace('<p', '<p style="margin-bottom: 16px;"');
      }
      // 处理代码块
      if (line.startsWith('<pre')) {
        return line.replace('<pre', '<pre style="padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px;"');
      }
      if (line.includes('<code') && !line.includes('<pre')) {
        return line.replace('<code', '<code style="font-family: \'SFMono-Regular\', Consolas, \'Liberation Mono\', Menlo, monospace; padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px;"');
      }
      // 处理引用块
      if (line.startsWith('<blockquote')) {
        return line.replace('<blockquote', '<blockquote style="padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 0 0 16px 0;"');
      }
      // 处理表格
      if (line.startsWith('<table')) {
        return line.replace('<table', '<table style="border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; width: 100%;"');
      }
      if (line.includes('<th') || line.includes('<td')) {
        return line.replace(/<(th|td)/g, '<$1 style="padding: 6px 13px; border: 1px solid #dfe2e5;"');
      }
      if (line.includes('<tr')) {
        return line.replace('<tr', '<tr style="background-color: #fff; border-top: 1px solid #c6cbd1;"');
      }
      // 处理图片
      if (line.includes('<img')) {
        return line.replace('<img', '<img style="max-width: 100%; box-sizing: border-box;"');
      }
      // 处理链接
      if (line.includes('<a')) {
        return line.replace('<a', '<a style="color: #0366d6; text-decoration: none;"');
      }
      // 处理水平线
      if (line.startsWith('<hr')) {
        return line.replace('<hr', '<hr style="border: none; border-top: 1.5px solid #dfe2e5; margin: 2em 0;"');
      }
      // 处理列表
      if (line.startsWith('<ul') || line.startsWith('<ol')) {
        return line.replace(/<(ul|ol)/g, '<$1 style="margin: 1em 0 1em 2em;"');
      }
      if (line.startsWith('<li')) {
        return line.replace('<li', '<li style="margin: 0.3em 0;"');
      }
      return line;
    }).join('\n')}
  </div>
</body>
</html>`;

    // 复制到剪贴板
    navigator.clipboard.writeText(fullHtml).then(() => {
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 2000);
    });
  } catch (error) {
    console.error('Export failed:', error);
  }
} 