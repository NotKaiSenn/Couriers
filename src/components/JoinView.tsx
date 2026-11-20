import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { MinecraftHead } from './MinecraftHead';

const ROLES = [
  {
    id: 'design',
    title: '关卡与叙事策划',
    desc: '负责原创体验地图的剧本立意、章节流程、谜题与玩家引导设计。',
  },
  {
    id: 'build',
    title: '场景与箱庭建筑',
    desc: '熟悉 Axiom / WorldEdit，擅长打造具有戏剧氛围与可探索内饰的场景。',
  },
  {
    id: 'tech',
    title: '数据包与技术演出',
    desc: '熟悉 Minecraft 原版数据包、指令演出、自定义机制与音频调度。',
  },
  {
    id: 'visual',
    title: '光影、音频与宣发',
    desc: '负责光影调色、资源包声效、3D 渲染出图或实机宣传影片剪辑。',
  },
];

export const JoinView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('design');
  const [mcId, setMcId] = useState('');
  const [contact, setContact] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [intro, setIntro] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcId.trim() || !contact.trim()) return;
    setSubmittedCode(`CR-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] pb-24 pt-24">
      <div className="mx-auto max-w-4xl space-y-10 px-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#333144]">
          加入寄语 Couriers
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLES.map((role) => {
            const active = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`rounded-md border-2 bg-white p-5 text-left transition ${
                  active
                    ? 'border-[#333144] shadow-md shadow-[#333144]/8'
                    : 'border-[#CFCFE5] hover:border-[#69699F]'
                }`}
              >
                <div className="text-sm font-bold text-[#333144]">
                  {role.title}
                </div>
                <p className="mt-2 text-xs leading-6 text-[#333144]/70">
                  {role.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-md border-2 border-[#CFCFE5] bg-white p-6 sm:p-8">
          {submittedCode ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-11 w-11 text-[#69699F]" />
              <h2 className="mt-4 text-xl font-bold text-[#333144]">
                申请已收到
              </h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-[#333144]/70">
                感谢 {mcId} 的投递，我们会通过你填写的联系方式尽快与你沟通。
              </p>
              <div className="mt-5 rounded-md border-2 border-[#CFCFE5] bg-[#f5f6fb] px-5 py-2 text-sm font-bold text-[#333144]">
                回执编号：{submittedCode}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmittedCode(null);
                  setMcId('');
                  setContact('');
                  setPortfolioUrl('');
                  setIntro('');
                }}
                className="mt-6 text-xs font-semibold text-[#69699F] hover:underline"
              >
                再次填写
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#333144]">
                    Minecraft ID *
                  </label>
                  <div className="flex items-center gap-3">
                    <MinecraftHead seed={mcId.trim() || 'kai'} size={40} />
                    <input
                      type="text"
                      required
                      value={mcId}
                      onChange={(e) => setMcId(e.target.value)}
                      placeholder="你的游戏昵称"
                      className="w-full rounded-md border-2 border-[#CFCFE5] bg-[#f5f6fb]/60 px-3.5 py-2 text-sm text-[#333144] outline-none transition focus:border-[#333144] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#333144]">
                    联系方式（QQ / 邮箱 / Discord）*
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="用于后续联系"
                    className="w-full rounded-md border-2 border-[#CFCFE5] bg-[#f5f6fb]/60 px-3.5 py-2 text-sm text-[#333144] outline-none transition focus:border-[#333144] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#333144]">
                  作品链接（Bilibili / 截图相册 / 仓库）
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border-2 border-[#CFCFE5] bg-[#f5f6fb]/60 px-3.5 py-2 text-sm text-[#333144] outline-none transition focus:border-[#333144] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#333144]">
                  个人简介
                </label>
                <textarea
                  rows={4}
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="简单聊聊你参与过的地图项目或擅长的方向..."
                  className="w-full rounded-md border-2 border-[#CFCFE5] bg-[#f5f6fb]/60 px-3.5 py-2 text-sm text-[#333144] outline-none transition focus:border-[#333144] focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[#333144]/60">
                  申请方向：
                  <strong className="ml-1 text-[#333144]">
                    {ROLES.find((r) => r.id === selectedRole)?.title}
                  </strong>
                </span>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#333144] bg-[#69699F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333144]"
                >
                  <span>提交申请</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
