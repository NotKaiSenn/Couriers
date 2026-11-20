export type RoleGroup = '剧本创作' | '数据包' | '建筑' | '美工';

export interface TeamMember {
  id: string;
  name: string;
  mcId: string;
  isFounder?: boolean;
  role: string;
  groups: RoleGroup[];
  bio: string;
  featuredWork: string;
  avatarUrl: string;
  skinUrl: string;
  avatarSeed: string;
}

export interface BuildProject {
  id: string;
  title: string;
  category: string;
  date: string;
  playTime: string;
  players: string;
  version: string;
  buildersCount: number;
  image: string;
  summary: string;
  story: string[];
  leadBuilderId: string;
}

export interface AboutStoryBlock {
  id: string;
  titleTop: string;
  titleBottom: string;
  description: string;
  image: string;
  align: 'image-left' | 'image-right';
}

export const ABOUT_STORY_BLOCKS: AboutStoryBlock[] = [
  {
    id: 'vision',
    titleTop: '下一站...',
    titleBottom: '寄语世界！',
    description:
      '欢迎来到寄语编织的方块世界！拆开这封由像素火漆封缄的信，踏上未知的旅途。在云海浮空的小镇漫步，踏入停摆在午夜的赤红剧场，拾起散落的唱片与纸条——每一张体验地图，都在等你亲自开启下一章！',
    image: '/images/about-island.jpg',
    align: 'image-left',
  },
  {
    id: 'craft',
    titleTop: '推开门...',
    titleBottom: '机关在运转！',
    description:
      '这里的方块可不只是用来看的！拉动墙角的隐秘拉杆，校准星象仪的巨大铜齿轮，破解藏在书架背后的密室暗号！我们把策划的脑洞、建筑的风景与数据包机关揉在一起，让每一次探索都充满意想不到的惊喜！',
    image: '/images/about-airship.jpg',
    align: 'image-right',
  },
  {
    id: 'visuals',
    titleTop: '戴上耳机...',
    titleBottom: '好戏开场了！',
    description:
      '当旧时钟敲响十二下，林间的微光与专属旋律同时亮起！从阳光海岸到雾气弥漫的古林，我们用光影与声景为你搭好一座座会呼吸的舞台。准备好了吗？属于你的冒险现在出发……',
    image: '/images/about-sanctum.jpg',
    align: 'image-left',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'rainswallow',
    name: 'RainSwallow',
    mcId: 'RainSwallow',
    isFounder: true,
    role: '团队发起人 / 剧本创作',
    groups: ['剧本创作'],
    bio: '寄语 Couriers 团队发起人，主理体验地图的世界观立意、核心剧情剧本与整体叙事节奏统筹。',
    featuredWork: '沉默乐章：错位音',
    avatarUrl: '/images/avatars/RainSwallow.png',
    skinUrl: '/images/skins/RainSwallow.png',
    avatarSeed: 'kai',
  },
  {
    id: 'yulu_flash',
    name: 'Yulu_Flash',
    mcId: 'Yulu_Flash',
    role: '剧本创作',
    groups: ['剧本创作'],
    bio: '负责团队地图的剧情文本打磨、人物对话编排与章节线索串联，让每段探索都带着鲜活的温度与余韵。',
    featuredWork: '沉默乐章：错位音',
    avatarUrl: '/images/avatars/Yulu_Flash.png',
    skinUrl: '/images/skins/Yulu_Flash.png',
    avatarSeed: 'iris',
  },
  {
    id: 'dawn_dust',
    name: 'Dawn_dust',
    mcId: 'Dawn_dust',
    role: '剧本创作 / 数据包 / 美工',
    groups: ['剧本创作', '数据包', '美工'],
    bio: '跨界负责剧本统筹、原版数据包玩法实现与地图美术视觉设计，擅长把故事氛围直接融进交互机制与画面之中。',
    featuredWork: '沉默乐章：错位音',
    avatarUrl: '/images/avatars/Dawn_dust.png',
    skinUrl: '/images/skins/Dawn_dust.png',
    avatarSeed: 'zeno',
  },
  {
    id: 'carbonado404',
    name: 'Carbonado404',
    mcId: 'Carbonado404',
    role: '数据包 / 建筑',
    groups: ['数据包', '建筑'],
    bio: '专注原版数据包逻辑、机关演出系统与大型空间结构建造，让精巧的场景结构与可交互玩法自然咬合。',
    featuredWork: '时轮星阁',
    avatarUrl: '/images/avatars/Carbonado404.png',
    skinUrl: '/images/skins/Carbonado404.png',
    avatarSeed: 'nova',
  },
  {
    id: 'not_flz',
    name: 'Not_FLZ',
    mcId: 'Not_FLZ',
    role: '数据包 / 美工',
    groups: ['数据包', '美工'],
    bio: '负责数据包机制开发、界面与资源包美术绘制，打磨顺滑的交互手感与富有辨识度的视觉细节。',
    featuredWork: '天空之港',
    avatarUrl: '/images/avatars/Not_FLZ.png',
    skinUrl: '/images/skins/Not_FLZ.png',
    avatarSeed: 'lyra',
  },
  {
    id: 'mlxl_mili',
    name: 'MLXL_mili',
    mcId: 'MLXL_mili',
    role: '建筑',
    groups: ['建筑'],
    bio: '主理箱庭建筑群落、立体动线与场景氛围搭建，用丰富的结构层次和光影关系塑造极具故事感的探索舞台。',
    featuredWork: '翠影圣域',
    avatarUrl: '/images/avatars/MLXL_mili.png',
    skinUrl: '/images/skins/MLXL_mili.png',
    avatarSeed: 'sora',
  },
  {
    id: 'zhi_san520',
    name: 'Zhi_san520',
    mcId: 'Zhi_san520',
    role: '建筑',
    groups: ['建筑'],
    bio: '擅长细节内饰布置、地形衔接与环境造景，用书架、灯影与街头角落悄悄讲完故事之外的日常片段。',
    featuredWork: '灯影崖城',
    avatarUrl: '/images/avatars/Zhi_san520.png',
    skinUrl: '/images/skins/Zhi_san520.png',
    avatarSeed: 'ren',
  },
];

