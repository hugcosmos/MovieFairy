/**
 * Movie Fairy - 问题库与情绪探测
 *
 * 情绪模型：通过 3 个问题从不同角度探测用户状态
 * - 问题1：探测能量水平（高/中/低）
 * - 问题2：探测社交倾向（渴望连接 / 想独处 / 无所谓）
 * - 问题3：探测情绪基调（积极 / 中性 / 需要疗愈）
 *
 * 综合三个维度得出情绪画像，用于推荐匹配的电影
 */

// 情绪维度
const DIMENSIONS = {
  energy: ['low', 'medium', 'high'],       // 能量水平
  social: ['connect', 'alone', 'neutral'],  // 社交倾向
  tone: ['positive', 'neutral', 'healing'], // 情绪基调
};

// 问题库
// 每个问题对应一个探测维度，选项带有维度标签
const QUESTIONS = [
  {
    id: 'energy_1',
    dimension: 'energy',
    text: '今天到现在，你最接近哪种状态？',
    options: [
      { label: '刚睡醒，或者想躺下', value: 'low' },
      { label: '还行，说不上特别有精神', value: 'medium' },
      { label: '精力充沛，想找点事做', value: 'high' },
    ],
  },
  {
    id: 'energy_2',
    dimension: 'energy',
    text: '如果现在有人敲门找你出去玩，你的第一反应是？',
    options: [
      { label: '假装不在家', value: 'low' },
      { label: '看看是谁再说', value: 'medium' },
      { label: '好啊，走！', value: 'high' },
    ],
  },
  {
    id: 'energy_3',
    dimension: 'energy',
    text: '此刻你的手机电量大概多少？选一个最接近的直觉。',
    options: [
      { label: '红灯了，快没电了', value: 'low' },
      { label: '还有一半吧', value: 'medium' },
      { label: '满格或者刚充好', value: 'high' },
    ],
  },
  {
    id: 'social_1',
    dimension: 'social',
    text: '上一次你发自内心地笑，是因为什么？',
    options: [
      { label: '有人跟我说了句话，或者一个表情包', value: 'connect' },
      { label: '刷到什么东西，自己一个人笑的', value: 'alone' },
      { label: '想不起来了……好像很久没笑过', value: 'neutral' },
    ],
  },
  {
    id: 'social_2',
    dimension: 'social',
    text: '晚上一个人走在路上，你会——',
    options: [
      { label: '给某个人发条消息', value: 'connect' },
      { label: '戴上耳机，享受独处', value: 'alone' },
      { label: '什么都不想，就走路', value: 'neutral' },
    ],
  },
  {
    id: 'social_3',
    dimension: 'social',
    text: '如果此刻能拥有一种超能力，你选哪个？',
    options: [
      { label: '读懂身边人真正在想什么', value: 'connect' },
      { label: '隐身，谁也找不到我', value: 'alone' },
      { label: '暂停时间，让我安静待一会儿', value: 'neutral' },
    ],
  },
  {
    id: 'tone_1',
    dimension: 'tone',
    text: '如果今天是一首歌，你觉得它更像什么旋律？',
    options: [
      { label: '轻快的，有点小开心', value: 'positive' },
      { label: '安静的，有点发呆', value: 'neutral' },
      { label: '低沉的，说不上为什么', value: 'healing' },
    ],
  },
  {
    id: 'tone_2',
    dimension: 'tone',
    text: '现在给你一碗热汤，你希望是什么汤？',
    options: [
      { label: '番茄蛋花汤，暖暖的就好', value: 'positive' },
      { label: '清汤，什么都不用加', value: 'neutral' },
      { label: '姜汤，从里到外暖一下', value: 'healing' },
    ],
  },
  {
    id: 'tone_3',
    dimension: 'tone',
    text: '窗外现在是什么天气？（不一定要真实天气，凭感觉选）',
    options: [
      { label: '晴天，有阳光', value: 'positive' },
      { label: '多云，不晴不雨', value: 'neutral' },
      { label: '下雨了，或者天已经黑了', value: 'healing' },
    ],
  },
];

/**
 * 从问题库中选出 3 个问题（每个维度各一个）
 * 同一维度内随机选择，让每次体验有变化
 */
function pickQuestions() {
  const result = {};
  for (const dim of Object.keys(DIMENSIONS)) {
    const pool = QUESTIONS.filter(q => q.dimension === dim);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    result[dim] = picked;
  }
  // 按 energy → social → tone 的顺序
  return [result.energy, result.social, result.tone];
}

/**
 * 根据用户的 3 个回答，生成情绪画像
 * @param {Array<{dimension: string, value: string}>} answers
 * @returns {{ energy: string, social: string, tone: string, profile: string }}
 */
function analyzeMood(answers) {
  const mood = {
    energy: answers[0],
    social: answers[1],
    tone: answers[2],
  };

  // 生成情绪画像标签（用于推荐算法匹配电影类别）
  mood.profile = getProfile(mood);

  return mood;
}

/**
 * 将三维情绪映射为推荐用的画像标签
 */
function getProfile(mood) {
  // 核心画像组合：先看 tone，再看 energy
  if (mood.tone === 'healing') {
    if (mood.energy === 'low') {
      return mood.social === 'alone' ? '疲惫独处' : '需要安慰';
    }
    return mood.social === 'connect' ? '情绪低但想连接' : '默默疗愈';
  }

  if (mood.tone === 'positive') {
    if (mood.energy === 'high') {
      return mood.social === 'connect' ? '开心想分享' : '自得其乐';
    }
    return '平静满足';
  }

  // tone === 'neutral'
  if (mood.energy === 'low') {
    return mood.social === 'connect' ? '有点孤独' : '无聊发呆';
  }
  if (mood.energy === 'high') {
    return '好奇探索';
  }
  return mood.social === 'alone' ? '想安静思考' : '日常平淡';
}

/**
 * 根据情绪画像生成温暖的推荐语
 */
function getRecommendationMessage(profile) {
  const messages = {
    '疲惫独处': '你今天辛苦了。不需要和谁解释，一个人看一部好电影，也是很好的休息。',
    '需要安慰': '有些累也没关系，这部电影会陪你度过此刻。你不是一个人。',
    '默默疗愈': '有时候不需要说话，只需要一个故事静静地陪着你。',
    '情绪低但想连接': '你不需要独自承受。这部电影会给你一些温暖，像有人在你身边。',
    '开心想分享': '你今天心情不错！这部电影值得这份好心情。',
    '自得其乐': '享受独处的时光，这部电影会是一个好伙伴。',
    '平静满足': '心情平静的时候，最适合遇见一部好电影。',
    '有点孤独': '你不是一个人。让这部电影陪你聊聊那些说不出口的感受。',
    '无聊发呆': '漫无目的的时候，也许一部好电影能给今天一个方向。',
    '好奇探索': '你今天充满了好奇心！这部电影会带你走进一个不一样的世界。',
    '想安静思考': '想安静的时候，一部有深度的电影会让你和自己对话。',
    '日常平淡': '普通的一天，也许一部好电影能让它变得不那么普通。',
  };
  return messages[profile] || '给你推荐一部电影，希望它会成为你今天的小确幸。';
}

// 导出（兼容浏览器和模块）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS, DIMENSIONS, pickQuestions, analyzeMood, getRecommendationMessage };
}
