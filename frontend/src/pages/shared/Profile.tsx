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

export default function Profile() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/#/profile/afrid')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header Profile Card */}
        <Card dark className="p-8 border-navy-border bg-navy-surface shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-aqua/20 border-2 border-aqua/40 text-aqua font-bold text-2xl flex items-center justify-center shadow-aqua-glow">
                AF
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-white">Afrid Shaik</h1>
                  <Badge variant="accent" size="sm">Verified Reviewer</Badge>
                </div>
                <p className="text-xs text-slate">Senior Software Engineer · CodeSight Member since Aug 2026</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-mono text-slate">
                  <span>18 Reviews Completed</span>
                  <span>·</span>
                  <span className="text-success">86% Precision Rate</span>
                  <span>·</span>
                  <span className="text-warning">4 Day Streak</span>
                </div>
              </div>
            </div>

            <Button
              variant="dark"
              size="sm"
              onClick={handleCopyLink}
              icon={copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              className="border-aqua/30 text-xs"
            >
              {copied ? 'Link Copied' : 'Share Skill Card'}
            </Button>
          </div>
        </Card>

        {/* Verified Skill Card for Portfolios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-aqua" /> Verified Review Skill Card
            </h2>
            <span className="text-2xs text-slate font-mono">Public Embed Preview</span>
          </div>

          <div className="p-6 rounded-2xl border border-aqua/40 bg-navy-surface space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-border pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="CodeSight" className="h-6 object-contain" />
                <span className="text-xs font-bold text-white">CodeSight Verified Assessment</span>
              </div>
              <span className="text-2xs font-mono text-aqua">ID: CS-2026-AF91</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkillBar dark name="Logic & Boundary" value={82} color="#19B47A" />
              <SkillBar dark name="Injection / Validation" value={78} color="#E25D67" />
              <SkillBar dark name="Resource & Performance" value={67} color="#516173" />
              <SkillBar dark name="Auth & Access Control" value={61} color="#E6A23C" />
              <SkillBar dark name="Concurrency & State" value={55} color="#38D9E8" />
              <SkillBar dark name="Error & Exception Handling" value={43} color="#20C7D9" />
            </div>

            <div className="pt-4 border-t border-navy-border flex flex-col sm:flex-row items-center justify-between text-2xs text-slate gap-3">
              <span>Verified against ground-truth static evaluation corpus.</span>
              <span className="text-aqua font-semibold">codesight.dev/verify/AF91</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
