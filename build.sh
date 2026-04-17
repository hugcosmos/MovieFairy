#!/bin/bash
# Cloudflare Pages 构建脚本
# 只下载海报，保留所有现有数据

set -e

echo "=== 安装 Python 依赖 ==="
pip install -r scripts/requirements.txt

echo "=== 只下载海报（保留所有现有数据）==="
cd scripts
# 直接使用现有数据
echo "使用现有 movies.json，只下载海报"

# 运行脚本下载海报
python -c "
import json
import os
from fetch_movies import download_posters

# 加载现有数据
with open('../data/movies.json', 'r', encoding='utf-8') as f:
    movies = json.load(f)

# 下载海报
posters_dir = '../data/posters'
os.makedirs(posters_dir, exist_ok=True)
download_posters(movies, posters_dir)

# 保存更新后的数据（只更新海报路径）
with open('../data/movies.json', 'w', encoding='utf-8') as f:
    json.dump(movies, f, ensure_ascii=False, indent=2)

# 生成 data.js（保留所有现有信息）
with open('../js/data.js', 'w', encoding='utf-8') as f:
    f.write('// Movie Fairy - 电影数据（由 fetch_movies.py 生成）\n')
    f.write('const MOVIES = ')
    json.dump(movies, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print('海报下载完成，数据已更新（保留所有现有信息）')
"

cd ..

echo "=== 构建完成 ==="
