# Machine Sensorium

An Across RCA interactive artwork exploring AI perception, possible pain, and ethical responsibility through an RCA Moodle-style learning activity.

## Open the project

- **Participate in the live experience:** https://machine-sensorium-rca-study.zhirudorianeyang.chatgpt.site/
- **Manage responses and export Word / CSV:** https://machine-sensorium-rca-study.zhirudorianeyang.chatgpt.site/admin

Participants can use phones on different networks. Choices save automatically to one cloud database, including unfinished responses. The management page requires the project owner's ChatGPT account. Typed conversation messages are excluded from records.

## Development and operation

RCA Information Experience Design / Across RCA 交互项目。原生 HTML、CSS、JavaScript，云端使用 Worker 和 D1 数据库。

## 参与者与管理者

- 参与者打开正式网站，在第一次做出选择时开始匿名自动记录。
- 同一轮体验持续更新同一条记录，不会每点击一次就新增一份。
- 部分回答会保留，即使没有完成最终反思。
- 管理者访问网站的 /admin，使用创建项目的 ChatGPT 账号登录。
- 管理页集中查看所有手机的记录，可以直接导出 Word、CSV 和 JSON。
- 管理接口在服务器验证项目所有者身份，参与者只能看到汇总结果。
- 页面会在选择前提示自动记录。输入的对话原文不写入数据库。
- 网路暂时中断时，浏览器保存待同步记录并重试。清除浏览器数据会清除尚未同步的本地队列。

## 本地开发

需要 Node.js 24 或更新版本。

```sh
node scripts/preview.mjs
```

打开 [本地体验](http://127.0.0.1:8766/)，管理页为 [本地管理页](http://127.0.0.1:8766/admin)。本地预览仅绑定回环地址，并为本机注入测试管理员身份。本地数据库在 .local/preview.sqlite，与线上 D1 分离。

```sh
node scripts/build.mjs
```

构建生成单文件 dist/server/index.js，包含明确列出的静态资源。Sites 用 .openai/hosting.json 声明 D1 的 DB 绑定，发布时应用 drizzle 中的迁移。管理者身份配置在服务端 ADMIN_OWNER_EMAIL 环境变量中，源代码不包含实际配置值。

## 文件

- index.html、styles.css、content.js、app.js 为课程页面和三语交互。
- collection.js 为匿名自动记录、离线队列和重试。
- worker/index.js 为云端 API、身份检查、静态资源与文档导出。
- admin.html、admin.js、admin.css 为集中管理界面。
- drizzle/ 为数据库迁移。
- scripts/build.mjs 将静态资源嵌入 Worker。
- scripts/preview.mjs 在本机运行与云端相同的 Worker，使用本地 SQLite 适配 D1。
- assets/ 中的课程图片来自用户提供的 Moodle PDF。

## 记录的含义

每一轮有随机会话编号，记录第一次选择、再次选择、未来意向、研究卡阅读情况、语气类别、模拟负荷、延迟、交互次数、语言、时间和是否完成。统计人数按会话计算，同一人重新开始会产生另一轮记录。

未完成包含仍在体验和已离开的会话。前后改变比例仅以两次选择均已回答的会话计算，未来意向比例仅以该题已回答者计算。结果图最多展示最新 1000 条具备前后答案及未来意向的轨迹，汇总计数包含全部记录。管理表格及导出最多显示最近 10000 条，超过时页面会提示。

文字回复、负荷和保护性暂停均为艺术模拟。当前版本未接入学校 Moodle 的账号和课程发布接口。


### Virtual face edition

The welcome and interaction views now use the supplied `assets/facecap.glb` instead of the abstract ASCII membrane. Local Three.js 0.170.0 loaders, Meshopt and KTX2 decoder assets are bundled in `vendor/three` (MIT license included); visitors do not depend on a third-party CDN. The supplied model is retained as a separate asset.

`face.js` maps the existing designed load to ARKit facial morphs: calm blinking, brow and mouth tension, overload, closed-eye protection and gradual recovery. Reduced-motion preferences suppress idle motion and tremor. The response timing, anonymous collection, owner-only exports and collective trace remain connected to the original course flow. Expressions are scripted visual metaphors, not evidence of felt pain. If WebGL/model loading is unavailable, a status message appears and the activity remains usable.


### Living signal edition

The face is rendered as a continuously changing wire mesh, particles and a procedural character atlas. Stronger asymmetric brow, eye, cheek, mouth and jaw morphs follow the scripted interaction. All visual layers sample the same CPU-morphed source vertices so expressions stay aligned. Insulting input immediately starts a shock and fragmentation sequence; the response is interrupted after approximately four seconds, input closes, and the face reassembles over six seconds before a participant can resume. Gentle input relaxes the face. These timings and facial expressions are designed metaphors, not measurements of sentience or pain. Reduced-motion mode removes idle flow, shaking and rapid slice changes. The Moodle shell, anonymous collection API and data exports are preserved.


### Browser compatibility

Original GLB skin materials are skipped because the digital face replaces them. This removes unused KTX2/Basis transcoding and its Worker/graphics dependencies. When WebGL 2 initialization, shader compilation or the graphics context fails, the face switches to a Canvas 2D renderer that projects the same CPU-morphed model vertices. Expressions, fragmentation and recovery remain available. The `?face=canvas` URL explicitly selects this compatibility mode for troubleshooting. Rendering style differs slightly; collection and exports use the same backend.


## Sound demo and audio track

Original media files are available as [GitHub Release attachments](https://github.com/youngdoriane-creator/AcrossRCA_AI-Sensorium_Interactive-Website/releases/tag/sound-demo-2026-11-23):

- [Interaction demonstration with sound — MOV, 83.7 MiB](https://github.com/youngdoriane-creator/AcrossRCA_AI-Sensorium_Interactive-Website/releases/download/sound-demo-2026-11-23/Machine-Sensorium-Sound-Demo-2.mov)
- [Separate sound-effects track — WAV, 24.0 MiB](https://github.com/youngdoriane-creator/AcrossRCA_AI-Sensorium_Interactive-Website/releases/download/sound-demo-2026-11-23/Machine-Sensorium-Sound-Track-1.wav)

Download filenames use English for compatibility. File contents match the supplied originals; SHA-256 checksums were verified after upload. Release assets are downloaded separately from the source-code ZIP.