export const PORTFOLIO_PROJECTS: BuildProject[] = [
  {
    id: 'silent-movement',
    title: '沉默乐章：错位音',
    category: '叙事解谜',
    date: '2026-11',
    playTime: '约 90 分钟',
    players: '1–2 人',
    version: 'Java 1.21.4',
    buildersCount: 9,
    image: '/images/7B72BE4F12172E88A363666AF76CA9B7.png',
    summary:
      '一座停摆在午夜十二点的赤红剧场，失落乐章的碎片散落在错位的回忆与黑胶唱片之中。',
    story: [
      '《沉默乐章：错位音》是寄语 Couriers 推出的叙事解谜体验地图。玩家将踏入一座被红幕与旧时钟封存的剧场，通过搜集散落各处的错位唱片、拼合角色留下的零星记忆，让静止的时钟重新走动。',
      '地图结合原版资源包音频与数据包演出机制：每插入一张不同色标的黑胶唱片，剧场的空间结构、灯光色调与隐藏通道都会随之发生微妙变化。',
      '我们希望用音乐盒般的节拍感与细腻的室内交互，让解谜不再只是机械开关，而是一次与角色跨时空对话的阅读体验。',
    ],
    leadBuilderId: 'rainswallow',
  },
  {
    id: 'aetheris-skyport',
    title: '天空之港',
    category: '奇幻冒险',
    date: '2026-09',
    playTime: '约 2 小时',
    players: '1–4 人',
    version: 'Java 1.21.4',
    buildersCount: 12,
    image: '/images/project-skyport.jpg',
    summary:
      '横跨七座浮空岛的云端信使驿站，搭乘蒸汽飞艇穿梭空域，找回遗失在风中的七封信件。',
    story: [
      '《天空之港》是一张围绕“空中探索与传递”展开的开放箱庭冒险地图。七座层次错落的悬空岛屿由木质吊桥、飞艇航线与海晶石钟楼串联。',
      '玩家可在码头接取不同委托，解锁钩爪、风流滑翔等轻量化移动机制，在 100% 全内饰的商业街巷与浮空船坞间自由探索。',
    ],
    leadBuilderId: 'carbonado404',
  },
  {
    id: 'verdant-sanctum',
    title: '翠影圣域',
    category: '治愈探索',
    date: '2026-07',
    playTime: '约 60 分钟',
    players: '单人沉浸',
    version: 'Java 1.21.4',
    buildersCount: 5,
    image: '/images/project-sanctum.jpg',
    summary:
      '藏匿在千年密林深处的精灵遗迹，伴随林间微光与水流指引，完成一场安静的箱庭漫步。',
    story: [
      '《翠影圣域》去除了复杂的战斗压力，专注于“环境叙事与感官放松”。玩家沿苔藓石拱桥与琥珀暖灯前行，倾听森林留下的片段寄语。',
      '我们在林间布置了隐藏光源与细腻的环境声效，希望为忙碌之余打开 Minecraft 的玩家留出一片安静的喘息之地。',
    ],
    leadBuilderId: 'mlxl_mili',
  },
  {
    id: 'lantern-vale',
    title: '灯影崖城',
    category: '剧情探索',
    date: '2026-05',
    playTime: '约 75 分钟',
    players: '1–2 人',
    version: 'Java 1.21.4',
    buildersCount: 8,
    image: '/images/project-lantern.jpg',
    summary:
      '依山崖峭壁层叠而建的东方灯笼古城，在黄昏暮色与万家灯火之间揭开山巅茶坊的往事。',
    story: [
      '《灯影崖城》将垂直立体街区与剧情分支结合：从山脚渡口拾级而上，穿过悬崖飞瀑上的红漆廊桥，每一盏点亮的纸灯都对应一段居民故事。',
    ],
    leadBuilderId: 'zhi_san520',
  },
  {
    id: 'chronos-spire',
    title: '时轮星阁',
    category: '机关解谜',
    date: '2026-03',
    playTime: '约 100 分钟',
    players: '1–3 人',
    version: 'Java 1.21.1',
    buildersCount: 6,
    image: '/images/project-clockwork.jpg',
    summary:
      '齿轮与晶石驱动的机械星象台，通过调节五层螺旋图书馆的齿轮相位开启星穹密室。',
    story: [
      '《时轮星阁》聚焦于立体空间机关谜题。主塔外立面的巨大铜齿轮与内部图书馆联动，玩家需要观察星图与齿轮咬合规律，校准整座天文台的运转时间。',
    ],
    leadBuilderId: 'not_flz',
  },
  {
    id: 'solstice-citadel',
    title: '至日堡垒',
    category: '箱庭体验',
    date: '2026-01',
    playTime: '约 90 分钟',
    players: '1–4 人',
    version: 'Java 1.21.1',
    buildersCount: 7,
    image: '/images/project-citadel.jpg',
    summary:
      '矗立在石灰岩峭壁上的阳光海岸城邦，体验海港贸易、钟楼寻踪与夏日庆典支线。',
    story: [
      '在明快温暖的地中海街区里，玩家既可以按照主线在双子钟楼寻找线索，也可以在海岸集市帮助镇民筹备夏至庆典，感受充满烟火气的城邦生活。',
    ],
    leadBuilderId: 'dawn_dust',
  },
];

export function getMemberById(id: string): TeamMember {
  return TEAM_MEMBERS.find((m) => m.id === id) ?? TEAM_MEMBERS[0];
}
