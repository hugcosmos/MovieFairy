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
  // ---- energy 维度 (6道) ----
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
    id: 'energy_4',
    dimension: 'energy',
    text: '此刻你更想做的运动是？',
    options: [
      { label: '不想动，躺着就好', value: 'low' },
      { label: '出去走走，散散步', value: 'medium' },
      { label: '跑步、打球，出点汗', value: 'high' },
    ],
  },
  {
    id: 'energy_5',
    dimension: 'energy',
    text: '如果现在要你去完成一件小事，比如下楼取快递——',
    options: [
      { label: '算了，等会儿再说', value: 'low' },
      { label: '可以，现在就去', value: 'medium' },
      { label: '顺便还能去逛一圈', value: 'high' },
    ],
  },
  {
    id: 'energy_6',
    dimension: 'energy',
    text: '你今天说话的频率大概是？',
    options: [
      { label: '基本没跟人说话', value: 'low' },
      { label: '正常，该说说', value: 'medium' },
      { label: '今天话特别多', value: 'high' },
    ],
  },
  {
    id: 'energy_7',
    dimension: 'energy',
    text: '此刻你刷手机的速度是？',
    options: [
      { label: '刷两下就放下了，提不起劲', value: 'low' },
      { label: '正常刷，没什么特别的', value: 'medium' },
      { label: '刷得飞快，总想找点新鲜的', value: 'high' },
    ],
  },

  // ---- social 维度 (6道) ----
  {
    id: 'social_1',
    dimension: 'social',
    text: '上一次你发自内心地笑，是因为什么？',
    options: [
      { label: '和朋友聊天，或者有人逗我', value: 'connect' },
      { label: '刷到好笑的东西，一个人笑的', value: 'alone' },
      { label: '想不起来了', value: 'neutral' },
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
    id: 'social_4',
    dimension: 'social',
    text: '周末到了，你更想怎么过？',
    options: [
      { label: '约朋友出去吃个饭逛逛', value: 'connect' },
      { label: '自己待着，追追剧打打游戏', value: 'alone' },
      { label: '都行，看心情', value: 'neutral' },
    ],
  },
  {
    id: 'social_5',
    dimension: 'social',
    text: '你更喜欢哪种聊天方式？',
    options: [
      { label: '语音或者面对面聊', value: 'connect' },
      { label: '打字，发完就想撤', value: 'alone' },
      { label: '不太想聊天', value: 'neutral' },
    ],
  },
  {
    id: 'social_6',
    dimension: 'social',
    text: '如果你要去看电影，你会——',
    options: [
      { label: '想叫个人一起去看', value: 'connect' },
      { label: '一个人去看更自在', value: 'alone' },
      { label: '无所谓，电影好看就行', value: 'neutral' },
    ],
  },

  // ---- tone 维度 (6道) ----
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
    text: '选一个最接近你现在心情的词',
    options: [
      { label: '轻松', value: 'positive' },
      { label: '平静', value: 'neutral' },
      { label: '有点累', value: 'healing' },
    ],
  },
  {
    id: 'tone_3',
    dimension: 'tone',
    text: '如果今天有一个形容词，你选哪个？',
    options: [
      { label: '不错的一天', value: 'positive' },
      { label: '普普通通的一天', value: 'neutral' },
      { label: '不太想评价', value: 'healing' },
    ],
  },
  {
    id: 'tone_4',
    dimension: 'tone',
    text: '此刻你希望这部电影的结局是？',
    options: [
      { label: '开心的，越热闹越好', value: 'positive' },
      { label: '无所谓，好看就行', value: 'neutral' },
      { label: '安静的，能让我缓缓', value: 'healing' },
    ],
  },
  {
    id: 'tone_5',
    dimension: 'tone',
    text: '你今天到目前为止，叹气了吗？',
    options: [
      { label: '没有，今天还行', value: 'positive' },
      { label: '可能叹了，没注意', value: 'neutral' },
      { label: '叹了，还不止一次', value: 'healing' },
    ],
  },
  {
    id: 'tone_6',
    dimension: 'tone',
    text: '现在给你一个遥控器能换心情频道，你换到哪个？',
    options: [
      { label: '综艺频道，热闹的那种', value: 'positive' },
      { label: '纪录片，慢慢看', value: 'neutral' },
      { label: '一个安静的深夜电台', value: 'healing' },
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
