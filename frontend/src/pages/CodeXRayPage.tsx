import React, { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { LiquidMetalCTA } from '../components/animations/LiquidMetalCTA';

export default function CodeXRayPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      toast.success('Code X-Ray Diagnostic Scan Complete!');
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12 text-[#17130F]">
      <div className="border-b border-[#D8D0C0] pb-6 font-mono">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#746D61]">
          <Sparkles size={14} className="text-[#17130F]" />
          <span>DIAGNOSTIC SCANNER WORKSPACE</span>
        </div>
        <h1 className="mt-1 font-serif text-4xl font-bold text-[#17130F]">
          Code X-Ray Diagnostic Engine
        </h1>
        <p className="mt-1 text-sm text-[#403A32]">
          Select risk hypotheses, run the diagnostic scanner, generate vulnerability heatmaps, and verify ground truth.
        </p>
      </div>

      {/* Control Panel */}
      <div className="rounded-xl border border-[#D8D0C0] bg-[#F5F1E7] p-6 shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-[#17130F]">Risk Hypotheses Selection</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 font-mono text-xs">
          {['Input Validation Flaws', 'Concurrency Race Conditions', 'Unhandled Exceptions'].map((hyp) => (
            <label key={hyp} className="flex items-center gap-3 rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-4 text-[#17130F] font-bold cursor-pointer hover:border-[#17130F]">
              <input type="checkbox" defaultChecked className="accent-[#17130F]" />
              <span>{hyp}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <LiquidMetalCTA
            text={scanning ? "SCANNING AST NODES..." : "RUN X-RAY SCAN"}
            icon="sparkles"
            onClick={handleScan}
            size="lg"
          />
        </div>
      </div>

      {/* Scanner Animation / Results */}
      {scanned && (
        <div className="space-y-6 rounded-xl border border-[#17130F] bg-[#F5F1E7] p-6 shadow-sm font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#D8D0C0] pb-4">
            <span className="font-bold text-[#17130F]">RISK HEATMAP & GROUND TRUTH</span>
            <span className="font-bold text-[#17130F]">3 VULNERABILITIES DETECTED</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-4">
              <div className="font-bold text-[#17130F]">HIGH RISK · Line 42</div>
              <div className="mt-1 text-[#746D61]">SQL Injection via unescaped string formatting</div>
            </div>

            <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-4">
              <div className="font-bold text-[#17130F]">MEDIUM RISK · Line 88</div>
              <div className="mt-1 text-[#746D61]">Race condition on shared memory balance</div>
            </div>

            <div className="rounded-lg border border-[#D8D0C0] bg-[#F8F5EC] p-4">
              <div className="font-bold text-[#17130F]">LOW RISK · Line 104</div>
              <div className="mt-1 text-[#746D61]">Unhandled rejection in async handler</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
