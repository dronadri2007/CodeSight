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
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      {/* Top Navbar */}
      <Navbar variant="marketing" />

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="pb-4 border-b border-[#3A2F1D]">
          <h1 className="text-2xl font-bold text-[#E5DFC9]">Platform Settings</h1>
          <p className="text-xs text-[#E5DFC9]/70 mt-0.5">Customize your editor and learning experience.</p>
        </div>

        {/* Editor Preferences */}
        <Card className="p-6 space-y-4 border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] shadow-xl">
          <span className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9] font-semibold block">
            EDITOR PREFERENCES
          </span>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#E5DFC9]">Editor Font Size</p>
                <p className="text-2xs text-[#E5DFC9]/60">Monaco code font size in pixels</p>
              </div>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="bg-[#000000] border border-[#3A2F1D] rounded-lg px-3 py-1.5 text-xs text-[#E5DFC9] focus:outline-none focus:border-[#E5DFC9]"
              >
                <option value="12">12 px</option>
                <option value="13">13 px (Default)</option>
                <option value="14">14 px</option>
                <option value="16">16 px</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#3A2F1D]">
              <div>
                <p className="font-semibold text-[#E5DFC9]">Code Minimap</p>
                <p className="text-2xs text-[#E5DFC9]/60">Show document overview on the right edge</p>
              </div>
              <button
                onClick={() => setMinimap(!minimap)}
                className={`w-10 h-6 rounded-full transition-colors relative ${minimap ? 'bg-[#E5DFC9]' : 'bg-[#3A2F1D]'}`}
              >
                <span className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${minimap ? 'right-1 bg-[#000000]' : 'left-1 bg-[#E5DFC9]'}`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6 space-y-4 border-[#3A2F1D] bg-[#1A130D] text-[#E5DFC9] shadow-xl">
          <span className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9] font-semibold block">
            PRIVACY &amp; LEADERBOARD
          </span>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-[#E5DFC9]">Display on Global Leaderboard</p>
              <p className="text-2xs text-[#E5DFC9]/60">Allow other engineers to view your review scores</p>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`w-10 h-6 rounded-full transition-colors relative ${showLeaderboard ? 'bg-[#E5DFC9]' : 'bg-[#3A2F1D]'}`}
            >
              <span className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${showLeaderboard ? 'right-1 bg-[#000000]' : 'left-1 bg-[#E5DFC9]'}`} />
            </button>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button size="md" variant="primary" onClick={handleSave} className="font-bold shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            {saved ? 'Settings Saved' : 'Save Changes'}
          </Button>
        </div>
      </main>
    </div>
  )
}
