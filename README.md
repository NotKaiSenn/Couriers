# Couriers — Minecraft 建筑与地图创作团队官网

基于 **Vite + React 19 + TypeScript + Tailwind CSS v4** 构建的 Minecraft 团队门户官网，视觉风格致敬 **CubeCraft Forums（XenForo / UI.X 门户首页）**。

## 特色功能

- **CubeCraft 经典门户顶栏**：全宽 3D Minecraft 渲染横幅 + 左侧一键复制展示服 IP 胶囊（含在线人数脉冲状态）+ 中央立体体素 Logo + 右侧社区群组入口 + 吸顶导航栏。
- **双栏论坛门户首页**：左侧动态信息流（支持按「作品发布 / 开发日志 / 团队公告 / 幕后教程」筛选、点赞互动与点击阅读完整帖文及评论回复），右侧高密度功能侧边栏（展示服状态、冬季招募进度、在线核心成员、热门精选帖文、官方阵地）。
- **多视图完整官网**：内置「首页动态」、「作品画廊（风格筛选）」、「团队成员（职级分组 + 像素风 MC 头像）」、「招募申请（实时像素头像预览与提交回执）」。
- **明亮 / 暗夜一键切换**：默认呈现 CubeCraft 标志性的明亮天蓝与纯白卡片质感，支持右上角无缝切换深海暗夜模式，并记住用户偏好。
- **全局快捷搜索**：支持 `⌘K` / `Ctrl+K` 检索全站帖文、地图作品与成员。

## 快速开始

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```

## 自定义团队内容

所有示例数据集中在 [`src/data/mockData.ts`](src/data/mockData.ts)，你可以直接修改：

- `SERVER_INFO`：展示服 IP、游戏版本、在线人数与 QQ 群号
- `TEAM_MEMBERS`：成员昵称、Minecraft ID、职级徽章（`OWNER` / `ADMIN` / `ARCHITECT` / `TERRAFORMER` / `ORGANIC` / `RENDERER`）
- `PORTAL_POSTS`：首页发布帖文、开发日志、公告与教程内容
- `PORTFOLIO_PROJECTS`：作品画廊地图项目与封面图（图片位于 `public/images/`）
- `RECRUITMENT_ROLES`：开放招募的岗位与状态（`OPEN` / `LIMITED` / `CLOSED`）
