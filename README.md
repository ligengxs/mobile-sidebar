# mobile-sidebar

DeepSeek Harness Web UI 插件：左侧边栏收起时完全隐藏、动画与右侧栏同构，并在手机布局下变成滑入式抽屉。

A DeepSeek Harness Web UI plugin: the left sidebar collapses to zero width with a glide that matches the right dock, and becomes a slide-in drawer on the mobile layout.

## 功能 / Features

| 桌面端 (≥768px) | 手机端 (<768px) |
|---|---|
| 收起时完全隐藏 56px 图标栏，不占用任何空间 | 收起时同样完全隐藏，不占空间 |
| 展开/收起为与右侧侧边栏同构的轨道滑动动画 | 展开为整屏滑入式覆盖层，**不挤压会话区**（复刻右侧栏的手机表现） |
| 展开宽度保持原有 264–420px 轨道 | 点击会话或新建会话后抽屉自动收起，把屏幕还给对话 |
| 同一时刻只显示一个切换按钮（侧栏品牌行 / 会话头部） | 同一时刻只显示一个切换按钮 |

其他细节 / Details:

- 移除侧边栏品牌区的图标与文字（官方 wordmark 与新会话入口不再残留可点击区域）。
- 手机端打开抽屉后，任何切换主视图的操作（点击会话行、搜索结果行，或用侧边栏的「新会话」按钮 / 工作区行内新建会话）都会自动收起抽屉；文件夹行、行内菜单按钮不会触发。
- 尊重 `prefers-reduced-motion`。

## 安装 / Install

在 DSH 的 Web profile 中安装（需要能访问 GitHub）：

```bash
dsh plugin --profile web add github:ligengxs/mobile-sidebar
```

然后在 Plugin Manager 中启用该 bundle（或在同一界面用 spec `github:ligengxs/mobile-sidebar` 安装，它会同时完成安装与启用）。

也可以克隆仓库后按目录安装：

```bash
git clone https://github.com/ligengxs/mobile-sidebar.git
# Plugin Manager → 从目录安装 → 选择 clone 出来的目录
```

安装后刷新页面（F5）生效。

## 使用 / Usage

- 侧边栏展开时，切换按钮位于侧边栏品牌行最左侧；完全收起后，按钮出现在会话头部（左上角），与侧边栏内按钮位置对齐。
- 手机端：侧边栏为覆盖层，点任一会话即收起，对话占满屏幕。

## 兼容性 / Compatibility

插件依赖官方 AppFrame 发布的 `data-sidebar-collapsed` / `data-rightbar-collapsed` 属性、`sidebar` / `conversation.header.leading` 等槽位，以及侧栏根节点的品牌拖拽行结构。已在 DSH `0.2.1-rc.5` 的 Web UI 上验证；官方结构变动时需要同步调整选择器。

The plugin relies on the shipped AppFrame attributes, the `sidebar` and `conversation.header.leading` slots, and the brand drag row as the structural anchor of the sidebar root. Verified against DSH `0.2.1-rc.5`; selector updates may be needed if the shipped DOM changes.

## 结构 / Layout

```
package.json         bundle 清单（dsh.bundle.patch + dsh.client）
cordis.patch.yml     插入 mobile-sidebar 插件行
index.js             Host 半边（空实现，渲染在客户端）
client.js            Client 模块：CSS、会话头部按钮、空品牌占位、宽度捕获、点会话收起
locale/{en,zh}.json  Plugin Manager 显示的标题与描述
icon.svg             插件图标
```

## 开发 / Development

本地开发时直接用 Plugin Manager 从目录安装本仓库（link 安装），修改 `client.js` 后需要重新安装 bundle 并刷新页面：Host 会缓存模块内容。

During development, install this directory through the Plugin Manager (link install). After editing `client.js`, reinstall the bundle and refresh the page — the Host caches module content.

## License

MIT
