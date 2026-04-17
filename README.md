# Movie Fairy

一个善意且温柔的电影推荐工具。回答 3 个小问题，为你挑一部好电影。

## 在线体验

> 部署在 Cloudflare Pages 上，海报数据在构建时自动获取。
> [Movie Fairy](https://moviefairy.pages.dev/)

## 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/hugcosmos/MovieFairy.git
cd MovieFairy

# 2. 安装依赖
cd scripts
pip install -r requirements.txt

# 3. 查看脚本帮助
python fetch_movies.py --help

# 4. 运行脚本（示例：抓取 50 部电影，下载海报，获取播放信息）
python fetch_movies.py --top 50 --download-posters --fetch-streaming --cookie "你的豆瓣Cookie"
```

## 数据来源

电影评分与信息来源于 [豆瓣电影 Top 250](https://movie.douban.com/top250)。海报图片版权归各自电影出品方所有。

## 许可

代码采用 [MIT License](LICENSE) 发布。海报、评分等数据版权归各自所有者，本项目不主张任何权利。
