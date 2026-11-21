import React, { useState } from 'react';
import { RoleGroup, TEAM_MEMBERS } from '../data/mockData';
import { MinecraftHead } from './MinecraftHead';

const GROUPS: Array<'全部' | RoleGroup> = ['全部', '剧本创作', '数据包', '建筑', '美工'];

export const MembersView: React.FC = () => {
  const [selected, setSelected] = useState<'全部' | RoleGroup>('全部');

  const members =
    selected === '全部'
      ? TEAM_MEMBERS
      : TEAM_MEMBERS.filter((m) => m.groups.includes(selected));

  return (
    <div className="min-h-screen bg-[#f5f6fb] pb-24 pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#333144]">
            团队成员
          </h1>

          <div className="flex flex-wrap gap-2" role="group" aria-label="按分工筛选成员">
            {GROUPS.map((group) => {
              const active = selected === group;
              return (
                <button
                  key={group}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(group)}
                  className={`min-h-12 min-w-12 touch-manipulation rounded-md px-2.5 text-sm font-semibold tracking-wide transition sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-1.5 sm:text-xs ${
                    active
                      ? 'border-2 border-[#333144] bg-[#333144] text-white'
                      : 'border-2 border-[#CFCFE5] bg-white text-[#333144]/75 hover:border-[#333144] hover:text-[#333144]'
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex min-h-28 flex-col justify-between gap-3 rounded-md border-2 border-[#CFCFE5] bg-white p-4 transition hover:border-[#333144] hover:shadow-lg hover:shadow-[#333144]/6 sm:min-h-[140px] sm:p-6"
            >
              <div className="flex items-center gap-4">
                <MinecraftHead
                  seed={member.mcId}
                  avatarUrl={member.avatarUrl}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-[#333144]">
                      {member.name}
                    </h2>
                    {member.isFounder && (
                      <span className="rounded border border-[#69699F]/40 bg-[#69699F]/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#69699F]">
                        发起者
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-[#69699F] sm:text-xs">
                    {member.role}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {member.groups.map((grp) => (
                  <span
                    key={grp}
                    className="rounded border border-[#CFCFE5] bg-[#f5f6fb] px-2 py-0.5 text-[11px] font-medium text-[#333144]/75"
                  >
                    {grp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
