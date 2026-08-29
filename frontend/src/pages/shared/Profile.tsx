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
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header Profile Card */}
        <Card className="p-8 border-[#3A2F1D] bg-[#1A130D] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-[#000000] border-2 border-[#3A2F1D] text-[#E5DFC9] font-bold text-2xl flex items-center justify-center shadow-md">
                AF
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-[#E5DFC9]">Afrid Shaik</h1>
                  <Badge variant="gold" size="sm">Verified Reviewer</Badge>
                </div>
                <p className="text-xs text-[#E5DFC9]/70">Senior Software Engineer · CodeSight Member since Aug 2026</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-mono text-[#E5DFC9]/60">
                  <span>18 Reviews Completed</span>
                  <span>·</span>
                  <span className="text-[#E5DFC9] font-semibold">86% Precision Rate</span>
                  <span>·</span>
                  <span className="text-[#E5DFC9] font-semibold">4 Day Streak</span>
                </div>
              </div>
            </div>

            <Button
              variant="dark"
              size="sm"
              onClick={handleCopyLink}
              icon={copied ? <Check size={14} className="text-[#E5DFC9]" /> : <Copy size={14} />}
              className="text-xs border-[#3A2F1D]"
            >
              {copied ? 'Link Copied' : 'Share Skill Card'}
            </Button>
          </div>
        </Card>

        {/* Verified Skill Card for Portfolios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#E5DFC9] flex items-center gap-2">
              <Sparkles size={16} className="text-[#E5DFC9]" /> Verified Review Skill Card
            </h2>
            <span className="text-2xs text-[#E5DFC9]/60 font-mono">Public Embed Preview</span>
          </div>

          <div className="p-6 rounded-2xl border border-[#3A2F1D] bg-[#1A130D] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A2F1D] pb-4">
              <BrandLogo size="sm" variant="dark" />
              <span className="text-2xs font-mono text-[#E5DFC9] font-semibold">ID: CS-2026-AF91</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkillBar dark={true} name="Logic & Boundary" value={82} color="#E5DFC9" />
              <SkillBar dark={true} name="Injection / Validation" value={78} color="#E5DFC9" />
              <SkillBar dark={true} name="Resource & Performance" value={67} color="#E5DFC9" />
              <SkillBar dark={true} name="Auth & Access Control" value={61} color="#E5DFC9" />
              <SkillBar dark={true} name="Concurrency & State" value={55} color="#E5DFC9" />
              <SkillBar dark={true} name="Error & Exception Handling" value={43} color="#E5DFC9" />
            </div>

            <div className="pt-4 border-t border-[#3A2F1D] flex flex-col sm:flex-row items-center justify-between text-2xs text-[#E5DFC9]/60 gap-3">
              <span>Verified against ground-truth static evaluation corpus.</span>
              <span className="text-[#E5DFC9] font-semibold font-mono">codesight.dev/verify/AF91</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
