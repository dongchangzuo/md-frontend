# YAML 图形文件编写指南

## 简介
YAML (YAML Ain't Markup Language) 是一种人类可读的数据序列化格式。本指南将帮助您了解如何使用 YAML 来创建和描述图形结构。

## 基本语法

### 1. 缩进
YAML 使用缩进来表示层级关系，通常使用 2 个空格作为缩进单位：
```yaml
graph:
  nodes:
    - id: node1
      label: "节点 1"
    - id: node2
      label: "节点 2"
```

### 2. 节点定义
节点是图形的基本元素，可以包含多个属性：
```yaml
nodes:
  - id: "A"           # 节点唯一标识符
    label: "节点A"     # 显示名称
    type: "circle"    # 节点形状
    color: "#FF0000"  # 节点颜色
    size: 20          # 节点大小
```

### 3. 边（连接）定义
边用于连接节点，表示节点之间的关系：
```yaml
edges:
  - source: "A"       # 起始节点
    target: "B"       # 目标节点
    label: "连接"      # 边的标签
    type: "solid"     # 边的类型（solid, dashed, dotted）
    color: "#000000"  # 边的颜色
```

## 完整示例

以下是一个完整的图形 YAML 示例：

```yaml
graph:
  name: "示例图形"
  nodes:
    - id: "A"
      label: "开始"
      type: "circle"
      color: "#4CAF50"
      size: 30
    
    - id: "B"
      label: "处理"
      type: "rectangle"
      color: "#2196F3"
      size: 25
    
    - id: "C"
      label: "结束"
      type: "circle"
      color: "#F44336"
      size: 30
  
  edges:
    - source: "A"
      target: "B"
      label: "下一步"
      type: "solid"
      color: "#000000"
    
    - source: "B"
      target: "C"
      label: "完成"
      type: "solid"
      color: "#000000"
```

## 常用属性说明

### 节点属性
- `id`: 节点的唯一标识符（必填）
- `label`: 节点显示的名称
- `type`: 节点形状（circle, rectangle, diamond 等）
- `color`: 节点颜色（支持十六进制颜色代码）
- `size`: 节点大小
- `position`: 节点位置（x, y 坐标）

### 边属性
- `source`: 起始节点 ID（必填）
- `target`: 目标节点 ID（必填）
- `label`: 边的标签文本
- `type`: 边的类型（solid, dashed, dotted）
- `color`: 边的颜色
- `weight`: 边的权重
- `arrow`: 箭头样式（forward, backward, both, none）

## 最佳实践

1. **命名规范**
   - 使用有意义的 ID 和标签
   - 保持命名的一致性
   - 避免使用特殊字符

2. **结构组织**
   - 使用清晰的层级结构
   - 保持适当的缩进
   - 相关元素放在一起

3. **可读性**
   - 添加适当的注释
   - 使用空行分隔不同的部分
   - 保持格式的一致性

4. **验证**
   - 确保所有必需的属性都已定义
   - 检查节点 ID 的唯一性
   - 验证边的连接是否有效

## 常见问题

1. **缩进错误**
   - 确保使用空格而不是制表符
   - 保持一致的缩进级别

2. **ID 重复**
   - 每个节点必须有唯一的 ID
   - 检查是否有重复的 ID

3. **无效连接**
   - 确保边的 source 和 target 指向存在的节点
   - 检查节点 ID 的拼写

## 工具推荐

1. **YAML 验证工具**
   - YAML Lint
   - YAML Validator

2. **图形可视化工具**
   - Graphviz
   - Mermaid
   - PlantUML

## 总结

编写图形 YAML 文件需要注意：
- 正确的语法和缩进
- 清晰的节点和边定义
- 合理的属性设置
- 良好的组织结构
- 适当的注释和文档

通过遵循这些指南，您可以创建清晰、可维护的图形 YAML 文件。 