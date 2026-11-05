# 寄语 Couriers 官网

Minecraft 地图创作团队「寄语 Couriers」的静态官网。设计概念：**每一张地图，都是一封寄给玩家的信**。整站用邮政意象串起来：邮票、邮戳、物流单、邮差证、信箱，全部按像素风格绘制，配色取自 Logo。

## 本地运行

安装 Node.js 18 或更新版本后，在仓库根目录执行：

```sh
node server.mjs
```

打开 http://localhost:4173 。无需安装依赖或执行构建。也可以使用 `npm run dev`。

## 页面结构

| 区块 | 锚点 | 内容 |
| --- | --- | --- |
| 主视觉 | `#home` | 《沉默乐章：错位音》海报、贴纸、滚动视差（保留原设计） |
| 01 寄语 | `#intro` | 团队一句话 + 搭建 / 机制 / 叙事 / 声音四张卡片 |
| 02 本期来信 | `#works` | 主推作品：明信片、物流单、投递进度、可演奏的音符盒（含「错位」开关） |
| 03 作品档案 | `#archive` | 邮票册：每部作品一枚带齿孔和邮戳的邮票 |
| 04 关于我们 | `#about` | 一封从信封里升起的信 |
| 05 邮差名册 | `#team` | 成员「邮差证」，8×8 像素头像 |
| 06 招募邮差 | `#join` | 招募方向车票 + QQ 群入口 |
| 页脚 | | 链接、Mojang 免责声明、可点击的像素信箱 |

## 修改内容

- **作品、成员、招募方向、物流单、投递进度、信箱随机语**：都在 `dist/app.js` 顶部的数据数组里。
  - 带 `sample: true` 的条目是示例数据，页面上会显示「示例」标记；换成真实内容后删掉该字段即可。
  - 作品有封面图就写 `image`，没有就写 `scene`，会生成一张像素风景占位图。
  - 成员头像 `face` 是 8 行 × 8 字符的像素图，字母对应 `colors` 里的颜色。
- **团队介绍、信件、主推作品简介**：在 `dist/index.html` 里，均为文案草稿。
- **配色**：`dist/styles.css` 顶部的 `:root` 变量。

## 文件结构

- `dist/index.html`：页面结构与文案。
- `dist/styles.css`：配色、像素边框、各区块与响应式样式。
- `dist/app.js`：内容数据、像素图绘制、滚动效果、导航、音符盒（Web Audio 合成，无音频文件）和信箱。
- `dist/assets/`：页面实际引用的图片、字体与图标，以及来源说明。
- `server.mjs`：仅监听本机的静态预览服务器。
- `asset-sources.json`：素材来源记录。

`dist` 是直接维护的网页源文件目录，不是可以删除的自动生成目录。修改后刷新浏览器即可查看。

## 字体

标题、标签与按钮使用 [缝合像素字体 Fusion Pixel](https://github.com/TakWolf/fusion-pixel-font)（12px 比例 · 简体中文，SIL OFL 1.1），已裁剪为 ASCII + GB2312 全部汉字（约 190 KB）。像素字体只在 12 的整数倍字号（12/24/36/48/60/72）下使用，以保持笔画清晰。正文使用系统中文字体。

## 检查

```sh
node --check dist/app.js
node --check server.mjs
```

## 素材与授权

Couriers 标志、《沉默乐章：错位音》主视觉与留声机像素图为项目自有素材。Minecraft 唱片材质属于 Mojang；页脚已包含「非官方 Minecraft 产品」声明。图标来自 Remix Icon，许可见 `dist/assets/icons/LICENSE-RemixIcon.txt`。字体许可见 `dist/assets/fonts/FusionPixel/OFL.txt`。来源记录不等同于许可授权。

默认仅本地开发，上传或部署需要用户明确授权。
