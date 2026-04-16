/**
 * Movie Fairy - 问题库与情绪探测
 *
 * 基于情绪调节理论 (Mood Management Theory, Zillmann):
 * - 效价 tone: 决定推荐策略——顺势维持好心情 or 互补修正坏心情
 * - 唤醒度 energy: 决定内容强度——需要刺激 or 需要安抚
 * - 归属需求 social: 独立修饰，影响人际关系类别的权重
 *
 * tone × energy → 9 种策略，social 不参与策略选择，作为推荐时的独立修饰
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
 * @param {Array<string>} answers - [energy, social, tone]
 * @returns {{ energy: string, social: string, tone: string, profile: string }}
 */
function analyzeMood(answers) {
  const mood = {
    energy: answers[0],
    social: answers[1],
    tone: answers[2],
  };

  mood.profile = getStrategy(mood);
  return mood;
}

/**
 * 三维 → 策略映射
 * tone × energy → 9 种推荐策略
 * social 不参与策略选择，作为推荐时的独立修饰
 */
function getStrategy(mood) {
  const { energy, tone } = mood;

  // 积极：顺势维持好心情
  if (tone === 'positive') {
    if (energy === 'high') return '顺势兴奋';
    if (energy === 'medium') return '顺势享受';
    return '顺势温柔';
  }

  // 消极：互补修正
  if (tone === 'healing') {
    if (energy === 'high') return '情绪出口';
    if (energy === 'medium') return '温暖治愈';
    return '轻柔安抚';
  }

  // 中性：需要被吸引
  if (energy === 'high') return '探索刺激';
  if (energy === 'medium') return '随缘发现';
  return '温和陪伴';
}

/**
 * 根据策略生成温暖的推荐语
 */
function getRecommendationMessage(profile) {
  const messages = {
    '顺势兴奋': '状态正好，这部电影配得上你今天的好心情。',
    '顺势享受': '心情不错的时候，最适合遇见一部好电影。',
    '顺势温柔': '好心情不用急，慢慢享受这一刻。',
    '探索刺激': '你今天充满了好奇心，让这部电影带你走进不一样的世界。',
    '随缘发现': '没有特别想要什么的时候，反而容易遇见惊喜。',
    '温和陪伴': '不用想太多，让一部好电影安静地陪你一会儿。',
    '情绪出口': '有些情绪需要出口，这部电影会给你一个释放的空间。',
    '温暖治愈': '有些累也没关系，让这部电影陪你度过此刻。',
    '轻柔安抚': '你今天辛苦了。不需要和谁解释，让一个温暖的故事陪你。',
  };
  return messages[profile] || '给你推荐一部电影，希望它会成为你今天的小确幸。';
}

// 导出（兼容浏览器和模块）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS, DIMENSIONS, pickQuestions, analyzeMood, getRecommendationMessage };
}
