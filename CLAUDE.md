# Movie Fairy

一个善意且温柔的电影推荐工具。通过 3 个精心设计的问题感知用户情绪，从本地电影库中推荐最合适的电影。

## 核心设计原则

- 第一性原理：理解用户真正需要什么，不过度实现
- 精简易用，功能模块化，不互相依赖
- 尽量智能，减少用户使用时对模型的依赖
- 善意且温柔——这是产品的灵魂

## 技术架构

**运行时形态：纯静态 Web 应用**
- 零运行时依赖，双击 `index.html` 即可使用
- 也可直接部署到 Cloudflare Pages / GitHub Pages，无需改造
- 推荐逻辑（问题库 + 情绪判断 + 电影匹配）全部在本地 JS 中完成，不依赖任何 API
- 海报通过 URL 引用在线图片，不下载到本地（用户能看到推荐就有网，就能加载海报）

**数据准备：独立 Python 脚本**
- 抓取电影数据（名称、海报 URL、简介、评分、类别）
- 存储为 JSON 文件
- 可扩展：支持切换数据源（豆瓣/IMDb）、调整榜单范围（Top 100/250）
- 可选 `--download-posters` 参数下载海报到本地（完全离线场景用）

```
movie_fairy/
├── CLAUDE.md
├── index.html              # 入口，双击即用
├── css/
│   └── style.css           # 样式
├── js/
│   ├── app.js              # 主逻辑：问答流程、情绪判断、推荐
│   ├── questions.js        # 问题库与情绪探测逻辑
│   └── recommender.js      # 推荐算法
├── data/
│   ├── movies.json         # 电影数据（含海报 URL）
│   └── posters/            # [可选] 本地海报图片，--download-posters 时生成
├── scripts/
│   ├── fetch_movies.py     # 数据抓取脚本
│   └── config.yaml         # 数据源配置（源、范围等）
└── visions.md
```

## 数据格式（movies.json）

```json
[
  {
    "id": 1,
    "title": "肖申克的救赎",
    "poster_url": "https://...",
    "synopsis": "两句话以内的精简简介",
    "rating": 9.7,
    "categories": ["剧情", "犯罪"],
    "year": 1994
  }
]
```

- `synopsis` 精简到 2-3 句话，推荐场景不需要完整剧情
- `poster_url` 默认存在线 URL，不下载图片

## 数据抓取脚本

**命令：**
```bash
cd scripts
pip install -r requirements.txt
python fetch_movies.py                                  # 默认：豆瓣 Top 100
python fetch_movies.py --source imdb --top 250          # IMDb Top 250
python fetch_movies.py --download-posters               # 同时下载海报到 data/posters/
```

**配置项（config.yaml）：**
- `source`: 数据源（douban / imdb）
- `top_n`: 榜单范围（100 / 250 等）
- 输出统一格式到 `data/movies.json`

## 推荐逻辑

1. 从问题库中依次提出 3 个问题
2. 每个问题看似随意，实则有情绪探测逻辑
3. 综合 3 个回答判断用户当前情绪状态（如：疲惫、孤独、迷茫、开心、焦虑等）
4. 根据情绪 + 电影类别/评分，从本地库中推荐 1 部最合适的电影
5. 展示：电影海报 + 片名 + 简介 + 评分 + 一句温暖的推荐语

## 开发顺序

1. 数据抓取脚本（`scripts/fetch_movies.py`）
2. 电影数据（`data/movies.json`）
3. 问题库与情绪判断逻辑（`js/questions.js`）
4. 推荐算法（`js/recommender.js`）
5. 主界面与交互流程（`index.html` + `js/app.js` + `css/style.css`）

## 注意事项

- 推荐逻辑必须完全离线可用，不可依赖外部 API
- 海报默认用在线 URL，图片加载失败时应有优雅降级（如显示电影名占位）
- 问题库需要有足够的多样性和深度，避免用户感到被机械式盘问
- UI 文案和推荐语要温暖自然，不要生硬
