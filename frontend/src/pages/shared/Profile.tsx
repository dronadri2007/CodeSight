import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Shield, Share2, Copy, Check, Sparkles, Award, ExternalLink
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { SkillBar } from '../../components/ui/ProgressBar'
import { BrandLogo } from '../../components/ui/BrandLogo'

export default function Profile() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/#/profile/afrid')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F4F1E8] flex flex-col selection:bg-[#35C6B0]/30 selection:text-[#F4F1E8]">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header Profile Card */}
        <Card className="p-8 border-[#29333A] bg-[#151C24] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-[#0D1117] border-2 border-[#35C6B0]/60 text-[#35C6B0] font-bold text-2xl flex items-center justify-center shadow-[0_0_20px_rgba(53,198,176,0.25)]">
                AF
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-[#F4F1E8]">Afrid Shaik</h1>
                  <Badge variant="gold" size="sm">Verified Reviewer</Badge>
                </div>
                <p className="text-xs text-[#AEB7B2]">Senior Software Engineer · CodeSight Member since Aug 2026</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-mono text-[#AEB7B2]">
                  <span>18 Reviews Completed</span>
                  <span>·</span>
                  <span className="text-[#35B889] font-semibold">86% Precision Rate</span>
                  <span>·</span>
                  <span className="text-[#D9A441] font-semibold">4 Day Streak</span>
                </div>
              </div>
            </div>

            <Button
              variant="dark"
              size="sm"
              onClick={handleCopyLink}
              icon={copied ? <Check size={14} className="text-[#35B889]" /> : <Copy size={14} />}
              className="text-xs border-[#29333A]"
            >
              {copied ? 'Link Copied' : 'Share Skill Card'}
            </Button>
          </div>
        </Card>

        {/* Verified Skill Card for Portfolios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F4F1E8] flex items-center gap-2">
              <Sparkles size={16} className="text-[#35C6B0]" /> Verified Review Skill Card
            </h2>
            <span className="text-2xs text-[#AEB7B2] font-mono">Public Embed Preview</span>
          </div>

          <div className="p-6 rounded-2xl border border-[#29333A] bg-[#151C24] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#29333A] pb-4">
              <BrandLogo size="sm" variant="dark" />
              <span className="text-2xs font-mono text-[#35C6B0] font-semibold">ID: CS-2026-AF91</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkillBar dark={true} name="Logic & Boundary" value={82} color="#35B889" />
              <SkillBar dark={true} name="Injection / Validation" value={78} color="#E0646D" />
              <SkillBar dark={true} name="Resource & Performance" value={67} color="#AEB7B2" />
              <SkillBar dark={true} name="Auth & Access Control" value={61} color="#D9A441" />
              <SkillBar dark={true} name="Concurrency & State" value={55} color="#58D8C5" />
              <SkillBar dark={true} name="Error & Exception Handling" value={43} color="#35C6B0" />
            </div>

            <div className="pt-4 border-t border-[#29333A] flex flex-col sm:flex-row items-center justify-between text-2xs text-[#AEB7B2] gap-3">
              <span>Verified against ground-truth static evaluation corpus.</span>
              <span className="text-[#35C6B0] font-semibold font-mono">codesight.dev/verify/AF91</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
