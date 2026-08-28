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
    <div className="min-h-screen bg-light-bg text-light-text flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header Profile Card */}
        <Card className="p-8 border-light-border bg-light-card shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-aqua-soft border-2 border-aqua/40 text-navy font-bold text-2xl flex items-center justify-center shadow-sm">
                AF
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-navy">Afrid Shaik</h1>
                  <Badge variant="accent" size="sm">Verified Reviewer</Badge>
                </div>
                <p className="text-xs text-light-textSecondary">Senior Software Engineer · CodeSight Member since Aug 2026</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-mono text-light-textMuted">
                  <span>18 Reviews Completed</span>
                  <span>·</span>
                  <span className="text-success font-semibold">86% Precision Rate</span>
                  <span>·</span>
                  <span className="text-warning font-semibold">4 Day Streak</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              icon={copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              className="text-xs"
            >
              {copied ? 'Link Copied' : 'Share Skill Card'}
            </Button>
          </div>
        </Card>

        {/* Verified Skill Card for Portfolios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy flex items-center gap-2">
              <Sparkles size={16} className="text-aqua" /> Verified Review Skill Card
            </h2>
            <span className="text-2xs text-light-textMuted font-mono">Public Embed Preview</span>
          </div>

          <div className="p-6 rounded-2xl border border-light-border bg-light-card space-y-6 shadow-card">
            <div className="flex items-center justify-between border-b border-light-border pb-4">
              <BrandLogo size="sm" variant="light" />
              <span className="text-2xs font-mono text-aqua font-semibold">ID: CS-2026-AF91</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkillBar dark={false} name="Logic & Boundary" value={82} color="#19B47A" />
              <SkillBar dark={false} name="Injection / Validation" value={78} color="#E25D67" />
              <SkillBar dark={false} name="Resource & Performance" value={67} color="#516173" />
              <SkillBar dark={false} name="Auth & Access Control" value={61} color="#E6A23C" />
              <SkillBar dark={false} name="Concurrency & State" value={55} color="#38D9E8" />
              <SkillBar dark={false} name="Error & Exception Handling" value={43} color="#20C7D9" />
            </div>

            <div className="pt-4 border-t border-light-border flex flex-col sm:flex-row items-center justify-between text-2xs text-light-textSecondary gap-3">
              <span>Verified against ground-truth static evaluation corpus.</span>
              <span className="text-navy font-semibold font-mono">codesight.dev/verify/AF91</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
