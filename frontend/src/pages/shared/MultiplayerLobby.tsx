import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Swords, PlusCircle, LogIn, Users, ArrowRight, Clock, Shield
} from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

export default function MultiplayerLobby() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('4821')

  const samplePlayers = [
    { name: 'Afrid Shaik', avatar: 'AF', status: 'Host (Ready)', isHost: true },
    { name: 'Rahul Sharma', avatar: 'RS', status: 'Ready', isHost: false },
    { name: 'Karthik Rao', avatar: 'KR', status: 'Ready', isHost: false },
    { name: 'Suman Sen', avatar: 'SS', status: 'Waiting...', isHost: false },
  ]

  return (
    <div className="min-h-screen bg-navy-midnight text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar variant="pro" />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="navy" size="sm">SYNCHRONIZED BATTLE ARENA</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Code Review Battle
          </h1>
          <p className="text-sm text-slate">
            Review the same codebase under time pressure. Highest review precision wins.
          </p>
        </div>

        {/* Room Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room */}
          <Card dark className="p-6 border-navy-border bg-navy-surface space-y-4">
            <div className="w-10 h-10 rounded-xl bg-aqua/10 text-aqua flex items-center justify-center">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Private Room</h3>
              <p className="text-xs text-slate mt-1">Host a live review match with up to 6 engineers.</p>
            </div>
            <Button
              fullWidth
              size="md"
              onClick={() => navigate('/battle/4821')}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none"
            >
              Create Room #4821
            </Button>
          </Card>

          {/* Join Room */}
          <Card dark className="p-6 border-navy-border bg-navy-surface space-y-4">
            <div className="w-10 h-10 rounded-xl bg-navy-midnight border border-navy-border text-slate flex items-center justify-center">
              <LogIn size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Join Existing Room</h3>
              <p className="text-xs text-slate mt-1">Enter a 4-digit code provided by your host.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="4821"
                className="w-full px-3 py-2 bg-navy-midnight border border-navy-border rounded-xl text-xs font-mono text-white focus:outline-none focus:border-aqua"
              />
              <Button
                size="md"
                variant="dark"
                onClick={() => navigate(`/battle/${roomCode}`)}
              >
                Join
              </Button>
            </div>
          </Card>
        </div>

        {/* Room Preview */}
        <Card dark className="p-6 border-aqua/30 bg-navy-surface space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-navy-border pb-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white">Room #4821</span>
              <Badge variant="success" size="sm" dot>Open Lobby</Badge>
            </div>
            <span className="text-xs font-mono text-slate">4 / 6 Reviewers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {samplePlayers.map((p, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-navy-midnight border border-navy-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-aqua/20 border border-aqua/40 text-aqua font-bold text-xs flex items-center justify-center">
                  {p.avatar}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                  <span className={`text-2xs font-semibold ${p.status.includes('Ready') ? 'text-success' : 'text-slate'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-navy-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-aqua" />
              <span>Target: Flask Auth Gateway · Time limit: 03:00</span>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/battle/4821')}
              iconRight={<ArrowRight size={16} />}
              className="bg-aqua text-navy hover:bg-aqua-bright font-bold border-none w-full sm:w-auto"
            >
              Start Battle Match
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
