/**
 * Movie Fairy - 推荐算法
 *
 * 基于情绪调节理论 (Mood Management Theory, Zillmann):
 * 1. 策略 (tone × energy → 9种) 决定类别偏好和回避
 * 2. 社交修饰 (social) 独立叠加，影响人际关系类别的权重
 * 3. 忽略噪声类别 ("剧情" 覆盖率 79%，无区分度)
 * 4. 评分仅作微弱加分，避免高分垄断
 */

// 噪声类别——覆盖率太高，不参与评分
const IGNORED_CATEGORIES = new Set(['剧情']);

/**
 * 策略 → 类别偏好
 *
 * 设计原则 (来自情绪调节理论):
 * - 积极 tone: 顺势推荐，维持好心情；回避灾难/战争
 * - 消极 tone: 互补推荐，治愈或给出口；回避同向的沉重题材
 * - 中性 tone: 看能量——高能量找刺激，低能量找陪伴
 * - 高 energy → 偏好高强度类别 (冒险/科幻/悬疑)
 * - 低 energy → 偏好温和类别 (动画/音乐/爱情)
 */
const STRATEGY_PREFERENCES = {
  // ---- 积极: 顺势维持好心情 ----
  '顺势兴奋': {
    weights: { '喜剧': 3, '冒险': 3, '奇幻': 2, '歌舞': 2, '动画': 1, '动作': 1 },
    avoid: { '战争': -2, '灾难': -3 },
  },
  '顺势享受': {
    weights: { '喜剧': 3, '动画': 2, '爱情': 2, '音乐': 1, '冒险': 1 },
    avoid: { '战争': -2, '灾难': -3 },
  },
  '顺势温柔': {
    weights: { '动画': 3, '爱情': 2, '音乐': 2, '喜剧': 1 },
    avoid: { '灾难': -3, '战争': -2, '犯罪': -1 },
  },

  // ---- 中性: 需要被吸引 ----
  '探索刺激': {
    weights: { '科幻': 3, '悬疑': 2, '冒险': 2, '奇幻': 2, '犯罪': 1 },
    avoid: { '灾难': -1 },
  },
  '随缘发现': {
    weights: { '冒险': 2, '喜剧': 2, '奇幻': 1, '爱情': 1, '动画': 1 },
    avoid: {},
  },
  '温和陪伴': {
    weights: { '喜剧': 2, '动画': 2, '爱情': 1, '音乐': 1 },
    avoid: { '灾难': -1, '战争': -1 },
  },

  // ---- 消极: 需要修正 ----
  // 高能量+消极 → 烦躁/焦虑，需要高强度出口，但回避灾难
  '情绪出口': {
    weights: { '犯罪': 2, '悬疑': 2, '动作': 1, '科幻': 1, '喜剧': 1 },
    avoid: { '灾难': -2 },
  },
  // 中能量+消极 → 需要温暖治愈
  '温暖治愈': {
    weights: { '动画': 3, '喜剧': 2, '音乐': 2, '爱情': 1 },
    avoid: { '战争': -2, '灾难': -3, '犯罪': -1 },
  },
  // 低能量+消极 → 疲惫脆弱，需要最温柔的安抚
  '轻柔安抚': {
    weights: { '动画': 3, '音乐': 3, '爱情': 1, '传记': 1 },
    avoid: { '战争': -3, '灾难': -3, '犯罪': -2, '惊悚': -2 },
  },
};

// 社交修饰——独立于策略，叠加在类别得分上
const SOCIAL_MODIFIER = {
  'connect': { '爱情': 1, '传记': 1 },
  'alone': { '科幻': 1, '悬疑': 1 },
  'neutral': {},
};

/**
 * 为每部电影计算匹配分数
 *
 * @param {Array} movies - 电影列表
 * @param {string} strategy - 推荐策略标签
 * @param {string} social - 社交维度值
 * @returns {Array} 带分数的电影列表，按分数降序排列
 */
function scoreMovies(movies, strategy, social) {
  const prefs = STRATEGY_PREFERENCES[strategy] || { weights: {}, avoid: {} };
  const socialMod = SOCIAL_MODIFIER[social] || {};

  return movies
    .map(movie => {
      let categoryScore = 0;
      let matched = false;
      let hasRelevant = false;

      for (const cat of movie.categories) {
        if (IGNORED_CATEGORIES.has(cat)) continue;
        hasRelevant = true;

        const w = prefs.weights[cat] || 0;
        const a = prefs.avoid[cat] || 0;
        const s = socialMod[cat] || 0;

        if (w > 0) { categoryScore += w; matched = true; }
        if (a < 0) { categoryScore += a; }
        if (s > 0) { categoryScore += s; matched = true; }
      }

      // 有具体类别但无一匹配时降权
      const penalty = (hasRelevant && !matched) ? -2 : 0;

      // 评分仅作微弱加分 (0~0.5)，类别匹配 (最高可达 6+) 远大于评分差异
      const ratingBonus = (movie.rating / 10) * 0.5;

      return {
        ...movie,
        _score: categoryScore + penalty + ratingBonus,
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
 * @returns {{ movie: Object }}
 */
function recommend(movies, mood) {
  const scored = scoreMovies(movies, mood.profile, mood.social);
  const movie = pickRandom(scored);

  const clean = { ...movie };
  delete clean._score;

  return { movie: clean };
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scoreMovies, recommend, STRATEGY_PREFERENCES, SOCIAL_MODIFIER, IGNORED_CATEGORIES };
}
