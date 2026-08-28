import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Shield, Lock, AlertTriangle, Zap, GitBranch,
  Gauge, Share2, Check, Award, Copy, ExternalLink
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useProgressStore } from '../store/progressStore'
import { useUIStore } from '../store/uiStore'
import { defectClasses } from '../tokens'

const iconMap = {
  Shield,
  Lock,
  AlertTriangle,
  Zap,
  GitBranch,
  Gauge,
}

export default function Profile() {
  const navigate = useNavigate()
  const { profile } = useProgressStore()
  const { showToast } = useUIStore()
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/profile/afrid-shaik')
    setCopied(true)
    showToast('Public Skill Card link copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header Profile Card */}
      <Card className="p-8 border-border bg-bg-surface shadow-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-accent flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-accent/20">
              AF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-text-primary">Afrid Shaik</h1>
                <Badge variant="accent" size="sm">Verified Reviewer</Badge>
              </div>
              <p className="text-sm text-text-secondary mt-0.5">Full Stack Engineer &amp; Code Reviewer</p>
              <p className="text-2xs text-text-muted mt-1 font-mono">Member since August 2026</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-bg-secondary p-4 rounded-xl border border-border w-full sm:w-auto">
            <span className="text-2xs uppercase tracking-wider text-text-muted font-semibold block">
              Review Skill Score
            </span>
            <span className="text-4xl font-extrabold text-gradient-accent tracking-tight">
              {profile.overall}
            </span>
            <span className="text-xs text-text-muted block mt-0.5">Top 8% in Cohort</span>
          </div>
        </div>

        {/* Key Competencies Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div>
            <span className="text-2xs text-text-muted uppercase tracking-wider font-medium">Top Strength</span>
            <p className="text-sm font-bold text-success mt-1">Logic &amp; Boundary</p>
            <span className="text-2xs text-text-muted">82% catch rate</span>
          </div>
          <div>
            <span className="text-2xs text-text-muted uppercase tracking-wider font-medium">Primary Focus</span>
            <p className="text-sm font-bold text-warning mt-1">Error Handling</p>
            <span className="text-2xs text-text-muted">43% catch rate</span>
          </div>
          <div>
            <span className="text-2xs text-text-muted uppercase tracking-wider font-medium">Exercises</span>
            <p className="text-sm font-bold text-text-primary mt-1">{profile.exercisesCompleted} Completed</p>
            <span className="text-2xs text-text-muted">Across 3 languages</span>
          </div>
          <div>
            <span className="text-2xs text-text-muted uppercase tracking-wider font-medium">Best Streak</span>
            <p className="text-sm font-bold text-text-primary mt-1">6 Days</p>
            <span className="text-2xs text-text-muted">Active review habit</span>
          </div>
        </div>
      </Card>

      {/* Six-Class Mastery Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Defect Class Review Ratings</h2>
          <span className="text-xs text-text-muted">Calibrated across production PR test cases</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {defectClasses.map((cls) => {
            const data = profile.catchRates[cls.id] || { rate: 50, trend: 0, attempts: 0 }
            const Icon = iconMap[cls.icon as keyof typeof iconMap] || Shield

            return (
              <Card key={cls.id} className="p-4 bg-bg-surface">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cls.color}15` }}
                    >
                      <Icon size={14} style={{ color: cls.color }} />
                    </div>
                    <span className="text-sm font-semibold text-text-primary">{cls.shortLabel}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-text-primary">{data.rate}%</span>
                </div>
                <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${data.rate}%`, backgroundColor: cls.color }}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Shareable Card Section */}
      <Card className="p-6 bg-gradient-to-r from-bg-surface to-bg-elevated border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-text-primary flex items-center justify-center sm:justify-start gap-2">
            <Award size={18} className="text-accent" /> Share Review Skill Card
          </h3>
          <p className="text-xs text-text-secondary max-w-md">
            Showcase your code review proficiency on LinkedIn, GitHub, or in technical interviews.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleShare}
          icon={copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          className="flex-shrink-0"
        >
          {copied ? 'Copied Link' : 'Copy Share Link'}
        </Button>
      </Card>
    </div>
  )
}
