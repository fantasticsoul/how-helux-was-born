## How helux was born

本仓库用于辅助用户做`helux`源码调试，帮助用户理解整个运行流程

### 运行项目

```bash
npm run start
```

### 包结构

```
.
└── src/libs
    ├── helux                 # react 适配层
    ├── helux-core            # helux状态管理核心逻辑包
    ├── helux-plugin-devtool  # 调试工具包（需安装浏览器的redux插件）
    └── limu                  # limu不可变数据js库核心逻辑包
```