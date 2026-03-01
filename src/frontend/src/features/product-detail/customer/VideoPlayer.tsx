'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  if (!videoUrl) return null

  // YouTube
  const youtubeMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
  )
  if (youtubeMatch) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">Video sản phẩm</h3>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    )
  }

  // Direct video (mp4, etc.)
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const openFullscreen = () => {
    videoRef.current?.requestFullscreen()
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground">Video sản phẩm</h3>
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />

        {/* Controls overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <button
            onClick={togglePlay}
            className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white fill-white" />
            ) : (
              <Play className="h-6 w-6 text-white fill-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-t from-black/60 to-transparent">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={openFullscreen}
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>

        {/* Play button when not playing and not hovering */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity"
          >
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-7 w-7 text-white fill-white ml-1" />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
