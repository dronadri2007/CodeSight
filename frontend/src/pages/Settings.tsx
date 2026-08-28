import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIStore } from '../store/uiStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { clsx } from 'clsx'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
          checked ? 'bg-accent' : 'bg-border'
        )}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {children}
    </div>
  )
}

export default function Settings() {
  const { settingsAnimations, settingsSound, settingsMinimap, settingsFontSize, setSetting, setFontSize } = useUIStore()
  const [showLb, setShowLb] = useState(true)
  const [shareCard, setShareCard] = useState(true)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Appearance</p>
          <Card>
            <SettingRow label="Theme">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border">
                <div className="w-3 h-3 rounded-full bg-bg-primary border border-border" />
                <span className="text-xs text-text-secondary">Dark</span>
              </div>
            </SettingRow>
            <div className="border-t border-border pt-2">
              <SettingRow label="Editor Font Size">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize(Math.max(10, settingsFontSize - 1))}
                    className="w-7 h-7 rounded border border-border text-text-secondary hover:border-border-strong flex items-center justify-center text-sm transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-mono text-text-primary">{settingsFontSize}</span>
                  <button
                    onClick={() => setFontSize(Math.min(20, settingsFontSize + 1))}
                    className="w-7 h-7 rounded border border-border text-text-secondary hover:border-border-strong flex items-center justify-center text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
              </SettingRow>
            </div>
            <div className="border-t border-border pt-2">
              <Toggle
                checked={settingsMinimap}
                onChange={(v) => setSetting('settingsMinimap', v)}
                label="Editor Minimap"
                description="Show code minimap in the review editor"
              />
            </div>
          </Card>
        </div>

        {/* Experience */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Experience</p>
          <Card>
            <Toggle
              checked={settingsAnimations}
              onChange={(v) => setSetting('settingsAnimations', v)}
              label="Animations"
              description="Enable page transitions and micro-interactions"
            />
            <div className="border-t border-border pt-2">
              <Toggle
                checked={settingsSound}
                onChange={(v) => setSetting('settingsSound', v)}
                label="Sound Effects"
                description="Play sound on score reveal and concept complete"
              />
            </div>
          </Card>
        </div>

        {/* Account */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Account</p>
          <Card>
            <SettingRow label="Name">
              <span className="text-sm text-text-secondary">Afrid Shaik</span>
            </SettingRow>
            <div className="border-t border-border pt-2">
              <SettingRow label="Email">
                <span className="text-sm text-text-muted">afrid@example.com</span>
              </SettingRow>
            </div>
            <div className="border-t border-border pt-3">
              <Button variant="secondary" size="sm">Edit Profile</Button>
            </div>
          </Card>
        </div>

        {/* Privacy */}
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Privacy</p>
          <Card>
            <Toggle
              checked={showLb}
              onChange={setShowLb}
              label="Show on Leaderboard"
              description="Allow other users to see your rank and score"
            />
            <div className="border-t border-border pt-2">
              <Toggle
                checked={shareCard}
                onChange={setShareCard}
                label="Allow skill card sharing"
                description="Allow your review skill card to be shared publicly"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
