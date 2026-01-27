# 在线商城 (Online Mall)

一个现代化的在线商城web应用，使用Vue3+Vite技术栈开发，面向年轻用户群体，提供充满活力的购物体验。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **样式方案**: SCSS + CSS变量
- **图标库**: Element Plus Icons
- **测试框架**: Vitest + @vue/test-utils
- **属性测试**: @fast-check/vitest

## 开发环境设置

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm run test
```

### 运行测试（监听模式）
```bash
npm run test:watch
```

### 生成测试覆盖率报告
```bash
npm run test:coverage
```

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   └── product/        # 商品相关组件
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Category.vue    # 分类页
│   ├── Product.vue     # 商品详情页
│   └── Cart.vue        # 购物车页
├── stores/             # Pinia状态管理
│   ├── cart.js         # 购物车状态
│   ├── product.js      # 商品状态
│   └── user.js         # 用户状态
├── router/             # 路由配置
├── assets/             # 静态资源
├── styles/             # 样式文件
└── utils/              # 工具函数
```

## 开发指南

本项目采用规范化的开发流程，包括：

- 基于需求的设计文档
- 属性驱动的测试策略
- 增量式的任务实现

详细的开发任务请参考 `.kiro/specs/online-mall/tasks.md` 文件。

## 特性

- 🎨 年轻活力的视觉设计
- 📱 响应式布局，支持多设备
- 🛒 完整的购物车功能
- 🔍 商品搜索和分类筛选
- ⚡ 基于Vite的快速开发体验
- 🧪 完善的测试覆盖
- 📦 组件化的架构设计
