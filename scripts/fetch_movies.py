#!/usr/bin/env python3
"""
Movie Fairy - 数据抓取脚本
抓取豆瓣电影 Top 榜单，输出 movies.json
"""

import argparse
import json
import os
import re
import sys
import time

import requests
import yaml
from bs4 import BeautifulSoup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.yaml")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def fetch_page(url, retries=3):
    for i in range(retries):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e:
            print(f"  请求失败 ({i+1}/{retries}): {e}")
            if i < retries - 1:
                time.sleep(3)
    return None


def parse_movie_info(info_text):
    """从 '1994 / 美国 / 犯罪 剧情' 格式中提取年份、国家、类别"""
    year = ""
    countries = ""
    categories = []

    parts = [p.strip() for p in info_text.split("/")]
    for part in parts:
        if re.match(r"^\d{4}$", part):
            year = int(part)
        elif not year and re.match(r"^\d{4}", part):
            year = int(part.strip()[:4])
        elif any("\u4e00" <= c <= "\u9fff" for c in part) and not categories:
            # 第一个含中文且不是年份的部分可能是国家
            if not countries:
                countries = part
            else:
                categories = part.split()
        elif part and not countries:
            countries = part
        else:
            categories = part.split()

    # 尝试更精准的提取
    parts2 = info_text.split("/")
    if len(parts2) >= 3:
        year_str = parts2[0].strip()
        if year_str.isdigit():
            year = int(year_str)
        countries = parts2[1].strip()
        categories = parts2[2].strip().split()

    return year, countries, categories


def scrape_douban(config, top_n):
    """抓取豆瓣 Top 榜单"""
    base_url = config["douban"]["base_url"]
    per_page = config["douban"]["per_page"]
    pages = (top_n + per_page - 1) // per_page

    movies = []

    for page in range(pages):
        start = page * per_page
        fetch_count = min(per_page, top_n - len(movies))
        if fetch_count <= 0:
            break

        url = f"{base_url}?start={start}&filter="
        print(f"正在抓取第 {page+1}/{pages} 页: {url}")

        html = fetch_page(url)
        if not html:
            print(f"  跳过第 {page+1} 页（请求失败）")
            continue

        soup = BeautifulSoup(html, "html.parser")
        items = soup.select("ol.grid_view li")

        if not items:
            print("  未找到电影条目，可能被反爬限制。")
            print("  建议：稍后重试，或使用代理。")
            break

        for item in items:
            if len(movies) >= top_n:
                break

            # 海报 & 详情页链接
            img = item.select_one(".pic img")
            poster_url = img["src"] if img else ""
            title = img["alt"] if img else ""

            link_el = item.select_one(".pic a")
            douban_url = link_el["href"] if link_el else ""

            # 评分
            rating_el = item.select_one(".rating_num")
            rating = float(rating_el.text.strip()) if rating_el else 0.0

            # 简介（一句话短评）
            quote_el = item.select_one("p.quote span")
            quote = quote_el.text.strip() if quote_el else ""

            # 年份、国家、类别
            bd = item.select_one(".bd")
            year, countries, categories = 0, "", []
            if bd:
                info_lines = bd.get_text("\n").split("\n")
                for line in info_lines:
                    line = line.strip()
                    if "/" in line and any(c.isdigit() for c in line):
                        year, countries, categories = parse_movie_info(line)
                        break

            movie = {
                "id": len(movies) + 1,
                "title": title,
                "poster_url": poster_url,
                "synopsis": quote,
                "rating": rating,
                "categories": categories,
                "year": year,
                "countries": countries,
                "douban_url": douban_url,
            }
            movies.append(movie)
            print(f"  [{len(movies):3d}] {title} ({year}) {rating}")

        # 礼貌延迟，避免触发反爬
        if page < pages - 1:
            time.sleep(2)

    return movies


def download_posters(movies, posters_dir):
    """下载海报图片到本地，并将 poster_url 更新为本地相对路径"""
    os.makedirs(posters_dir, exist_ok=True)
    for movie in movies:
        url = movie["poster_url"]
        if not url:
            continue
        filename = f"{movie['id']:03d}.jpg"
        filepath = os.path.join(posters_dir, filename)
        if not os.path.exists(filepath):
            try:
                resp = requests.get(url, headers={**HEADERS, "Referer": "https://movie.douban.com/"}, timeout=15)
                resp.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                print(f"  下载海报: {movie['title']}")
            except requests.RequestException as e:
                print(f"  海报下载失败 [{movie['title']}]: {e}")
                continue
            time.sleep(0.3)
        # 更新为本地相对路径
        movie["poster_url"] = f"data/posters/{filename}"


def main():
    parser = argparse.ArgumentParser(description="Movie Fairy 数据抓取脚本")
    parser.add_argument("--source", default=None, help="数据源: douban / imdb")
    parser.add_argument("--top", type=int, default=None, help="抓取数量")
    parser.add_argument("--download-posters", action="store_true", help="下载海报到本地")
    args = parser.parse_args()

    config = load_config()
    source = args.source or config.get("source", "douban")
    top_n = args.top or config.get("top_n", 100)

    print(f"数据源: {source}, 抓取数量: {top_n}")
    print()

    if source == "douban":
        movies = scrape_douban(config, top_n)
    else:
        print(f"暂不支持数据源: {source}")
        print("支持的数据源: douban")
        sys.exit(1)

    if not movies:
        print("未抓取到任何电影数据。")
        sys.exit(1)

    # 下载海报（在保存 JSON 之前，这样 poster_url 会是本地路径）
    if args.download_posters:
        posters_dir = os.path.join(SCRIPT_DIR, config["output"]["posters_dir"])
        print(f"\n开始下载海报到 {posters_dir}")
        download_posters(movies, posters_dir)

    # 保存 movies.json
    output_path = os.path.join(SCRIPT_DIR, config["output"]["movies_json"])
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)
    print(f"\n已保存 {len(movies)} 部电影到 {output_path}")

    print("\n完成！")


if __name__ == "__main__":
    main()
