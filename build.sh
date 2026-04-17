#!/bin/bash
# Cloudflare Pages 构建脚本
# 从豆瓣下载海报图片，不修改任何现有数据

set -e

echo "=== 安装 Python 依赖 ==="
pip install -r scripts/requirements.txt

echo "=== 下载海报图片 ==="
cd scripts

python -c "
import json
import os
from fetch_movies import download_posters

# 加载现有数据
with open('../data/movies.json', 'r', encoding='utf-8') as f:
    movies = json.load(f)

# 下载海报（不修改 movies 数据）
download_posters(movies, '../data/posters', update_url=False)

print('海报下载完成')
"

cd ..

echo "=== 构建完成 ==="
