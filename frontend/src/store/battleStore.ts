import { create } from 'zustand'
import type { BattleRoomState, BattlePlayer } from '../types'
import { mockProblems } from '../mock/problems'

interface BattleStore {
  activeRoom: BattleRoomState | null
  isSearchingMatch: boolean
  createFriendRoom: (problemCount?: number) => BattleRoomState
  joinFriendRoom: (roomCode: string) => { success: boolean; room?: BattleRoomState; message?: string }
  startRandomMatch: () => Promise<BattleRoomState>
  submitBattleCode: (userCode: string) => void
  endBattle: () => void
}

const mockOpponents: BattlePlayer[] = [
  { id: 'usr_2', name: 'Elena Rostova', avatar: 'ER', score: 820, submitted: false },
  { id: 'usr_3', name: 'Rahul Sharma', avatar: 'RS', score: 740, submitted: false },
  { id: 'usr_4', name: 'Devon Vance', avatar: 'DV', score: 690, submitted: false },
]

export const useBattleStore = create<BattleStore>((set, get) => ({
  activeRoom: null,
  isSearchingMatch: false,

  createFriendRoom: (problemCount = 1) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const selectedProblems = mockProblems.slice(0, Math.min(problemCount, mockProblems.length))

    const room: BattleRoomState = {
      roomId: `room_${code}`,
      roomCode: code,
      type: 'friend',
      hostId: 'usr_afrid',
      status: 'waiting',
      problemCount,
      problems: selectedProblems,
      currentProblemIndex: 0,
      timeLimitSeconds: 180 * problemCount,
      timeRemainingSeconds: 180 * problemCount,
      speedBonusRemaining: 20,
      players: [
        { id: 'usr_afrid', name: 'Afrid Shaik', avatar: 'AF', isHost: true, score: 0, submitted: false, isCurrentUser: true },
        { id: 'usr_2', name: 'Elena Rostova', avatar: 'ER', score: 0, submitted: false },
        { id: 'usr_3', name: 'Rahul Sharma', avatar: 'RS', score: 0, submitted: false },
      ],
    }

    set({ activeRoom: room })
    return room
  },

  joinFriendRoom: (roomCode: string) => {
    if (!roomCode || roomCode.length < 4) {
      return { success: false, message: 'Invalid room code' }
    }

    const room: BattleRoomState = {
      roomId: `room_${roomCode}`,
      roomCode,
      type: 'friend',
      hostId: 'usr_2',
      status: 'in_progress',
      problemCount: 1,
      problems: [mockProblems[0]],
      currentProblemIndex: 0,
      timeLimitSeconds: 180,
      timeRemainingSeconds: 180,
      speedBonusRemaining: 20,
      players: [
        { id: 'usr_2', name: 'Elena Rostova (Host)', avatar: 'ER', isHost: true, score: 0, submitted: false },
        { id: 'usr_afrid', name: 'Afrid Shaik', avatar: 'AF', score: 0, submitted: false, isCurrentUser: true },
        { id: 'usr_3', name: 'Rahul Sharma', avatar: 'RS', score: 0, submitted: false },
      ],
    }

    set({ activeRoom: room })
    return { success: true, room }
  },

  startRandomMatch: async () => {
    set({ isSearchingMatch: true })

    // Simulate ELO matchmaking delay
    await new Promise((res) => setTimeout(res, 1200))

    const roomCode = Math.floor(100000 + Math.random() * 900000).toString()
    const room: BattleRoomState = {
      roomId: `ranked_${roomCode}`,
      roomCode,
      type: 'ranked',
      hostId: 'system',
      status: 'in_progress',
      problemCount: 1,
      problems: [mockProblems[0]],
      currentProblemIndex: 0,
      timeLimitSeconds: 180,
      timeRemainingSeconds: 180,
      speedBonusRemaining: 20,
      players: [
        { id: 'usr_afrid', name: 'Afrid Shaik', avatar: 'AF', score: 0, submitted: false, isCurrentUser: true },
        { id: 'usr_2', name: 'Elena Rostova', avatar: 'ER', score: 0, submitted: false },
        { id: 'usr_3', name: 'Rahul Sharma', avatar: 'RS', score: 0, submitted: false },
        { id: 'usr_4', name: 'Devon Vance', avatar: 'DV', score: 0, submitted: false },
      ],
    }

    set({ activeRoom: room, isSearchingMatch: false })
    return room
  },

  submitBattleCode: (userCode: string) => {
    const room = get().activeRoom
    if (!room) return

    // Calculate score: Complexity (60%) + Speed Bonus (20%) + Accuracy (20%)
    const speedBonus = room.speedBonusRemaining
    const userScore = 60 + speedBonus + 15 // 95 pts

    const updatedPlayers = room.players.map((p) => {
      if (p.isCurrentUser) {
        return { ...p, score: userScore, submitted: true, submitTimeSeconds: 180 - room.timeRemainingSeconds }
      }
      return p
    })

    // Simulate opponent submissions
    setTimeout(() => {
      set((state) => {
        if (!state.activeRoom) return state
        const withOpponents = state.activeRoom.players.map((p) => {
          if (p.id === 'usr_2') return { ...p, score: 790, submitted: true }
          if (p.id === 'usr_3') return { ...p, score: 710, submitted: true }
          if (p.id === 'usr_4') return { ...p, score: 680, submitted: true }
          return p
        })
        return {
          activeRoom: {
            ...state.activeRoom,
            players: withOpponents,
            status: 'completed',
          },
        }
      })
    }, 1500)

    set({
      activeRoom: {
        ...room,
        players: updatedPlayers,
        speedBonusRemaining: Math.max(5, speedBonus - 5),
      },
    })
  },

  endBattle: () => {
    set({ activeRoom: null })
  },
}))
