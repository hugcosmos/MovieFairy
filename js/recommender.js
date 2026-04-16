/**
 * Movie Fairy - 推荐算法
 *
 * 根据情绪画像从电影库中推荐最合适的电影
 *
 * 逻辑：
 * 1. 情绪画像映射到偏好类别权重
 * 2. 对每部电影计算匹配分数 = 类别匹配 × 评分权重
 * 3. 从高分电影中随机选一部（避免每次推荐结果一样）
 */

// 情绪画像 → 偏好类别的权重映射
// 正权重=偏好，负权重=回避，0=中性
const PROFILE_PREFERENCES = {
  '疲惫独处': {
    '剧情': 2, '动画': 2, '音乐': 1, '奇幻': 1,
    '灾难': -2, '战争': -2, '犯罪': -1, '惊悚': -1, '悬疑': -1,
  },
  '需要安慰': {
    '剧情': 2, '动画': 2, '喜剧': 2, '音乐': 1,
    '战争': -2, '灾难': -2, '犯罪': -1, '惊悚': -1,
  },
  '默默疗愈': {
    '剧情': 2, '动画': 1, '音乐': 2, '爱情': 1,
    '战争': -2, '灾难': -1, '惊悚': -1,
  },
  '情绪低但想连接': {
    '剧情': 2, '爱情': 1, '音乐': 1, '喜剧': 2, '动画': 1,
    '灾难': -1, '战争': -1,
  },
  '开心想分享': {
    '喜剧': 3, '动画': 2, '冒险': 2, '奇幻': 1, '歌舞': 2,
    '灾难': -1,
  },
  '自得其乐': {
    '科幻': 2, '冒险': 2, '悬疑': 1, '奇幻': 2, '动画': 1,
  },
  '平静满足': {
    '剧情': 2, '爱情': 1, '音乐': 1, '动画': 1, '传记': 1,
  },
  '有点孤独': {
    '剧情': 2, '爱情': 2, '音乐': 1, '动画': 1,
    '灾难': -1, '战争': -1,
  },
  '无聊发呆': {
    '冒险': 2, '科幻': 2, '悬疑': 2, '奇幻': 2, '喜剧': 1,
  },
  '好奇探索': {
    '科幻': 3, '悬疑': 2, '冒险': 2, '奇幻': 2,
  },
  '想安静思考': {
    '剧情': 3, '传记': 1, '历史': 1, '悬疑': 1,
    '歌舞': -1,
  },
  '日常平淡': {
    '剧情': 2, '喜剧': 2, '爱情': 1, '动画': 1, '冒险': 1,
  },
};

/**
 * 为每部电影计算匹配分数
 * score = 类别匹配分 + 评分加成
 *
 * @param {Array} movies - 电影列表
 * @param {string} profile - 情绪画像标签
 * @returns {Array} 带分数的电影列表，按分数降序排列
 */
function scoreMovies(movies, profile) {
  const prefs = PROFILE_PREFERENCES[profile] || {};
  const MAX_RATING = 10;

  return movies
    .map(movie => {
      let categoryScore = 0;
      let matched = false;

      for (const cat of movie.categories) {
        if (prefs[cat] !== undefined) {
          categoryScore += prefs[cat];
          if (prefs[cat] > 0) matched = true;
        }
      }

      // 评分加成：高评分电影有少量加分（不主导推荐）
      const ratingBoost = (movie.rating / MAX_RATING) * 1.5;

      // 完全没有偏好匹配的电影降权
      const matchPenalty = matched ? 0 : -3;

      return {
        ...movie,
        _score: categoryScore + ratingBoost + matchPenalty,
      };
    })
    .sort((a, b) => b._score - a._score);
}

/**
 * 从 Top N 候选中随机选一部
 * @param {Array} scored - 已评分的电影列表
 * @param {number} topN - 从前几名中选，默认 5
 * @returns {Object} 推荐的电影
 */
function pickRandom(scored, topN = 5) {
  const candidates = scored.slice(0, Math.min(topN, scored.length));
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 推荐入口
 *
 * @param {Array} movies - 电影数据列表
 * @param {Object} mood - 情绪分析结果（来自 questions.js）
 * @returns {{ movie: Object, message: string }}
 */
function recommend(movies, mood) {
  const scored = scoreMovies(movies, mood.profile);
  const movie = pickRandom(scored);

  // 去掉内部评分字段
  const clean = { ...movie };
  delete clean._score;

  return { movie: clean };
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scoreMovies, recommend, PROFILE_PREFERENCES };
}
