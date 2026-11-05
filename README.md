# Couriers 网站

Couriers / 寄语的静态网站，包含《沉默乐章：错位音》主视觉、像素导航与贴纸、Bilibili / QQ 入口及预告片链接。

## 本地运行

安装 Node.js 18 或更新版本后，在仓库根目录执行：

```sh
node server.mjs
```

打开 http://localhost:4173 。无需安装依赖或执行构建。也可以使用 `npm run dev`。

## 文件结构

- `dist/index.html`：页面结构、文案及链接。
- `dist/styles.css`：配色、布局、像素边框及响应式样式。
- `dist/app.js`：滚动效果、导航、特色轮播、人物切换和本地 Pixball 交互。
- `dist/assets/`：当前页面实际引用的图片、字体与图标，以及相关来源说明。
- `server.mjs`：仅监听本机的静态预览服务器。
- `asset-sources.json`：保留素材的来源记录。

`dist` 是直接维护的网页源文件目录，不是可以删除的自动生成目录。修改后刷新浏览器即可查看。

## 检查

```sh
node --check dist/app.js
node --check server.mjs
```

## 素材与当前状态

首页已使用 Couriers 标志和项目主视觉；下方部分介绍、人物及截图仍保留 Eastward 参考内容，后续可逐项替换。Eastward 美术属于 Pixpil / Chucklefish，Minecraft 唱片素材属于相应权利人；来源记录不等同于许可授权。

图标来自 Remix Icon，许可见 `dist/assets/icons/LICENSE-RemixIcon.txt`。项目提供的标志、主视觉及其他素材保留各自权利归属。

本仓库只包含当前运行所需文件；未纳入旧素材、音频、设计草稿、临时截图、处理脚本和 Sites 配置。默认仅本地开发，上传或部署需要用户明确授权。
