# Movie Fairy

一个善意且温柔的电影推荐工具。答 3 个小题或开个盲盒，为你挑一部好电影。

## 在线体验

> 部署在 Cloudflare Pages 上，海报数据在构建时自动获取。
> [Movie Fairy](https://moviefairy.pages.dev/)

## 工作原理

基于**情绪调节理论** (Mood Management Theory, Zillmann) 的推荐算法：

1. **3 个问题感知心情** — 从题库中随机抽取（能量、社交、情绪各 1 题）
2. **生成情绪画像** — tone × energy → 9 种推荐策略，social 作为独立修饰
3. **类别加权匹配** — 根据策略为电影的类别打分，忽略噪声类别（如"剧情"），评分仅作微弱加分
4. **加权随机选择** — 从 Top 8 候选中 softmax 采样，高分概率大但不唯一

## 功能

- **情绪推荐** — 不是随便挑，是根据你的状态匹配的
- **开盲盒** — 不想答题？一键随机推荐，碰碰运气
- **换一部** — 不满意？从同一批候选中换一部
- **在线播放源** — 显示各平台观看方式（VIP / 免费 / 付费），点击直达
- **平台筛选** — 欢迎页勾选已有会员的平台，只推荐有片源的电影
- **本地海报** — 构建时通过 CDN 直链下载，无需运行时加载远程图片
- **纯静态** — 无后端，零 API 调用，直接浏览器运行

## 项目结构

```
├── index.html              # 入口
├── css/style.css           # 样式
├── js/
│   ├── data.js             # 电影数据（由脚本生成）
│   ├── questions.js        # 问题库 & 情绪分析
│   ├── recommender.js      # 推荐算法
│   └── app.js              # 主逻辑 & UI 渲染
├── data/
│   ├── movies.json         # 完整电影数据
│   └── posters/            # 海报图片（gitignore）
├── scripts/
│   ├── fetch_movies.py     # 数据抓取脚本
│   ├── config.yaml         # 抓取配置
│   └── requirements.txt    # Python 依赖
├── build.sh                # Cloudflare Pages 构建脚本
└── README.md
```

## 本地运行

### 前端

直接打开 `index.html` 即可，无需构建。

### 数据抓取

```bash
# 1. 克隆仓库
git clone https://github.com/hugcosmos/MovieFairy.git
cd MovieFairy

# 2. 安装依赖
cd scripts
pip install -r requirements.txt

# 3. 查看帮助
python fetch_movies.py --help

# 4. 完整抓取（示例：Top 50 + 海报 + 播放源）
python fetch_movies.py --top 50 --download-posters --fetch-streaming --cookie "你的豆瓣Cookie"

# 5. 仅抓取列表 + 下载海报（无需 Cookie）
python fetch_movies.py --top 50 --download-posters

# 6. 单独下载海报（基于已有 movies.json，无需 Cookie）
python fetch_movies.py --download-posters

# 7. 单独更新播放源（基于已有 movies.json，需要 Cookie）
python fetch_movies.py --fetch-streaming --cookie "你的豆瓣Cookie"
```

> `--fetch-streaming` 需要登录态的豆瓣 Cookie，否则会被反爬拦截。获取方式：浏览器登录豆瓣 → F12 → Network → 复制请求头中的 Cookie 字段。海报下载通过 CDN 直链获取，不需要 Cookie。

## 数据来源

电影评分与信息来源于 [豆瓣电影 Top 250](https://movie.douban.com/top250)。在线播放源同样来自豆瓣电影详情页。海报图片版权归各自电影出品方所有。

## 许可

代码采用 [MIT License](LICENSE) 发布。海报、评分等数据版权归各自所有者，本项目不主张任何权利。
