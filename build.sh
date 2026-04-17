#!/bin/bash
# Cloudflare Pages 构建脚本
# 在构建时自动下载海报图片（movies.json 和 data.js 已随仓库上传）

set -e

echo "=== 安装 Python 依赖 ==="
pip install -r scripts/requirements.txt

echo "=== 下载海报图片 ==="
cd scripts
python fetch_movies.py --download-posters
cd ..

echo "=== 构建完成 ==="
