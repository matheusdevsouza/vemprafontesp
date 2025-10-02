"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaStepBackward,
  FaStepForward,
  FaSpinner
} from 'react-icons/fa';

interface CustomVideoPlayerProps {
  src: string;
  thumbnail?: string;
  alt: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export default function CustomVideoPlayer({ 
  src, 
  thumbnail, 
  alt, 
  className = '',
  autoPlay = false,
  muted = true,
  loop = false
}: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Format time to MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      videoRef.current.muted = clampedVolume === 0;
      setVolume(clampedVolume);
      setIsMuted(clampedVolume === 0);
    }
  };

  // Handle volume click
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newVolume = Math.max(0, Math.min(1, percentage));
      handleVolumeChange(newVolume);
    }
  };

  // Handle seek
  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      const clampedTime = Math.max(0, Math.min(duration, newTime));
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && e.currentTarget && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      handleSeek(newTime);
    }
  };

  // Skip backward/forward
  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };


  // Show/hide controls
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  return (
    <div 
      className={`relative group bg-dark-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-700/50 shadow-2xl ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        preload="metadata"
        onClick={togglePlay}
      >
        Seu navegador não suporta vídeos.
      </video>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-900/80 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <FaSpinner className="text-primary-500 animate-spin" size={32} />
              <span className="text-gray-300 text-sm">Carregando vídeo...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play Button Overlay */}
      <AnimatePresence>
        {!isPlaying && !showControls && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-20 h-20 bg-primary-500/90 hover:bg-primary-500 rounded-full flex items-center justify-center text-white shadow-2xl backdrop-blur-sm transition-all duration-300"
            >
              <FaPlay size={24} className="ml-1" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          >

            {/* Center Controls */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-6">
                {/* Skip Backward */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => skipTime(-10)}
                  className="w-12 h-12 bg-dark-800/90 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
                  title="Voltar 10s"
                >
                  <FaStepBackward size={18} />
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-16 h-16 bg-primary-500/90 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm shadow-lg"
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
                </motion.button>

                {/* Skip Forward */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => skipTime(10)}
                  className="w-12 h-12 bg-dark-800/90 hover:bg-primary-500 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
                  title="Avançar 10s"
                >
                  <FaStepForward size={18} />
                </motion.button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div 
                  className="relative h-2 bg-dark-700/50 rounded-full overflow-hidden cursor-pointer hover:bg-dark-600/50 transition-colors"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary-500 rounded-full transition-all duration-200"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <div className="absolute inset-0 w-full h-full" />
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Time Display */}
                  <span className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleMute}
                      className="w-8 h-8 bg-dark-800/90 hover:bg-primary-500 rounded flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
                      title={isMuted ? "Ativar som" : "Desativar som"}
                    >
                      {isMuted || volume === 0 ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
                    </motion.button>
                    
                    <div 
                      className="relative w-20 h-1 bg-dark-700/50 rounded-full overflow-hidden cursor-pointer hover:bg-dark-600/50 transition-colors"
                      onClick={handleVolumeClick}
                    >
                      <div 
                        className="absolute left-0 top-0 h-full bg-primary-500 rounded-full transition-all duration-200"
                        style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                      />
                      <div className="absolute inset-0 w-full h-full" />
                    </div>
                  </div>
                </div>

                {/* Playback Speed */}
                <div className="flex items-center gap-2">
                  <select
                    value={playbackRate}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      setPlaybackRate(rate);
                      if (videoRef.current) {
                        videoRef.current.playbackRate = rate;
                      }
                    }}
                    className="bg-dark-800/90 text-white text-sm rounded px-2 py-1 border border-dark-700 focus:border-primary-500 focus:outline-none backdrop-blur-sm"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
