import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { PanelRightClose, PanelRightOpen, Columns, Maximize2 } from 'lucide-react'

interface DraggableLayoutProps {
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
  showOutputPanel?: boolean
  onToggleOutput?: () => void
}

export function DraggableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  showOutputPanel = true,
  onToggleOutput,
}: DraggableLayoutProps) {
  // Panel widths in percentage: left, center, right
  const [leftWidth, setLeftWidth] = useState(30) // 30%
  const [rightWidth, setRightWidth] = useState(30) // 30%
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingLeft = useRef(false)
  const isDraggingRight = useRef(false)

  const handleMouseDownLeft = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingLeft.current = true
    document.body.style.cursor = 'col-resize'
  }

  const handleMouseDownRight = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRight.current = true
    document.body.style.cursor = 'col-resize'
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const totalWidth = containerRect.width

      if (isDraggingLeft.current) {
        const mouseX = e.clientX - containerRect.left
        const newLeftPercent = Math.max(15, Math.min(50, (mouseX / totalWidth) * 100))
        setLeftWidth(newLeftPercent)
      } else if (isDraggingRight.current) {
        const mouseXFromRight = containerRect.right - e.clientX
        const newRightPercent = Math.max(15, Math.min(50, (mouseXFromRight / totalWidth) * 100))
        setRightWidth(newRightPercent)
      }
    }

    const handleMouseUp = () => {
      isDraggingLeft.current = false
      isDraggingRight.current = false
      document.body.style.cursor = 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const currentRightWidth = showOutputPanel ? rightWidth : 0
  const centerWidth = 100 - leftWidth - currentRightWidth

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full flex flex-col md:flex-row overflow-hidden select-none bg-[#000000]"
    >
      {/* 1. Left Panel (Problem Statement / AI Snippet) */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="h-full overflow-hidden flex flex-col border-r border-[#3A2F1D] bg-[#000000] min-w-[240px]"
      >
        {leftPanel}
      </div>

      {/* Gutter Handle 1 (Left <-> Center) */}
      <div
        onMouseDown={handleMouseDownLeft}
        className="w-1.5 hover:w-2 bg-[#1A130D] hover:bg-[#E5DFC9]/50 border-x border-[#3A2F1D] cursor-col-resize transition-colors flex items-center justify-center z-10 select-none group"
      >
        <div className="w-0.5 h-6 bg-[#3A2F1D] group-hover:bg-[#E5DFC9] rounded-full" />
      </div>

      {/* 2. Center Panel (Monaco Editor) */}
      <div
        style={{ width: `${centerWidth}%` }}
        className="h-full overflow-hidden flex flex-col bg-[#000000] min-w-[300px]"
      >
        {centerPanel}
      </div>

      {/* Gutter Handle 2 (Center <-> Right) - Only if output panel is open */}
      {showOutputPanel && (
        <div
          onMouseDown={handleMouseDownRight}
          className="w-1.5 hover:w-2 bg-[#1A130D] hover:bg-[#E5DFC9]/50 border-x border-[#3A2F1D] cursor-col-resize transition-colors flex items-center justify-center z-10 select-none group"
        >
          <div className="w-0.5 h-6 bg-[#3A2F1D] group-hover:bg-[#E5DFC9] rounded-full" />
        </div>
      )}

      {/* 3. Right Panel (Collapsible Output Panel: Terminal & AI Feedback) */}
      {showOutputPanel && (
        <div
          style={{ width: `${currentRightWidth}%` }}
          className="h-full overflow-hidden flex flex-col border-l border-[#3A2F1D] bg-[#1A130D] min-w-[240px]"
        >
          {rightPanel}
        </div>
      )}
    </div>
  )
}
