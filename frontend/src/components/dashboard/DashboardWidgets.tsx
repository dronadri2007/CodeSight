/* CodeSight — Code Execution Sharp Lightning Graph Visualization
   Theme: Obsidian (#0B0A0F) + Deep Plum (#17121C) + Burnt Orange (#C96A32) + Bright Orange (#E58A45) + Soft Lavender (#C9A7FF) + Cream (#F5EFE6)
*/
import React, { useState } from 'react';
import { ArrowRight, Crosshair, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { weeklyActivity, monthlyActivity, WeeklyActivityPoint } from '@/data/codesight';

const chartTop = 28;
const chartBottom = 195;
const chartLeft = 54;
const chartRight = 686;
const chartWidth = 720;
const chartH = 250;

/**
 * Builds sharp, point-to-point straight angular segments between data points.
 * Creates direct angular telemetry traces with 0 curve smoothing.
 */
function buildLightningPath(pts: Array<{ x: number; y: number }>) {
  if (!pts.length) return '';
  return pts.reduce((path, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`), '');
}

export function PremiumActivityChart() {
  const [active, setActive] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const dataset: WeeklyActivityPoint[] = timeRange === '7d' ? weeklyActivity : monthlyActivity;

  // Empty state check
  if (!dataset || dataset.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-[12px] border border-[#2E2238] bg-[#17121C] p-10 text-center shadow-sm">
        <Zap size={28} className="mb-3 text-[#C96A32] opacity-60" />
        <h3 className="display text-base font-semibold text-[#F5EFE6]">No performance data yet.</h3>
        <p className="mt-1 text-xs text-[#AAA2B5]">Complete your first exercise to start tracking your efficiency.</p>
      </div>
    );
  }

  const points = dataset.map((item, index) => {
    const x = chartLeft + (index * (chartRight - chartLeft)) / Math.max(dataset.length - 1, 1);
    const y = chartBottom - (item.value / 100) * (chartBottom - chartTop);
    const timeComp = item.value >= 80 ? 'O(1)' : item.value >= 50 ? 'O(n)' : 'O(n²)';
    const spaceComp = item.value >= 60 ? 'O(1)' : 'O(n)';
    return { ...item, x, y, timeComp, spaceComp };
  });

  const lightningLinePath = buildLightningPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = firstPoint && lastPoint ? `${lightningLinePath} L ${lastPoint.x} ${chartBottom} L ${firstPoint.x} ${chartBottom} Z` : '';
  const activePoint = active === null ? null : points[active];

  // Optimal benchmark target Y (90% efficiency level)
  const targetY = chartBottom - 0.9 * (chartBottom - chartTop);
  const benchmarkPath = `M ${chartLeft} ${targetY} L ${chartRight} ${targetY}`;

  const gridLevels = [
    { label: '100%', y: chartTop },
    { label: '75%', y: chartTop + (chartBottom - chartTop) * 0.25 },
    { label: '50%', y: chartTop + (chartBottom - chartTop) * 0.5 },
    { label: '25%', y: chartTop + (chartBottom - chartTop) * 0.75 },
    { label: '0%', y: chartBottom },
  ];

  const avgValue = Math.round(dataset.reduce((sum, item) => sum + item.value, 0) / dataset.length);

  return (
    <div className="activity-chart mt-6 rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm" onMouseLeave={() => setActive(null)}>
      {/* Header Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#2E2238] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#C96A32]/15 text-[#C96A32] border border-[#C96A32]/30">
            <Zap size={15} />
          </span>
          <div>
            <div className="mono text-[10px] font-bold tracking-wider text-[#C96A32] uppercase">CODE EXECUTION LIGHTNING GRAPH</div>
            <div className="text-[11px] text-[#AAA2B5]">Live electrical telemetry trace across execution paths</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mono text-[10px] text-[#C9A7FF] bg-[#C96A32]/10 px-2.5 py-1 rounded-md border border-[#C96A32]/30">
            <TrendingUp size={13} className="text-[#C96A32]" />
            <span>AVG EFFICIENCY: <strong className="text-[#F5EFE6]">{avgValue}%</strong></span>
          </div>

          {/* Time Filter Toggle */}
          <div className="flex rounded-md border border-[#2E2238] bg-[#0B0A0F] p-1">
            <button
              onClick={() => { setTimeRange('7d'); setActive(null); }}
              className={`rounded px-3 py-1 mono text-[10px] transition-all ${timeRange === '7d' ? 'bg-[#C96A32]/20 text-[#F5EFE6] font-bold border border-[#C96A32]' : 'text-[#AAA2B5] hover:text-[#F5EFE6]'}`}
            >
              7 days
            </button>
            <button
              onClick={() => { setTimeRange('30d'); setActive(null); }}
              className={`rounded px-3 py-1 mono text-[10px] transition-all ${timeRange === '30d' ? 'bg-[#C96A32]/20 text-[#F5EFE6] font-bold border border-[#C96A32]' : 'text-[#AAA2B5] hover:text-[#F5EFE6]'}`}
            >
              30 days
            </button>
          </div>
        </div>
      </div>

      {/* SVG Lightning Plot Canvas */}
      <div className="relative overflow-visible">
        <svg className="activity-plot-svg" viewBox={`0 0 ${chartWidth} ${chartH}`} role="img" aria-label="Code execution sharp lightning activity trace">
          <defs>
            {/* Primary Burnt Orange Lightning Gradient */}
            <linearGradient id="burntOrangeLightningGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C96A32" />
              <stop offset="50%" stopColor="#E58A45" />
              <stop offset="85%" stopColor="#C96A32" />
              <stop offset="100%" stopColor="#C9A7FF" />
            </linearGradient>

            {/* Subtle Gradient Fill Under Lightning Line */}
            <linearGradient id="burntOrangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C96A32" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#C96A32" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#17121C" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Segment Beams */}
            {points.map((pt, i) => (
              <linearGradient key={`beam-grad-${i}`} id={`lightningBeamGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={pt.value >= 80 ? "#E58A45" : "#C96A32"} stopOpacity={active === i ? "0.4" : "0.12"} />
                <stop offset="100%" stopColor="#17121C" stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Subdued Grid Lines */}
          {gridLevels.map((lvl) => (
            <g key={lvl.label}>
              <line className="activity-grid" x1={chartLeft} x2={chartRight} y1={lvl.y} y2={lvl.y} stroke="#2E2238" strokeOpacity="0.6" strokeDasharray="3 6" />
              <text x={chartLeft - 12} y={lvl.y + 3} textAnchor="end" className="fill-[#AAA2B5] mono text-[10px] select-none">
                {lvl.label}
              </text>
            </g>
          ))}

          {/* Optimal Target Benchmark Line (Soft Lavender dashed) */}
          <g>
            <path d={benchmarkPath} fill="none" stroke="#C9A7FF" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5" />
            <text x={chartRight + 6} y={targetY + 3} className="fill-[#C9A7FF] mono text-[8px] select-none opacity-70">TARGET (90%)</text>
          </g>

          {/* Area Glow Fill Under Line */}
          {areaPath && <path className="activity-area" d={areaPath} fill="url(#burntOrangeAreaGrad)" />}

          {/* Vertical Beams & Guide Lines */}
          {points.map((point, index) => {
            const beamWidth = 20;
            const beamHeight = chartBottom - point.y;
            const isHovered = active === index;
            return (
              <g key={`beam-${point.day}`}>
                <rect
                  x={point.x - beamWidth / 2}
                  y={point.y}
                  width={beamWidth}
                  height={Math.max(beamHeight, 2)}
                  rx={2}
                  fill={`url(#lightningBeamGrad-${index})`}
                  className="transition-all duration-200"
                  opacity={isHovered ? 1 : 0.6}
                />
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={point.y}
                  y2={chartBottom}
                  stroke={isHovered ? "#E58A45" : "#2E2238"}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeDasharray={isHovered ? "none" : "2 4"}
                  opacity={isHovered ? 0.9 : 0.4}
                />
              </g>
            );
          })}

          {/* Outer Glow Sharp Lightning Path */}
          {lightningLinePath && (
            <path
              d={lightningLinePath}
              fill="none"
              stroke="#C96A32"
              strokeWidth="6"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
              opacity="0.35"
              className="blur-[4px]"
            />
          )}

          {/* Main Core Sharp Angular Lightning Path (Point to Point straight lines) */}
          {lightningLinePath && (
            <path
              className="activity-line"
              d={lightningLinePath}
              stroke="url(#burntOrangeLightningGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
            />
          )}

          {/* Interactive Luminous Data Nodes */}
          {points.map((point, index) => {
            const isLatest = index === points.length - 1;
            const isPeak = point.value >= 80;
            const isHovered = active === index;
            const nodeColor = isPeak ? "#E58A45" : isLatest ? "#C96A32" : "#C9A7FF";

            return (
              <g
                key={point.day}
                tabIndex={0}
                role="button"
                aria-label={`${point.day}: ${point.value}% efficiency, ${point.timeComp} time complexity`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="cursor-pointer outline-none"
              >
                {/* Subtle Pulsing Outer Aura for Latest/Active Node */}
                {isLatest && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={12}
                    fill="#C96A32"
                    opacity={0.35}
                    className="animate-ping"
                  />
                )}

                {/* Outer Glow Ring */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 9 : isLatest ? 7 : 5}
                  fill={nodeColor}
                  opacity={isHovered ? 0.45 : isLatest ? 0.35 : 0.25}
                  className="transition-all duration-200"
                />

                {/* Core Border Circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 5 : isLatest ? 4.5 : 3.5}
                  stroke={nodeColor}
                  strokeWidth="2"
                  fill="#0B0A0F"
                  className="transition-all duration-200"
                />

                {/* Center Core Node */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 2.8 : 2}
                  fill={nodeColor}
                  className="transition-all duration-200"
                />

                {/* X-Axis Labels */}
                <text
                  x={point.x}
                  y={chartBottom + 20}
                  textAnchor="middle"
                  className={`mono text-[10px] font-medium transition-colors ${isHovered || isLatest ? 'fill-[#C96A32] font-bold' : 'fill-[#AAA2B5]'}`}
                >
                  {point.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay with Real Metrics */}
        {activePoint && (
          <div
            className="activity-tooltip absolute z-20 min-w-[210px] rounded-lg border border-[#C96A32]/50 bg-[#17121C]/95 p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all animate-rise text-[#F5EFE6]"
            style={{
              left: `${(activePoint.x / chartWidth) * 100}%`,
              top: `${(activePoint.y / chartH) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 16px))',
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#2E2238] pb-2">
              <span className="eyebrow text-[#C96A32] text-[10px] font-bold">{activePoint.day} · EXECUTION TRACE</span>
              <span className="mono text-[9px] text-[#E58A45] font-bold">+{activePoint.xp} XP</span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="display text-[22px] font-bold text-[#F5EFE6]">{activePoint.value}%</span>
              <span className="mono text-[10px] font-semibold text-[#C9A7FF]">{activePoint.note}</span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-md border border-[#2E2238] bg-[#0B0A0F] p-2 mono text-[9px]">
              <div>
                <span className="text-[#AAA2B5] block text-[8px] uppercase">TIME COMP.</span>
                <span className="font-bold text-[#C96A32] text-[11px]">{activePoint.timeComp}</span>
              </div>
              <div>
                <span className="text-[#AAA2B5] block text-[8px] uppercase">SPACE COMP.</span>
                <span className="font-bold text-[#4ADE80] text-[11px]">{activePoint.spaceComp}</span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-[#AAA2B5] flex items-center justify-between">
              <span>{activePoint.solved} exercises solved</span>
              <span className="mono text-[#C96A32] font-semibold">VERIFIED</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-[#2E2238] pt-2.5 mono text-[9px] text-[#AAA2B5] gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#C96A32]" />
            <strong className="text-[#F5EFE6]">BURNT ORANGE</strong> (Execution Signal)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#C9A7FF]" />
            <strong className="text-[#F5EFE6]">SOFT LAVENDER</strong> (Optimal Target)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#E58A45]" />
            <strong className="text-[#F5EFE6]">BRIGHT ORANGE</strong> (Peak Highlight)
          </span>
        </div>
        <span className="mono font-semibold text-[#C96A32]">SHARP TELEMETRY LIGHTNING TRACE V4</span>
      </div>
    </div>
  );
}

export function TodayGoalCard() {
  return (
    <div className="rounded-[12px] border border-[#2E2238] bg-[#17121C] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow text-[#C96A32]">Today’s goal</div>
          <h2 className="display mt-2 text-[21px] font-semibold text-[#F5EFE6]">Keep the chain moving.</h2>
        </div>
        <Crosshair size={16} className="text-[#C96A32]"/>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-[108px] w-[108px] shrink-0">
          <svg viewBox="0 0 100 100" className="goal-ring h-full w-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2E2238" strokeWidth="8"/>
            <circle className="goal-ring-progress" cx="50" cy="50" r="40" fill="none" stroke="url(#goalGradient)" strokeWidth="8" strokeLinecap="round"/>
            <defs>
              <linearGradient id="goalGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C96A32"/>
                <stop offset="100%" stopColor="#E58A45"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="display text-[21px] font-semibold text-[#F5EFE6]">2 / 3</div>
              <div className="mono text-[9px] text-[#AAA2B5]">TASKS</div>
            </div>
          </div>
        </div>

        <div>
          <div className="display xp-pulse text-[28px] font-semibold text-[#C96A32]">67%</div>
          <p className="mt-1 text-[11px] leading-4 text-[#AAA2B5]">One medium challenge stands between you and today’s target.</p>
        </div>
      </div>

      <Link href="/challenges" className="btn-primary group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-[11px] font-bold transition-all">
        Pick a challenge <ArrowRight size={13} className="transition-transform group-hover:translate-x-1"/>
      </Link>
    </div>
  );
}

export function XpProgressionChart() {
  const [active, setActive] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const dataset7d = [
    { period: 'MON', height: 24, xp: 120, accuracy: '78%', solved: 2, note: 'Baseline established' },
    { period: 'TUE', height: 34, xp: 180, accuracy: '82%', solved: 3, note: 'Steady momentum' },
    { period: 'WED', height: 31, xp: 160, accuracy: '80%', solved: 3, note: 'Trace active' },
    { period: 'THU', height: 48, xp: 260, accuracy: '85%', solved: 5, note: 'Accelerating' },
    { period: 'FRI', height: 44, xp: 240, accuracy: '84%', solved: 4, note: 'High accuracy' },
    { period: 'SAT', height: 61, xp: 340, accuracy: '88%', solved: 6, note: 'Weekend peak' },
    { period: 'SUN', height: 56, xp: 310, accuracy: '86%', solved: 5, note: 'Chain maintained' },
    { period: 'W8', height: 72, xp: 410, accuracy: '89%', solved: 7, note: 'Strong signal' },
    { period: 'W9', height: 64, xp: 370, accuracy: '87%', solved: 6, note: 'Stable progress' },
    { period: 'W10', height: 79, xp: 460, accuracy: '91%', solved: 8, note: 'Breakthrough' },
    { period: 'W11', height: 74, xp: 430, accuracy: '90%', solved: 7, note: 'Consolidated' },
    { period: 'NOW', height: 91, xp: 540, accuracy: '94%', solved: 9, note: 'Current verified peak!' },
  ];

  const dataset30d = [
    { period: 'WK 1', height: 28, xp: 420, accuracy: '79%', solved: 12, note: 'Week 1 baseline' },
    { period: 'WK 2', height: 45, xp: 780, accuracy: '83%', solved: 19, note: 'Ramping up' },
    { period: 'WK 3', height: 65, xp: 1240, accuracy: '86%', solved: 28, note: 'Consistent flow' },
    { period: 'WK 4', height: 84, xp: 1890, accuracy: '90%', solved: 38, note: 'Monthly peak' },
    { period: 'NOW', height: 95, xp: 2450, accuracy: '94%', solved: 48, note: 'Total verified XP' },
  ];

  const dataset = timeRange === '7d' ? dataset7d : dataset30d;

  // Empty state check
  if (!dataset || dataset.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#2E2238] bg-[#17121C] p-10 text-center shadow-sm">
        <Sparkles size={28} className="mb-3 text-[#C96A32] opacity-60" />
        <h3 className="display text-base font-semibold text-[#F5EFE6]">No progression data yet.</h3>
        <p className="mt-1 text-xs text-[#AAA2B5]">Complete your first exercise to start tracking your cumulative XP &amp; accuracy.</p>
      </div>
    );
  }

  const width = 720;
  const chartH = 230;
  const cTop = 24;
  const cBottom = 180;
  const cLeft = 50;
  const cRight = 684;

  const points = dataset.map((item, index) => {
    const x = cLeft + (index * (cRight - cLeft)) / Math.max(dataset.length - 1, 1);
    const y = cBottom - (item.height / 100) * (cBottom - cTop);
    const timeComp = item.height >= 75 ? 'O(1)' : item.height >= 45 ? 'O(n)' : 'O(n²)';
    const spaceComp = item.height >= 60 ? 'O(1)' : 'O(n)';
    return { ...item, x, y, timeComp, spaceComp };
  });

  const lightningLinePath = buildLightningPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = firstPoint && lastPoint ? `${lightningLinePath} L ${lastPoint.x} ${cBottom} L ${firstPoint.x} ${cBottom} Z` : '';
  const activePoint = active === null ? null : points[active];

  // Optimal benchmark target Y (85% progress level)
  const targetY = cBottom - 0.85 * (cBottom - cTop);
  const benchmarkPath = `M ${cLeft} ${targetY} L ${cRight} ${targetY}`;

  return (
    <div className="activity-chart" onMouseLeave={() => setActive(null)}>
      {/* Header Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#2E2238] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#C96A32]/15 text-[#C96A32] border border-[#C96A32]/30">
            <Sparkles size={15} />
          </span>
          <div>
            <div className="mono text-[10px] font-bold tracking-wider text-[#C96A32] uppercase">XP &amp; COMPLEXITY PROGRESSION LIGHTNING TRACE</div>
            <div className="text-[11px] text-[#AAA2B5]">Cumulative experience points &amp; algorithmic efficiency growth</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-md border border-[#2E2238] bg-[#0B0A0F] p-1">
            <button
              onClick={() => { setTimeRange('7d'); setActive(null); }}
              className={`rounded px-3 py-1 mono text-[10px] transition-all ${timeRange === '7d' ? 'bg-[#C96A32]/20 text-[#F5EFE6] font-bold border border-[#C96A32]' : 'text-[#AAA2B5] hover:text-[#F5EFE6]'}`}
            >
              7 days
            </button>
            <button
              onClick={() => { setTimeRange('30d'); setActive(null); }}
              className={`rounded px-3 py-1 mono text-[10px] transition-all ${timeRange === '30d' ? 'bg-[#C96A32]/20 text-[#F5EFE6] font-bold border border-[#C96A32]' : 'text-[#AAA2B5] hover:text-[#F5EFE6]'}`}
            >
              30 days
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-visible">
        <svg className="activity-plot-svg" viewBox={`0 0 ${width} ${chartH}`} role="img" aria-label="XP progression sharp lightning trace">
          <defs>
            <linearGradient id="xpLightningGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C96A32" />
              <stop offset="50%" stopColor="#E58A45" />
              <stop offset="85%" stopColor="#C96A32" />
              <stop offset="100%" stopColor="#C9A7FF" />
            </linearGradient>

            <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C96A32" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#C96A32" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#17121C" stopOpacity="0.0" />
            </linearGradient>

            {points.map((pt, i) => (
              <linearGradient key={`xp-beam-${i}`} id={`xpBeamGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={i === points.length - 1 ? "#E58A45" : "#C96A32"} stopOpacity={active === i ? "0.4" : "0.12"} />
                <stop offset="100%" stopColor="#17121C" stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Subdued Horizontal Grid Lines */}
          {[cTop, cTop + (cBottom - cTop) * 0.33, cTop + (cBottom - cTop) * 0.66, cBottom].map((y) => (
            <line key={y} className="activity-grid" x1={cLeft} x2={cRight} y1={y} y2={y} stroke="#2E2238" strokeOpacity="0.6" strokeDasharray="3 6" />
          ))}

          {/* Optimal Target Benchmark Line (Soft Lavender) */}
          <g>
            <path d={benchmarkPath} fill="none" stroke="#C9A7FF" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5" />
            <text x={cRight + 4} y={targetY + 3} className="fill-[#C9A7FF] mono text-[8px] select-none opacity-70">TARGET</text>
          </g>

          {/* Area Fill Under Trace */}
          {areaPath && <path className="activity-area" d={areaPath} fill="url(#xpAreaGrad)" />}

          {/* Beams & Guide Lines */}
          {points.map((pt, index) => {
            const bWidth = 18;
            const bHeight = cBottom - pt.y;
            const isHovered = active === index;
            return (
              <g key={`xp-b-${pt.period}`}>
                <rect
                  x={pt.x - bWidth / 2}
                  y={pt.y}
                  width={bWidth}
                  height={Math.max(bHeight, 2)}
                  rx={2}
                  fill={`url(#xpBeamGrad-${index})`}
                  className="transition-all duration-200"
                  opacity={isHovered ? 1 : 0.6}
                />
                <line
                  x1={pt.x}
                  x2={pt.x}
                  y1={pt.y}
                  y2={cBottom}
                  stroke={isHovered ? "#E58A45" : "#2E2238"}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeDasharray={isHovered ? "none" : "2 4"}
                  opacity={isHovered ? 0.9 : 0.4}
                />
              </g>
            );
          })}

          {/* Outer Glow Sharp Lightning Path */}
          {lightningLinePath && (
            <path
              d={lightningLinePath}
              fill="none"
              stroke="#C96A32"
              strokeWidth="6"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
              opacity="0.35"
              className="blur-[4px]"
            />
          )}

          {/* Core Sharp Point to Point Angular Lightning Path */}
          {lightningLinePath && (
            <path
              className="activity-line"
              d={lightningLinePath}
              stroke="url(#xpLightningGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
            />
          )}

          {/* Luminous Data Nodes */}
          {points.map((pt, index) => {
            const isCurrent = index === points.length - 1;
            const isHovered = active === index;
            const nodeColor = isCurrent ? "#E58A45" : "#C96A32";

            return (
              <g
                key={pt.period}
                tabIndex={0}
                role="button"
                aria-label={`${pt.period}: ${pt.xp} XP, ${pt.accuracy} accuracy`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="cursor-pointer outline-none"
              >
                {/* Pulsing Ring for Current Node */}
                {isCurrent && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={12}
                    fill="#C96A32"
                    opacity={0.35}
                    className="animate-ping"
                  />
                )}

                {/* Outer Glow Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 9 : isCurrent ? 8 : 5}
                  fill={nodeColor}
                  opacity={isHovered ? 0.45 : isCurrent ? 0.35 : 0.25}
                  className="transition-all duration-200"
                />

                {/* Core Border Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : isCurrent ? 4.5 : 3.5}
                  stroke={nodeColor}
                  strokeWidth="2"
                  fill="#0B0A0F"
                  className="transition-all duration-200"
                />

                {/* Core Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 2.8 : 2}
                  fill={nodeColor}
                  className="transition-all duration-200"
                />

                {/* X-Axis Period Label */}
                <text
                  x={pt.x}
                  y={cBottom + 20}
                  textAnchor="middle"
                  className={`mono text-[9px] font-medium transition-colors ${isHovered || isCurrent ? 'fill-[#C96A32] font-bold' : 'fill-[#AAA2B5]'}`}
                >
                  {pt.period}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activePoint && (
          <div
            className="activity-tooltip absolute z-20 min-w-[210px] rounded-lg border border-[#C96A32]/50 bg-[#17121C]/95 p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all animate-rise text-[#F5EFE6]"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / chartH) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 16px))',
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#2E2238] pb-2">
              <span className="eyebrow text-[#C96A32] text-[10px] font-bold">{activePoint.period} · CUMULATIVE XP</span>
              <span className="mono text-[9px] text-[#E58A45] font-bold">+{activePoint.xp} XP</span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="display text-[20px] font-bold text-[#F5EFE6]">{activePoint.xp.toLocaleString()} XP</span>
              <span className="mono text-[10px] font-semibold text-[#4ADE80]">{activePoint.accuracy} ACCURACY</span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-md border border-[#2E2238] bg-[#0B0A0F] p-2 mono text-[9px]">
              <div>
                <span className="text-[#AAA2B5] block text-[8px] uppercase">TIME COMP.</span>
                <span className="font-bold text-[#C96A32] text-[11px]">{activePoint.timeComp}</span>
              </div>
              <div>
                <span className="text-[#AAA2B5] block text-[8px] uppercase">SPACE COMP.</span>
                <span className="font-bold text-[#4ADE80] text-[11px]">{activePoint.spaceComp}</span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-[#AAA2B5] flex items-center justify-between">
              <span>{activePoint.solved} bugs solved</span>
              <span className="mono text-[#C96A32] font-semibold">{activePoint.note}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#2E2238] pt-2.5 mono text-[9px] text-[#AAA2B5]">
        <span>MIN XP ACCUMULATION</span>
        <span className="text-[#C96A32]">CURRENT TOTAL: <strong className="text-[#F5EFE6]">2,450 XP</strong> (+320 THIS PERIOD)</span>
      </div>
    </div>
  );
}

