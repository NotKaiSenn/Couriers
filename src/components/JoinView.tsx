import React from 'react';
import { ArrowUpRight, Compass, Hammer, Terminal } from 'lucide-react';

interface RequirementTrack {
  num: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  core: string[];
  bonus: string[];
}

const TRACKS: RequirementTrack[] = [
  {
    num: '1',
    title: '指令方向',
    icon: Terminal,
    core: [
      '拥有独立完成一张简单的小游戏地图的能力，熟练使用函数及execute，data等命令。',
    ],
    bonus: [
      '会使用数据包内其他内容可加分。',
      '拥有一定的内容策划能力可加分。',
      '能够提供已完成作品可加分。',
    ],
  },
  {
    num: '2',
    title: '建筑方向',
    icon: Hammer,
    core: ['拥有一定的建筑及自然造景能力，同时熟练使用worldedit插件。'],
    bonus: ['拥有一定的跑酷设计经验可加分。'],
  },
  {
    num: '3',
    title: '策划方向',
    icon: Compass,
    core: [
      '能够统筹策划一张较大的综合地图，并在已有的基础框架上完成内容设计且参与测试。',
      '拥有一定的独立游戏游玩经历，涉猎游戏类型范围较广。',
    ],
    bonus: [
      '拥有剧情创作能力可加分。',
      '拥有基础的指令或建筑能力可加分。',
    ],
  },
];

export const JoinView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FB] pb-24 pt-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#CFCFE5] pb-7">
          <h1 className="text-3xl font-black tracking-tight text-[#333144] sm:text-4xl">
            加入我们
          </h1>
        </div>

        {/* 3 Direction Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TRACKS.map((track) => {
            const Icon = track.icon;
            return (
              <section
                key={track.num}
                className="flex flex-col rounded-md border-2 border-[#333144] bg-white p-6 shadow-lg shadow-[#333144]/6 transition duration-200 hover:-translate-y-0.5 sm:p-7"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b-2 border-[#CFCFE5]/70 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-[#333144] text-sm font-black text-[#F5F6FB]">
                      {track.num}
                    </span>
                    <h2 className="text-xl font-extrabold tracking-wide text-[#333144]">
                      {track.title}
                    </h2>
                  </div>
                  <Icon className="h-5 w-5 text-[#69699F]" />
                </div>

                {/* Core Requirements */}
                <div className="mt-5 space-y-3">
                  {track.core.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-sm font-medium leading-7 text-[#333144]"
                    >
                      <span className="mt-2.5 h-2 w-2 shrink-0 bg-[#333144]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Bonus Items */}
                <div className="mt-6 border-t border-[#CFCFE5]/70 pt-4">
                  <ul className="space-y-2.5">
                    {track.bonus.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs leading-6 text-[#333144]/75 sm:text-sm sm:leading-6"
                      >
                        <span className="mt-0.5 shrink-0 rounded bg-[#69699F]/15 px-1.5 py-0.5 text-[11px] font-bold leading-none text-[#69699F]">
                          +
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact: QQ Group */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-md border-2 border-[#333144] bg-white p-6 shadow-md shadow-[#333144]/6 sm:flex-row sm:items-center sm:p-7">
          <div>
            <div className="text-base font-extrabold text-[#333144]">
              联系我们
            </div>
            <p className="mt-1 text-sm text-[#333144]/75">
              欢迎加入 QQ 交流群：<span className="font-bold text-[#333144]">212154050</span>
            </p>
          </div>
          <a
            href="https://qm.qq.com/q/97UVC3aEA8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-[#333144] bg-[#12B7F5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2EC2F8]"
          >
            <span>加入 QQ 群</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
