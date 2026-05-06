# 408考研知识库

面向408计算机考研学生的在线知识库网站，完整收录考研大纲全部知识点，标注近10年高频考点。

## 在线访问

**https://xqian-a.github.io/408-Notes/**

## 内容覆盖

| 科目 | 分值占比 | 章节数 |
|------|---------|--------|
| 数据结构 | ~45分 | 8章 |
| 计算机组成原理 | ~45分 | 7章 |
| 操作系统 | ~35分 | 5章 |
| 计算机网络 | ~25分 | 6章 |

## 功能特性

- **全文搜索** — 支持中文关键词搜索，按科目、章节筛选
- **三级导航** — 科目 → 章节 → 小节，左侧可折叠导航树
- **高频考点标注** — 黄色徽章标注近10年真题高频考点
- **暗色模式** — 一键切换深色/浅色主题
- **响应式设计** — 完美适配桌面、平板、手机
- **目录跳转** — 右侧目录栏，滚动自动高亮
- **快捷键** — `Ctrl+K` 快速打开搜索

## 技术栈

- 纯静态网站，无需构建工具
- HTML + CSS + JavaScript
- FlexSearch（全文搜索，支持中文分词）
- Marked.js（Markdown 渲染）
- Hash-based SPA 路由
- CSS Grid + Flexbox 响应式布局

## 本地运行

```bash
cd 408-Notes
python -m http.server 8080
```

然后打开 http://localhost:8080

## 项目结构

```
408-Notes/
├── index.html                  # 入口页面
├── css/                        # 样式文件
│   ├── variables.css           # CSS 变量
│   ├── reset.css               # 样式重置
│   ├── layout.css              # 布局
│   ├── components.css          # 组件
│   ├── content.css             # 内容排版
│   ├── highlight.css           # 考点高亮
│   └── responsive.css          # 响应式
├── js/                         # 脚本文件
│   ├── app.js                  # 入口
│   ├── router.js               # 路由
│   ├── navigation.js           # 导航
│   ├── search.js               # 搜索
│   ├── toc.js                  # 目录
│   ├── content-renderer.js     # 内容渲染
│   ├── utils.js                # 工具函数
│   └── lib/                    # 第三方库
│       ├── flexsearch.min.js
│       └── marked.min.js
└── data/                       # 知识点数据
    ├── subjects.json           # 科目注册表
    ├── data-structures/        # 数据结构（8章）
    ├── computer-organization/  # 计算机组成原理（7章）
    ├── operating-systems/      # 操作系统（5章）
    └── computer-networks/      # 计算机网络（6章）
```

## 部署

本项目可直接部署到 GitHub Pages：

1. Fork 或 clone 本仓库
2. 在 GitHub 仓库 Settings → Pages 中启用
3. Source 选择 main 分支

## License

MIT
