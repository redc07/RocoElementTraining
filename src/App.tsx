/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { ATTRIBUTES, EFFECTIVENESS_MATRIX } from './constants';
import { Effectiveness } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, RotateCcw, Info, Check, X, Trophy, AlertTriangle } from 'lucide-react';

export default function App() {
  // state[atkIndex][defIndex] stores the user's selected effectiveness
  const [userMatrix, setUserMatrix] = useState<Effectiveness[][]>(
    Array(ATTRIBUTES.length).fill(null).map(() => Array(ATTRIBUTES.length).fill(Effectiveness.NORMAL))
  );
  const [isVerified, setIsVerified] = useState(false);

  const toggleCell = useCallback((atkIdx: number, defIdx: number) => {
    if (isVerified) return;
    
    setUserMatrix(prev => {
      const next = [...prev.map(row => [...row])];
      const current = next[atkIdx][defIdx];
      // Toggle logic: Normal (0) -> Super (1) -> Resisted (2) -> Normal (0)
      next[atkIdx][defIdx] = (current + 1) % 3 as Effectiveness;
      return next;
    });
  }, [isVerified]);

  const verifyResults = () => {
    setIsVerified(true);
  };

  const resetAll = () => {
    if (confirm('确定要清除所有进度吗？')) {
      setUserMatrix(Array(ATTRIBUTES.length).fill(null).map(() => Array(ATTRIBUTES.length).fill(Effectiveness.NORMAL)));
      setIsVerified(false);
    }
  };

  const continueTraining = () => {
    setIsVerified(false);
  };

  const getCellStatus = (atkIdx: number, defIdx: number) => {
    const userValue = userMatrix[atkIdx][defIdx];
    const trueValue = EFFECTIVENESS_MATRIX[atkIdx][defIdx];
    
    let trueEnum = Effectiveness.NORMAL;
    if (trueValue > 1) trueEnum = Effectiveness.SUPER;
    else if (trueValue < 1) trueEnum = Effectiveness.RESISTED;

    const isCorrect = userValue === trueEnum;
    return { userValue, trueEnum, isCorrect };
  };

  const stats = useMemo(() => {
    let correctCount = 0;
    const totalCount = ATTRIBUTES.length * ATTRIBUTES.length;
    let attemptedCount = 0;

    userMatrix.forEach((row, a) => {
      row.forEach((val, d) => {
        const { isCorrect } = getCellStatus(a, d);
        if (isCorrect) correctCount++;
        if (val !== Effectiveness.NORMAL) attemptedCount++;
      });
    });

    return { 
      correct: correctCount, 
      total: totalCount, 
      percent: Math.round((correctCount / totalCount) * 100), 
      attempted: attemptedCount 
    };
  }, [userMatrix]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#E2E8F0] font-sans flex flex-col" id="app-root">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 bg-[#1E293B] border-b border-[#334155] shadow-lg sticky top-0 z-50" id="main-header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#4F46E5] rounded flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-950/20">
            R
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase" id="app-title">
              洛克王国·属性克制训练系统
            </h1>
            <p className="text-[10px] text-[#94A3B8] font-mono tracking-widest" id="app-description">
              MASTER ATTRIBUTE COUNTER TABLE V1.0
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#10B981]" />
            <span className="text-[#94A3B8] font-medium">克制 (Strong)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-b-[12px] border-b-[#EF4444]" />
            <span className="text-[#94A3B8] font-medium">被克制 (Weak)</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
        {/* Stats Section Overlay-ish */}
        <AnimatePresence>
          {isVerified && (
            <motion.div
              id="stats-panel"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-[#1E293B] rounded-xl p-5 border border-[#334155] flex flex-col md:flex-row items-center gap-6 shadow-2xl"
            >
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-12 h-12 rounded-lg bg-[#4F46E5]/20 flex items-center justify-center text-[#6366F1]">
                  <Trophy size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Accuracy</div>
                  <div className="text-2xl font-bold text-white">{stats.percent}%</div>
                </div>
              </div>
              <div className="flex-1 w-full bg-[#334155] h-2 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percent}%` }}
                  className="absolute inset-0 bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                />
              </div>
              <div className="text-[#94A3B8] text-xs font-mono border-l border-[#334155] pl-6 hidden md:block">
                SUCCESS: {stats.correct} / {stats.total}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matrix Area */}
        <div className="flex-1 relative bg-[#1E293B] rounded-xl border border-[#334155] shadow-2xl overflow-hidden" id="matrix-container">
          <div className="absolute inset-0 overflow-auto scroll-smooth">
            <table className="w-full border-collapse table-fixed min-w-[1100px]" id="matrix-table">
              <thead className="sticky top-0 z-30">
                <tr>
                  <th className="w-20 h-10 border-r border-b border-[#334155] bg-[#334155] sticky left-0 z-40">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-[9px] text-[#94A3B8] uppercase font-bold transform -rotate-12">
                        Atk/Def
                      </div>
                    </div>
                  </th>
                  {ATTRIBUTES.map((attr) => (
                    <th key={`head-def-${attr.id}`} className="w-14 h-10 border-r border-b border-[#334155] bg-[#334155] p-1">
                      <div className="w-full h-full rounded bg-[#0F172A] border border-[#334155] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {attr.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ATTRIBUTES.map((atkAttr, aIdx) => (
                  <tr key={`row-${atkAttr.id}`} className="group">
                    <td className="w-20 h-10 border-r border-b border-[#334155] bg-[#334155] p-1 sticky left-0 z-20 group-hover:bg-[#475569] transition-colors">
                      <div className="w-full h-full rounded bg-[#0F172A] border border-[#334155] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {atkAttr.name}
                      </div>
                    </td>
                    {ATTRIBUTES.map((defAttr, dIdx) => {
                      const { userValue, trueEnum, isCorrect } = getCellStatus(aIdx, dIdx);
                      const isError = isVerified && !isCorrect;
                      const isCorrectFilled = isVerified && isCorrect && userValue !== Effectiveness.NORMAL;

                      return (
                        <td 
                          id={`cell-${atkAttr.id}-${defAttr.id}`}
                          key={`${atkAttr.id}-${defAttr.id}`}
                          onClick={() => toggleCell(aIdx, dIdx)}
                          className={`
                            h-10 border-r border-b border-[#334155] relative cursor-pointer
                            transition-all duration-150
                            ${isError ? 'bg-red-500/10 shadow-[inset_0_0_8px_rgba(239,68,68,0.3)]' : ''}
                            ${isCorrectFilled ? 'bg-emerald-500/5' : ''}
                            hover:bg-[#334155]
                          `}
                        >
                          <div className="w-full h-full flex items-center justify-center pointer-events-none relative scale-[0.85]">
                            {userValue === Effectiveness.SUPER && (
                              <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-6 h-6 rounded-full border-[3px] border-[#10B981]" 
                              />
                            )}
                            {userValue === Effectiveness.RESISTED && (
                              <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-bottom border-b-[19px] border-b-[#EF4444]" 
                              />
                            )}

                            {/* Indicators */}
                            {isVerified && !isCorrect && (
                              <div className="absolute -top-1 -right-1 text-red-500 scale-75">
                                <X size={10} strokeWidth={4} />
                              </div>
                            )}
                            {isVerified && isCorrect && userValue !== Effectiveness.NORMAL && (
                              <div className="absolute -top-1 -right-1 text-emerald-500 scale-75">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="p-6 bg-[#1e293b] border-t border-[#334155] flex flex-col md:flex-row justify-between items-center gap-6" id="footer-controls">
        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
          <div className="px-3 py-1 bg-[#0F172A] border border-[#334155] rounded-full text-[10px] font-mono text-[#6366F1] uppercase tracking-tighter transition-all">
            {isVerified ? 'STATUS: VALIDATION COMPLETE' : 'STATUS: READY FOR VALIDATION'}
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-widest">
            PROGRESS: {stats.attempted} / {stats.total} ({(stats.attempted/stats.total*100).toFixed(0)}%)
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            id="btn-reset"
            onClick={resetAll}
            className="flex-1 md:flex-none px-8 py-3 border border-[#334155] rounded-lg text-sm font-semibold text-[#94A3B8] hover:bg-[#334155] hover:text-white transition-all active:scale-95"
          >
            重置表格
          </button>
          {!isVerified ? (
            <button
              id="btn-verify"
              onClick={verifyResults}
              className="flex-1 md:w-56 px-10 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-sm font-bold shadow-xl shadow-indigo-950/40 transition-all active:scale-95"
            >
              点击验证 (Submit)
            </button>
          ) : (
            <button
              id="btn-edit"
              onClick={continueTraining}
              className="flex-1 md:w-56 px-10 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-sm font-bold shadow-xl shadow-emerald-950/20 transition-all active:scale-95"
            >
              继续修改 (Modify)
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
