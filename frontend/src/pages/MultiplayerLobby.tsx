import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, LogIn, Users, Zap, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { mockBattleRoom } from '../mock/battle'

// ─── Player Card ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-accent/20 text-accent',
  'bg-success/20 text-success',
  'bg-warning/20 text-warning',
  'bg-danger/20 text-danger',
]

interface PlayerCardProps {
  name: string
  avatar: string
  ready: boolean
  colorIdx: number
}

function PlayerCard({ name, avatar, ready, colorIdx }: PlayerCardProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-elevated border border-border">
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
          AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]
        )}
      >
        {avatar}
      </div>
      <span className="text-sm text-text-primary font-medium flex-1">{name}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={clsx(
            'w-2 h-2 rounded-full',
            ready ? 'bg-success' : 'bg-text-muted'
          )}
        />
        <span className={clsx('text-xs', ready ? 'text-success' : 'text-text-muted')}>
          {ready ? 'Ready' : 'Waiting'}
        </span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const READY_STATES = [true, false, true, false]

export default function MultiplayerLobby() {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const room = mockBattleRoom

  return (
    <div className="min-h-screen bg-bg-primary px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Zap size={18} className="text-accent" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              Code Review Battle
            </h1>
          </div>
          <p className="text-text-secondary text-sm pl-12">
            Review the same code, independently. Best reviewer wins.
          </p>
        </motion.div>

        {/* Create / Join cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <Card padding="lg" className="h-full flex flex-col gap-6">
              <div className="flex flex-col items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <PlusCircle size={24} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Create Room</h2>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Start a private room. Share the code with up to 6 players.
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted uppercase tracking-wider font-medium">
                    Room name <span className="normal-case text-text-muted">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Room #4821"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<PlusCircle size={16} />}
                onClick={() => navigate('/battle/4821')}
              >
                Create Room
              </Button>
            </Card>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.14 }}
          >
            <Card padding="lg" className="h-full flex flex-col gap-6">
              <div className="flex flex-col items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center">
                  <LogIn size={24} className="text-text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Join Room</h2>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Enter a room code shared by the host to jump in.
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-text-muted uppercase tracking-wider font-medium">
                    Room code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors font-mono tracking-widest"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<LogIn size={16} />}
                disabled={!joinCode.trim()}
                onClick={() => navigate(`/battle/${joinCode.trim()}`)}
              >
                Join Room
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Room Preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22 }}
        >
          <Card padding="lg" className="space-y-5">
            {/* Room header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-text-primary">
                  Room #{room.id}
                </h3>
                <Badge variant="success" dot>Open</Badge>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-xs">
                <Users size={13} />
                <span className="font-mono">{room.players.length} / 6 players</span>
              </div>
            </div>

            {/* Player grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {room.players.map((player, idx) => (
                <PlayerCard
                  key={player.id}
                  name={player.name}
                  avatar={player.avatar}
                  ready={READY_STATES[idx]}
                  colorIdx={idx}
                />
              ))}
            </div>

            {/* Exercise info */}
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-bg-elevated border border-border">
              <Clock size={14} className="text-text-muted shrink-0" />
              <div className="flex items-center flex-wrap gap-2 text-sm">
                <span className="text-text-muted">Exercise:</span>
                <span className="text-text-primary font-medium">Flask Authentication Patch</span>
                <span className="text-border">·</span>
                <Badge variant="muted">Python</Badge>
                <Badge variant="warning">Medium</Badge>
              </div>
            </div>

            {/* Start battle */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<Zap size={16} />}
              onClick={() => navigate('/battle/4821')}
            >
              Start Battle
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
