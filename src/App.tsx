/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { ATTRIBUTES, EFFECTIVENESS_MATRIX } from './constants';
import { Effectiveness } from './types';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { 
  CheckCircle2, RotateCcw, Info, Check, X, Trophy, AlertTriangle,
  Circle, Leaf, Flame, Droplets, Sun, Mountain, Snowflake, Zap, Atom, Bug, Hand, Feather, Heart, Ghost, Moon, Settings, Disc 
} = Icons;

const IconMap: Record<string, any> = {
  Circle, Leaf, Flame, Droplets, Sun, Mountain, Snowflake, Zap, Atom, Bug, Hand, Feather, Heart, Ghost, Moon, Settings, Disc 
};

export default function App() {
  // state[atkIndex][defIndex] stores the user's selected effectiveness
  const [userMatrix, setUserMatrix] = useState<Effectiveness[][]>(
    Array(ATTRIBUTES.length).fill(null).map(() => Array(ATTRIBUTES.length).fill(Effectiveness.NORMAL))
  );
  const [isVerified, setIsVerified] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showFillConfirm, setShowFillConfirm] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const toggleCell = useCallback((atkIdx: number, defIdx: number) => {
    if (isVerified || isAutoFilled) return;
    
    setUserMatrix(prev => {
      const next = [...prev.map(row => [...row])];
      const current = next[atkIdx][defIdx];
      // Toggle logic: Normal (0) -> Super (1) -> Resisted (2) -> Normal (0)
      next[atkIdx][defIdx] = (current + 1) % 3 as Effectiveness;
      return next;
    });
  }, [isVerified, isAutoFilled]);

  const verifyResults = () => {
    setIsVerified(true);
    setShowRank(true);
  };

  const [resetCounter, setResetCounter] = useState(0);

  const resetAll = useCallback(() => {
    setUserMatrix(Array.from({ length: ATTRIBUTES.length }, () => 
      new Array(ATTRIBUTES.length).fill(Effectiveness.NORMAL)
    ));
    setIsVerified(false);
    setShowAnswers(false);
    setIsAutoFilled(false);
    setResetCounter(prev => prev + 1);
  }, []);

  const fillCorrectAnswers = () => {
    const newMatrix = Array(ATTRIBUTES.length).fill(null).map((_, aIdx) => 
      Array(ATTRIBUTES.length).fill(null).map((_, dIdx) => {
        const val = EFFECTIVENESS_MATRIX[aIdx][dIdx];
        if (val > 1) return Effectiveness.SUPER;
        if (val < 1) return Effectiveness.RESISTED;
        return Effectiveness.NORMAL;
      })
    );
    setUserMatrix(newMatrix);
    setIsAutoFilled(true);
    setShowFillConfirm(false);
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

  const mistakesList = useMemo(() => {
    const list: Array<{ atkIdx: number, defIdx: number, userValue: Effectiveness, trueEnum: Effectiveness }> = [];
    userMatrix.forEach((row, a) => {
      row.forEach((val, d) => {
        const { isCorrect, userValue, trueEnum } = getCellStatus(a, d);
        if (!isCorrect) {
          list.push({ atkIdx: a, defIdx: d, userValue, trueEnum });
        }
      });
    });
    return list;
  }, [userMatrix, isVerified]);

  const renderEffectIndicator = (e: Effectiveness) => {
    if (e === Effectiveness.SUPER) {
      return <div className="w-4 h-4 rounded-full border-2 border-[#10B981] inline-block align-middle" />;
    }
    if (e === Effectiveness.RESISTED) {
      return <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#EF4444] inline-block align-middle" />;
    }
    return <span className="text-[#94A3B8] font-bold">普通</span>;
  };

  const getRankInfo = (percent: number) => {
    if (percent === 100) return { rank: "神圣大祭司", comment: "无可挑剔！你对全系克制了如指掌，已达洛克世界的巅峰境界！", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", icon: <Icons.Trophy className="text-amber-400" size={48} /> };
    if (percent >= 95) return { rank: "皇家大法师", comment: "惊人的表现！你几乎掌握了所有的奥秘，仅剩毫厘即可封神。", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", icon: <Icons.Star className="text-purple-400" size={48} /> };
    if (percent >= 85) return { rank: "资深探险家", comment: "非常优秀！绝大多数属性已经难不住你了，继续保持！", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", icon: <Icons.ShieldCheck className="text-blue-400" size={48} /> };
    if (percent >= 71) return { rank: "进阶学徒", comment: "合格的表现。你已经掌握了基础克制，还需加强冷门属性的记忆。", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: <Icons.BookOpen className="text-emerald-400" size={48} /> };
    return { rank: "属性初学者", comment: "路漫漫其修远兮，看来你还需要多在王国森林里历练一番呢！", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30", icon: <Icons.Ghost className="text-slate-400" size={48} /> };
  };

  const shareResult = () => {
    const rank = getRankInfo(stats.percent).rank;
    const text = `我在【洛克王国世界属性克制训练系统】中获得了【${rank}】评价，正确率达 ${stats.percent}%！属性大师就是我，不服来挑战！\n挑战链接：https://roco-training.netlify.app/`;
    
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const toastMessage = "🎉 分享链接已复制到剪贴板，快去分享吧！";

  const exportMistakesToExcel = async () => {
    if (mistakesList.length === 0) return;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('我的错题集');

    // 1. Add Metadata Info
    const metaData = [
      ["测试项目：", "洛克王国世界属性克制训练"],
      ["测试结果：", `正确率 ${stats.percent}% (${stats.correct}/${stats.total})`],
      ["测试时间：", new Date().toLocaleString()],
      ["测试链接：", "https://roco-training.netlify.app/"],
    ];

    metaData.forEach((row, i) => {
      const r = worksheet.addRow(row);
      r.getCell(1).font = { bold: true, color: { argb: 'FF4F46E5' }, size: 11 };
      r.getCell(2).font = { size: 11 };
    });

    worksheet.addRow([]); // Blank row

    // 2. Add Table Headers
    const headerRow = worksheet.addRow(["序号", "攻击方属性", "防御方属性", "你的选择", "正确答案"]);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // 3. Add Data Rows
    mistakesList.forEach((mistake, idx) => {
      const getEffectName = (e: Effectiveness) => {
        if (e === Effectiveness.SUPER) return "克制 (○)";
        if (e === Effectiveness.RESISTED) return "被克制 (▽)";
        return "普通";
      };

      const row = worksheet.addRow([
        idx + 1,
        ATTRIBUTES[mistake.atkIdx].name,
        ATTRIBUTES[mistake.defIdx].name,
        getEffectName(mistake.userValue),
        getEffectName(mistake.trueEnum)
      ]);

      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Specific coloring for choice and answer columns
        if (colNumber === 4 || colNumber === 5) {
          const val = cell.value ? cell.value.toString() : '';
          if (val.includes('克制 (○)')) {
            cell.font = { color: { argb: 'FF10B981' }, bold: true }; // Green
          } else if (val.includes('被克制 (▽)')) {
            cell.font = { color: { argb: 'FFEF4444' }, bold: true }; // Red
          } else if (val.includes('普通')) {
            cell.font = { color: { argb: 'FF64748B' } }; // Dark Gray (Slate-500)
          }
        }
      });
    });

    // 4. Adjust Column Widths
    worksheet.getColumn(1).width = 12;
    worksheet.getColumn(2).width = 18;
    worksheet.getColumn(3).width = 18;
    worksheet.getColumn(4).width = 22;
    worksheet.getColumn(5).width = 22;

    // 5. Generate and Save File
    const now = new Date();
    const formattedDate = now.getFullYear().toString() + 
                         (now.getMonth() + 1).toString().padStart(2, '0') + 
                         now.getDate().toString().padStart(2, '0') + 
                         now.getHours().toString().padStart(2, '0') + 
                         now.getMinutes().toString().padStart(2, '0');
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `洛克王国世界属性训练错题集_${stats.percent}分_${formattedDate}.xlsx`);
  };

  return (
    <div className="h-screen bg-[#0F172A] text-[#E2E8F0] font-sans flex flex-col overflow-hidden" id="app-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none"
          >
            <div className="bg-[#10B981] text-white px-6 py-3 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center gap-3 border border-emerald-400/50 backdrop-blur-sm">
              <Icons.CheckCircle2 size={18} />
              <span className="text-sm font-bold tracking-wide">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fill Answers Confirm Modal */}
      <AnimatePresence>
        {showFillConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowFillConfirm(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1E293B] w-full max-w-sm rounded-2xl border border-[#334155] shadow-2xl p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">确定要填入正确答案吗？</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                这将覆盖您当前的所有填写。自动填入后将无法进行验证评分。
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowFillConfirm(false)}
                  className="flex-1 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-xl font-bold transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={fillCorrectAnswers}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all"
                >
                  确定填入
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-2 bg-[#1E293B] border-b border-[#334155] shadow-lg sticky top-0 z-50 shrink-0" id="main-header">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-[#4F46E5] rounded flex items-center justify-center font-bold text-base md:text-lg text-white shadow-lg">
            R
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-white uppercase whitespace-nowrap" id="app-title">
              洛克王国世界属性训练系统
            </h1>
            <p className="hidden xs:block text-[6px] md:text-[8px] text-[#94A3B8] font-mono tracking-widest leading-none">
              MASTER ATTRIBUTE COUNTER TABLE V1.0
            </p>
          </div>
        </div>
        <div className="flex gap-3 md:gap-6 text-[10px] md:text-xs">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-[#10B981]" />
            <span className="text-[#94A3B8] font-medium">克制</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="w-0 h-0 border-l-[4px] md:border-l-[6px] border-l-transparent border-r-[4px] md:border-r-[6px] border-r-transparent border-t-[7px] md:border-t-[10px] border-t-[#EF4444]" />
            <span className="text-[#94A3B8] font-medium">被克制</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-3 flex flex-col gap-2 md:gap-3 min-h-0 overflow-hidden">
        {/* Matrix Area */}
        <div className="flex-1 relative bg-[#1E293B] rounded-xl border border-[#334155] shadow-2xl overflow-auto custom-scrollbar" id="matrix-container">
          <div className="w-full h-full min-w-[1000px] md:min-w-[1200px] min-h-[500px]">
            <table key={resetCounter} className="w-full min-h-full border-collapse table-fixed select-none" id="matrix-table">
              <thead>
                <tr className="h-10 md:h-12 lg:h-[5.26%]">
                  <th className="w-[8%] border-r border-b border-[#334155] bg-[#334155] relative overflow-hidden">
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <svg className="w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#475569" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="absolute top-[8%] right-[8%] text-[clamp(11px,0.8vw,16px)] text-white/90 font-black leading-none z-10 pointer-events-none">
                      防御
                    </div>
                    <div className="absolute bottom-[8%] left-[8%] text-[clamp(11px,0.8vw,16px)] text-white/90 font-black leading-none z-10 pointer-events-none">
                      攻击
                    </div>
                  </th>
                  {ATTRIBUTES.map((attr) => {
                    const AttrIcon = IconMap[attr.iconName] || Circle;
                    return (
                      <th key={`head-def-${attr.id}`} className="border-r border-b border-[#334155] bg-[#334155] p-0.5">
                        <div className="w-full h-full rounded bg-[#0F172A] border border-[#334155] flex flex-col items-center justify-center">
                          <AttrIcon className="w-[45%] h-[45%] mb-[2%]" color={attr.color} strokeWidth={2.5} />
                          <span className="text-[clamp(12px,1.2vw,32px)] font-black text-white uppercase leading-none">
                            {attr.name}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="h-auto">
                {ATTRIBUTES.map((atkAttr, aIdx) => (
                  <tr key={`row-${atkAttr.id}`} className="h-10 md:h-12 lg:h-[5.26%] group">
                    <td className="border-r border-b border-[#334155] bg-[#334155] p-0.5 group-hover:bg-[#475569] transition-colors relative">
                      <div className="w-full h-full rounded bg-[#0F172A] border border-[#334155] flex items-center justify-center md:justify-between px-[10%] text-[clamp(12px,1.2vw,32px)] font-black text-white uppercase overflow-hidden">
                        {(() => {
                          const AttrIcon = IconMap[atkAttr.iconName] || Circle;
                          return <AttrIcon className="w-[clamp(16px,1.8vw,48px)] h-[clamp(16px,1.8vw,48px)]" color={atkAttr.color} strokeWidth={2.5} />;
                        })()}
                        <span className="hidden md:inline">{atkAttr.name}</span>
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
                            border-r border-b border-[#334155] relative overflow-hidden
                            transition-all duration-150
                            ${(isVerified || isAutoFilled) ? 'cursor-default' : 'cursor-pointer hover:bg-[#334155]'}
                            ${isError ? 'bg-red-500/10 shadow-[inset_0_0_8px_rgba(239,68,68,0.3)]' : ''}
                            ${isCorrectFilled ? 'bg-emerald-500/5' : ''}
                          `}
                        >
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* User Selected Icons */}
                            {userValue === Effectiveness.SUPER && (
                              <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className={`w-[clamp(14px,1.8vw,48px)] aspect-square rounded-full border-[clamp(2px,0.3vw,8px)] border-[#10B981] ${showAnswers && trueEnum !== Effectiveness.SUPER ? 'opacity-20' : ''}`} 
                              />
                            )}
                            {userValue === Effectiveness.RESISTED && (
                              <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                style={{
                                  width: 0,
                                  height: 0,
                                  borderLeft: 'clamp(7px, 0.9vw, 24px) solid transparent',
                                  borderRight: 'clamp(7px, 0.9vw, 24px) solid transparent',
                                  borderTop: 'clamp(12px, 1.6vw, 42px) solid #EF4444',
                                }}
                                className={showAnswers && trueEnum !== Effectiveness.RESISTED ? 'opacity-20' : ''}
                              />
                            )}

                            {/* Correct Answer Overlays (if showAnswers is ON) */}
                            {showAnswers && trueEnum === Effectiveness.SUPER && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[clamp(14px,1.8vw,48px)] aspect-square rounded-full border-[clamp(3px,0.4vw,12px)] border-emerald-400 shadow-[0_0_1vw_rgba(52,211,153,0.7)] z-10" />
                              </div>
                            )}
                            {showAnswers && trueEnum === Effectiveness.RESISTED && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div 
                                  style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: 'clamp(7px, 0.9vw, 24px) solid transparent',
                                    borderRight: 'clamp(7px, 0.9vw, 24px) solid transparent',
                                    borderTop: 'clamp(12px, 1.6vw, 42px) solid #F87171',
                                    filter: 'drop-shadow(0 0 0.6vw rgba(248,113,113,0.7))'
                                  }}
                                  className="z-10"
                                />
                              </div>
                            )}
                            {showAnswers && trueEnum === Effectiveness.NORMAL && userValue !== Effectiveness.NORMAL && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-70">
                                <div className="text-[clamp(8px,0.8vw,20px)] font-black text-slate-400 uppercase bg-slate-800 px-[8%] py-[4%] rounded-lg border-[1px] border-slate-700">普通</div>
                              </div>
                            )}

                            {/* Indicators */}
                            {isVerified && !isCorrect && (
                              <div className="absolute top-[5%] right-[5%] text-red-500 opacity-60">
                                <X className="w-[1vw] h-[1vw] min-w-[8px] min-h-[8px]" strokeWidth={4} />
                              </div>
                            )}
                            {isVerified && isCorrect && userValue !== Effectiveness.NORMAL && (
                              <div className="absolute top-[5%] right-[5%] text-emerald-500 opacity-60">
                                <Check className="w-[1vw] h-[1vw] min-w-[8px] min-h-[8px]" strokeWidth={4} />
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

      {/* Footer Controls & Usage Guide */}
      <footer className="px-3 py-3 md:p-4 bg-[#1e293b] border-t border-[#334155] shrink-0" id="footer-controls">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
            <div className="px-2 py-0.5 bg-[#0F172A] border border-[#334155] rounded-full text-[8px] md:text-[10px] font-mono text-[#6366F1] uppercase tracking-tighter transition-all">
              {isVerified ? 'STATUS: VALIDATION COMPLETE' : 'STATUS: READY'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {isVerified && (
              <div className="mr-3 flex flex-col items-end">
                <span className="text-[8px] text-[#94A3B8] font-bold uppercase tracking-widest">Score</span>
                <span className="text-xl md:text-2xl font-black text-[#10B981] leading-none">{stats.percent}%</span>
              </div>
            )}
            <button
              id="btn-auto-fill"
              onClick={() => {
                if (isVerified || isAutoFilled) return;
                if (stats.attempted === 0) {
                  fillCorrectAnswers();
                } else {
                  setShowFillConfirm(true);
                }
              }}
              disabled={isVerified || isAutoFilled}
              className={`flex-1 md:flex-none px-3 py-1.5 md:px-6 md:py-2 border rounded-lg text-xs md:text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                isVerified || isAutoFilled 
                ? 'opacity-30 cursor-not-allowed border-[#334155] text-[#475569]' 
                : 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10'
              }`}
            >
              <Icons.Zap size={14} />
              <span className="whitespace-nowrap">自动填入</span>
            </button>

            <button
              id="btn-reset"
              onClick={resetAll}
              className="flex-1 md:flex-none px-3 py-1.5 md:px-6 md:py-2 border border-[#334155] rounded-lg text-xs md:text-sm font-semibold text-[#94A3B8] hover:bg-[#334155] hover:text-white transition-all active:scale-95 whitespace-nowrap"
            >
              重置表格
            </button>
            
            {isVerified && (
              <button
                id="btn-mistakes"
                onClick={() => setShowMistakes(true)}
                className="flex-1 md:flex-none px-3 py-1.5 md:px-6 md:py-2 border border-[#334155] rounded-lg text-xs md:text-sm font-semibold text-[#F87171] hover:bg-[#452222] hover:text-red-400 transition-all active:scale-95 whitespace-nowrap"
              >
                我的错题
              </button>
            )}

            {isVerified && (
              <button
                id="btn-show-answers"
                onClick={() => setShowAnswers(!showAnswers)}
                className={`flex-1 md:flex-none px-3 py-1.5 md:px-6 md:py-2 border rounded-lg text-xs md:text-sm font-bold transition-all active:scale-95 shadow-lg whitespace-nowrap ${
                  showAnswers 
                  ? 'bg-[#6366F1] border-[#818CF8] text-white shadow-indigo-500/20' 
                  : 'bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:border-[#475569] hover:text-white'
                }`}
              >
                {showAnswers ? '隐藏答案' : '查看答案'}
              </button>
            )}

            {!isVerified ? (
              <button
                id="btn-verify"
                onClick={verifyResults}
                disabled={isAutoFilled}
                className={`flex-1 md:w-48 px-4 py-1.5 md:px-10 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-xl transition-all active:scale-95 ${
                  isAutoFilled 
                  ? 'bg-slate-700 text-slate-500 shadow-none' 
                  : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-950/40'
                }`}
              >
                点击验证 (Submit)
              </button>
            ) : (
              <button
                id="btn-edit"
                onClick={continueTraining}
                className="flex-1 md:w-48 px-4 py-1.5 md:px-10 md:py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs md:text-sm font-bold shadow-xl shadow-emerald-950/20 transition-all active:scale-95"
              >
                继续修改 (Modify)
              </button>
            )}
          </div>
        </div>

        {/* Usage Guide Section - Hidden on mobile/tablet, visible on large screens */}
        <div className="hidden lg:grid grid-cols-4 gap-4 pt-4 border-t border-[#334155]/50 text-[#94A3B8]">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-xs font-bold text-white">1</div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1">点选关系</h4>
              <p className="text-[10px] leading-relaxed">点击网格中的任何单元格进行切换：一击为<span className="text-[#10B981]">克制 (○)</span>，再击为<span className="text-[#EF4444]">被克制 (△)</span>，三击回到普通倍数。</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-xs font-bold text-white">2</div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1">提交验证</h4>
              <p className="text-[10px] leading-relaxed">完成填写后，点击右下角<span className="text-white font-bold">【点击验证】</span>。系统会自动标记所有错误选项（以红色呼吸光效示警）。</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-xs font-bold text-white">3</div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1">对照答案</h4>
              <p className="text-[10px] leading-relaxed">验证后可点击<span className="text-white font-bold">【查看正确答案】</span>，对比自己的选择。若实际关系为“普通”则会显示文字提示。</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-xs font-bold text-white">4</div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1">持续进阶</h4>
              <p className="text-[10px] leading-relaxed">点击<span className="text-[#10B981] font-bold">继续修改</span>修正错误，或使用<span className="text-white font-bold">重置表格</span>重新开始，直至完成 324 个格点的全对大挑战！</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mistakes Modal */}
      <AnimatePresence>
        {showMistakes && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowMistakes(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1E293B] w-full max-w-2xl max-h-full rounded-2xl border border-[#334155] shadow-2xl flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <AlertTriangle size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-white">本次错题统计 ({mistakesList.length})</h3>
                </div>
                <button 
                  onClick={() => setShowMistakes(false)}
                  className="p-2 hover:bg-[#334155] rounded-lg text-[#94A3B8] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {mistakesList.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Trophy size={32} />
                    </div>
                    <p className="text-[#94A3B8]">全对了！你真是个属性专家！</p>
                  </div>
                ) : (
                  mistakesList.map((mistake, idx) => {
                    const atkAttr = ATTRIBUTES[mistake.atkIdx];
                    const defAttr = ATTRIBUTES[mistake.defIdx];
                    return (
                      <div key={idx} className="p-4 bg-[#0F172A] rounded-xl border border-[#334155] text-sm leading-relaxed">
                        <div className="flex gap-4 items-start">
                          <span className="text-[#6366F1] font-mono shrink-0 pt-1">{idx + 1}.</span>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-1 text-[#E2E8F0]">
                              <span>你的选择：</span>
                              <span className="font-bold underline underline-offset-4 decoration-[#334155]">{atkAttr.name}</span>
                              <span className="text-[#94A3B8] mx-1">对</span>
                              <span className="font-bold underline underline-offset-4 decoration-[#334155]">{defAttr.name}</span>
                              <span className="ml-1">{renderEffectIndicator(mistake.userValue)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-emerald-400 font-medium">
                              <span>正确答案：</span>
                              <span className="font-bold underline underline-offset-4 decoration-emerald-500/30">{atkAttr.name}</span>
                              <span className="text-emerald-500/50 mx-1">对</span>
                              <span className="font-bold underline underline-offset-4 decoration-emerald-500/30">{defAttr.name}</span>
                              <span className="ml-1">{renderEffectIndicator(mistake.trueEnum)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="px-6 py-4 bg-[#0F172A]/50 border-t border-[#334155] flex justify-between items-center shrink-0">
                {mistakesList.length > 0 ? (
                  <button 
                    onClick={exportMistakesToExcel}
                    className="px-6 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    <Icons.FileSpreadsheet size={16} />
                    导出错题集 (Excel)
                  </button>
                ) : <div />}
                
                <button 
                  onClick={() => setShowMistakes(false)}
                  className="px-8 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-sm font-bold transition-all active:scale-95"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rank Result Modal */}
      <AnimatePresence>
        {showRank && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowRank(false)}
          >
            <motion.div 
              initial={{ scale: 0.85, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 40 }}
              className="bg-[#1E293B] w-full max-w-md rounded-2xl border border-[#334155] shadow-2xl flex flex-col overflow-hidden text-center overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="pt-10 pb-6 flex flex-col items-center gap-6">
                <motion.div 
                  initial={{ rotate: -15, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                >
                  {getRankInfo(stats.percent).icon}
                </motion.div>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.3em]">Evaluation Result</span>
                  <h2 className={`text-3xl font-black ${getRankInfo(stats.percent).color}`}>
                    {getRankInfo(stats.percent).rank}
                  </h2>
                </div>
              </div>

              <div className="px-8 space-y-6">
                <div className={`py-4 rounded-xl border ${getRankInfo(stats.percent).bg} ${getRankInfo(stats.percent).border}`}>
                  <div className="text-4xl font-black text-white leading-none">
                    {stats.percent}<span className="text-lg ml-1 opacity-50">%</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-bold uppercase mt-2 tracking-widest">Accuracy Score</div>
                </div>

                <div className="bg-[#0F172A] p-6 rounded-xl border border-[#334155] relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#4F46E5]" />
                   <p className="text-sm text-[#E2E8F0] leading-relaxed italic">
                     "{getRankInfo(stats.percent).comment}"
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-[#94A3B8]">
                  <div className="p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div className="text-white opacity-40 mb-1">正确</div>
                    <div className="text-lg text-emerald-400">{stats.correct} / {stats.total}</div>
                  </div>
                  <div className="p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
                    <div className="text-white opacity-40 mb-1">错误</div>
                    <div className="text-lg text-red-400">{stats.total - stats.correct}</div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 mt-4">
                {stats.percent === 100 ? (
                  <button 
                    onClick={() => setShowRank(false)}
                    className="w-full py-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-black tracking-widest shadow-xl shadow-indigo-950/40 transition-all active:scale-95 uppercase text-sm"
                  >
                    太强了，退隐江湖
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowRank(false)}
                      className="flex-1 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-xl font-bold transition-all active:scale-95 text-xs"
                    >
                      关闭
                    </button>
                    <button 
                      onClick={shareResult}
                      className="flex-1 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold transition-all active:scale-95 text-xs flex items-center justify-center gap-2"
                    >
                      <Icons.Share2 size={14} />
                      去分享
                    </button>
                    <button 
                      onClick={() => {
                        setShowRank(false);
                        setShowMistakes(true);
                      }}
                      className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-bold transition-all active:scale-95 text-xs"
                    >
                      我的错题
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
