import { useState } from 'react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

export default function Settings() {
  const [fontSize, setFontSize] = useState('13')
  const [minimap, setMinimap] = useState(true)
  const [sound, setSound] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-light-bg text-light-text flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="pb-4 border-b border-light-border">
          <h1 className="text-2xl font-bold text-navy">Platform Settings</h1>
          <p className="text-xs text-light-textSecondary mt-0.5">Customize your editor and learning experience.</p>
        </div>

        {/* Editor Preferences */}
        <Card className="p-6 space-y-4">
          <span className="text-2xs font-mono uppercase tracking-wider text-aqua font-semibold block">
            EDITOR PREFERENCES
          </span>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy">Editor Font Size</p>
                <p className="text-2xs text-light-textMuted">Monaco code font size in pixels</p>
              </div>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="bg-light-elevated border border-light-border rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-aqua"
              >
                <option value="12">12 px</option>
                <option value="13">13 px (Default)</option>
                <option value="14">14 px</option>
                <option value="16">16 px</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-light-border">
              <div>
                <p className="font-semibold text-navy">Code Minimap</p>
                <p className="text-2xs text-light-textMuted">Show document overview on the right edge</p>
              </div>
              <button
                onClick={() => setMinimap(!minimap)}
                className={`w-10 h-6 rounded-full transition-colors relative ${minimap ? 'bg-aqua' : 'bg-light-border'}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${minimap ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6 space-y-4">
          <span className="text-2xs font-mono uppercase tracking-wider text-aqua font-semibold block">
            PRIVACY &amp; LEADERBOARD
          </span>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-navy">Display on Global Leaderboard</p>
              <p className="text-2xs text-light-textMuted">Allow other engineers to view your review scores</p>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`w-10 h-6 rounded-full transition-colors relative ${showLeaderboard ? 'bg-aqua' : 'bg-light-border'}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${showLeaderboard ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button size="md" variant="primary" onClick={handleSave}>
            {saved ? 'Settings Saved' : 'Save Changes'}
          </Button>
        </div>
      </main>
    </div>
  )
}
