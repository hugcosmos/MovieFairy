#!/bin/bash
# Cloudflare Pages 构建脚本
# 在构建时自动抓取电影数据和海报

set -e

echo "=== 安装 Python 依赖 ==="
pip install -r scripts/requirements.txt

echo "=== 抓取电影数据 + 海报 ==="
cd scripts
python fetch_movies.py --download-posters
cd ..

echo "=== 重新生成 data.js ==="
python -c "
import json
with open('data/movies.json', 'r', encoding='utf-8') as f:
    movies = json.load(f)
with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write('// Movie Fairy - 电影数据（由 fetch_movies.py 生成）\n')
    f.write('const MOVIES = ')
    json.dump(movies, f, ensure_ascii=False, indent=2)
    f.write(';\n')
print(f'已生成 data.js，共 {len(movies)} 部电影')
"

echo "=== 构建完成 ==="
