import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Swords, Users, Zap, Shield, PlusCircle, LogIn,
  Trophy, Flame, CheckCircle2, ArrowRight, Loader2
} from 'lucide-react'
import { Navbar } from '../components/navigation/Navbar'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useBattleStore } from '../store/battleStore'
import { useAuthStore } from '../store/authStore'

export default function BattleLobby() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { createFriendRoom, joinFriendRoom, startRandomMatch, isSearchingMatch } = useBattleStore()

  const [activeTab, setActiveTab] = useState<'friend' | 'ranked'>('ranked')
  const [problemCount, setProblemCount] = useState(1)
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [joinError, setJoinError] = useState('')

  const handleCreateFriend = () => {
    const room = createFriendRoom(problemCount)
    navigate(`/battle/${room.roomCode}`)
  }

  const handleJoinFriend = () => {
    if (!roomCodeInput) {
      setJoinError('Please enter a 6-digit room code')
      return
    }
    const res = joinFriendRoom(roomCodeInput)
    if (res.success && res.room) {
      navigate(`/battle/${res.room.roomCode}`)
    } else {
      setJoinError(res.message || 'Room not found')
    }
  }

  const handleStartRanked = async () => {
    const room = await startRandomMatch()
    navigate(`/battle/${room.roomCode}`)
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="app" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="gold" size="sm">LIVE MULTIPLAYER CONTEST</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E5DFC9] tracking-tight">
            Code Review Battle Arena
          </h1>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70">
            Compete against engineering peers in real-time complexity optimization and defect localization.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center">
          <div className="flex p-1 rounded-2xl bg-[#1A130D] border border-[#3A2F1D]">
            <button
              onClick={() => setActiveTab('ranked')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'ranked'
                  ? 'bg-[#E5DFC9] text-[#000000] shadow-md'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
              }`}
            >
              <Zap size={14} />
              <span>Random Ranked Match (ELO Rating)</span>
            </button>

            <button
              onClick={() => setActiveTab('friend')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'friend'
                  ? 'bg-[#E5DFC9] text-[#000000] shadow-md'
                  : 'text-[#E5DFC9]/70 hover:text-[#E5DFC9]'
              }`}
            >
              <Users size={14} />
              <span>Friend Match (Custom Room)</span>
            </button>
          </div>
        </div>

        {/* Mode 1: Competitive Ranked Match */}
        {activeTab === 'ranked' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <Card className="p-8 border-[#3A2F1D] bg-[#1A130D] text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#000000] border-2 border-[#E5DFC9] text-[#E5DFC9] flex items-center justify-center mx-auto shadow-md">
                <Swords size={28} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-[#E5DFC9]">Ranked 4-Player Matchmaking</h2>
                <p className="text-xs text-[#E5DFC9]/70 max-w-md mx-auto">
                  Matched by ELO skill rating ({user?.eloRating || 1480} Rating). Submissions are graded on Complexity (60%), Speed Bonus (20%), and Accuracy. Affects your Global Rank!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-2xs font-mono text-[#E5DFC9]/70 pt-2 border-t border-[#3A2F1D]">
                <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D]">
                  <p className="font-bold text-[#E5DFC9]">1 Problem</p>
                  <p className="text-2xs text-[#E5DFC9]/50">Fixed Format</p>
                </div>
                <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D]">
                  <p className="font-bold text-[#E5DFC9]">03:00 Mins</p>
                  <p className="text-2xs text-[#E5DFC9]/50">Time Limit</p>
                </div>
                <div className="p-3 rounded-xl bg-[#000000] border border-[#3A2F1D]">
                  <p className="font-bold text-[#E5DFC9]">+20 Pts</p>
                  <p className="text-2xs text-[#E5DFC9]/50">Speed Bonus</p>
                </div>
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={handleStartRanked}
                loading={isSearchingMatch}
                icon={isSearchingMatch ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="text-[#000000]" />}
                className="w-full font-bold text-xs shadow-xl"
              >
                {isSearchingMatch ? 'Finding Match in your Skill Tier...' : 'Find Ranked Opponents'}
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Mode 2: Friend Custom Room (Create / Join) */}
        {activeTab === 'friend' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left Card: Create Room */}
            <Card className="p-6 sm:p-8 border-[#3A2F1D] bg-[#1A130D] space-y-6 shadow-xl text-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <PlusCircle size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-[#E5DFC9]">Create Private Room</h2>
                    <p className="text-2xs text-[#E5DFC9]/60">Host a friendly match with custom settings.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
                    Number of Problems (1 to 3):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setProblemCount(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                          problemCount === num
                            ? 'bg-[#E5DFC9] text-[#000000] border-[#E5DFC9]'
                            : 'bg-[#000000] border-[#3A2F1D] text-[#E5DFC9]/60 hover:text-[#E5DFC9]'
                        }`}
                      >
                        {num} {num === 1 ? 'Problem' : 'Problems'}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-2xs text-[#E5DFC9]/60 leading-relaxed">
                  Friendly matches show live rankings at the end with zero rating penalty. Perfect for study groups.
                </p>
              </div>

              <Button
                size="md"
                variant="primary"
                onClick={handleCreateFriend}
                icon={<PlusCircle size={14} className="text-[#000000]" />}
                className="w-full font-bold text-xs"
              >
                Create Room Code
              </Button>
            </Card>

            {/* Right Card: Join Room */}
            <Card className="p-6 sm:p-8 border-[#3A2F1D] bg-[#1A130D] space-y-6 shadow-xl text-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <LogIn size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-[#E5DFC9]">Join Existing Room</h2>
                    <p className="text-2xs text-[#E5DFC9]/60">Enter room code provided by host.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-2xs font-mono uppercase tracking-wider text-[#E5DFC9]/70 block font-bold">
                    6-Digit Room Code:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 482190"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => {
                      setRoomCodeInput(e.target.value)
                      setJoinError('')
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#3A2F1D] text-sm font-mono tracking-widest text-[#E5DFC9] placeholder-[#E5DFC9]/30 focus:outline-none focus:border-[#E5DFC9]"
                  />
                  {joinError && <p className="text-2xs text-red-400 font-mono">{joinError}</p>}
                </div>
              </div>

              <Button
                size="md"
                variant="secondary"
                onClick={handleJoinFriend}
                icon={<ArrowRight size={14} />}
                className="w-full font-bold text-xs"
              >
                Join Room
              </Button>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
