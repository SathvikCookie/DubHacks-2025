import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getVoices, createCustomVoice } from '../services/api'
import GlassCard from './GlassCard'
import GradientButton from './GradientButton'

const API_BASE = 'http://localhost:5001/api'

function VoiceSelector({ selectedVoiceId, onVoiceSelect }) {
  const [voices, setVoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCustomVoice, setShowCustomVoice] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [customVoiceName, setCustomVoiceName] = useState('')
  const [isCreatingVoice, setIsCreatingVoice] = useState(false)
  const [error, setError] = useState(null)
  const [playingPreview, setPlayingPreview] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioPreviewRef = useRef(null)

  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = async () => {
    try {
      setLoading(true)
      const response = await getVoices()
      if (response.success && response.voices) {
        setVoices(response.voices)
        // Select first voice by default
        if (!selectedVoiceId && response.voices.length > 0) {
          onVoiceSelect(response.voices[0].voice_id)
        }
      }
    } catch (err) {
      console.error('Error loading voices:', err)
      setError('Failed to load voices')
    } finally {
      setLoading(false)
    }
  }

  const playPreview = (voiceId) => {
    if (playingPreview === voiceId) {
      // Stop current preview
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause()
        audioPreviewRef.current.currentTime = 0
      }
      setPlayingPreview(null)
    } else {
      // Play new preview
      setPlayingPreview(voiceId)
      const audio = new Audio(`${API_BASE}/voices/preview/${voiceId}`)
      audioPreviewRef.current = audio
      
      audio.onended = () => {
        setPlayingPreview(null)
      }
      
      audio.onerror = () => {
        setPlayingPreview(null)
        console.error('Error playing preview')
      }
      
      audio.play()
    }
  }

  const startRecording = async () => {
    try {
      // Request high-quality audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      })
      
      // Configure MediaRecorder with high-quality settings
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000  // 128 kbps for better quality
      }
      
      // Fallback if opus is not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm'
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: options.mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          // Auto-stop at 3 minutes (180 seconds)
          if (newTime >= 180) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please grant permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setAudioBlob(file)
      setAudioUrl(URL.createObjectURL(file))
    }
  }

  const createVoice = async () => {
    if (!audioBlob || !customVoiceName.trim()) {
      setError('Please provide a voice name and audio recording')
      return
    }

    try {
      setIsCreatingVoice(true)
      setError(null)

      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'voice_recording.webm')
      formData.append('name', customVoiceName)
      formData.append('description', 'Custom storytelling voice')

      const response = await createCustomVoice(formData)

      if (response.success) {
        // Add new voice to the list
        const newVoice = {
          voice_id: response.voice_id,
          name: response.name,
          description: response.description || 'Custom voice',
          is_custom: true
        }
        setVoices([...voices, newVoice])
        
        // Select the new custom voice
        onVoiceSelect(response.voice_id)
        
        // Reset form
        setShowCustomVoice(false)
        setAudioBlob(null)
        setAudioUrl(null)
        setCustomVoiceName('')
        
        alert(`Voice "${response.name}" created successfully! It's now selected in the dropdown.`)
      }
    } catch (err) {
      console.error('Error creating voice:', err)
      setError(err.message || 'Failed to create voice. Note: Voice cloning requires a paid ElevenLabs plan.')
    } finally {
      setIsCreatingVoice(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-4xl"
          >
            🎤
          </motion.div>
          <span className="ml-3 text-white/70">Loading voices...</span>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Select Voice {selectedVoiceId && voices.find(v => v.voice_id === selectedVoiceId)?.is_custom && (
              <span className="ml-2 text-xs bg-story-purple-500/30 px-2 py-1 rounded-full text-story-purple-200">
                ✨ Custom Voice Selected
              </span>
            )}
          </label>
          <p className="text-white/60 text-xs mb-3">Choose who will narrate your story</p>
        </div>

        <AnimatePresence mode="wait">
          {!showCustomVoice ? (
            <motion.div
              key="voice-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-3"
            >
              {/* Dropdown */}
              <select
                value={selectedVoiceId || ''}
                onChange={(e) => onVoiceSelect(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white/10 border-2 border-white/20 
                         focus:border-story-purple-400 focus:ring-2 focus:ring-story-purple-400/50 
                         text-white placeholder-white/40 transition-all appearance-none cursor-pointer
                         hover:bg-white/15 backdrop-blur-sm text-base"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '3rem'
                }}
              >
                {voices.map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id} className="bg-gray-800 text-white">
                    {voice.is_custom ? '✨ ' : ''}{voice.name} - {voice.description}
                  </option>
                ))}
              </select>

              {/* Preview Button */}
              {selectedVoiceId && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => playPreview(selectedVoiceId)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 
                           hover:bg-white/20 hover:border-white/30 text-white transition-all
                           flex items-center justify-center gap-2 backdrop-blur-sm font-medium"
                >
                  {playingPreview === selectedVoiceId ? (
                    <>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        🔊
                      </motion.span>
                      <span>Playing Preview...</span>
                    </>
                  ) : (
                    <>
                      <span>🎧</span>
                      <span>Preview Voice</span>
                    </>
                  )}
                </motion.button>
              )}

              {/* Custom Voice Button */}
              <button
                type="button"
                onClick={() => setShowCustomVoice(true)}
                className="w-full px-5 py-4 rounded-xl bg-gradient-to-r from-story-purple-500/20 to-story-blue-500/20 
                         border-2 border-story-purple-400/50 hover:border-story-purple-400 
                         text-white transition-all hover:scale-[1.02] backdrop-blur-sm
                         flex items-center justify-center gap-2 font-medium"
              >
                <span>🎤</span>
                <span>Record Your Own Voice</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="custom-voice"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              {/* Back Button */}
              <button
                type="button"
                onClick={() => {
                  setShowCustomVoice(false)
                  setAudioBlob(null)
                  setAudioUrl(null)
                  setError(null)
                }}
                className="text-white/70 hover:text-white flex items-center gap-2 transition-colors"
              >
                <span>←</span>
                <span>Back to voice selection</span>
              </button>

              {/* Recording Instructions */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Recording Tips for Best Quality
                </h4>
                <ul className="text-sm text-white/80 space-y-1 ml-6 list-disc">
                  <li>Speak in varying tones and emotions</li>
                  <li>Record for close to 3 minutes (but less than 3 minutes)</li>
                  <li>Use a quiet environment for best results</li>
                  <li>Position mic 6-12 inches from your mouth</li>
                  <li>Speak clearly and naturally at a consistent volume</li>
                  <li>Consider using an external microphone if available</li>
                </ul>
              </div>

              {/* Voice Name Input */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Voice Name *
                </label>
                <input
                  type="text"
                  value={customVoiceName}
                  onChange={(e) => setCustomVoiceName(e.target.value)}
                  placeholder="e.g., Mom's Voice, Dad's Voice"
                  className="w-full px-5 py-4 rounded-xl bg-white/10 border-2 border-white/20 
                           focus:border-story-purple-400 focus:ring-2 focus:ring-story-purple-400/50 
                           text-white placeholder-white/40 transition-all backdrop-blur-sm"
                />
              </div>

              {/* Recording Controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {!audioBlob ? (
                    <>
                      <GradientButton
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex-1 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                      >
                        {isRecording ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ⏹️
                            </motion.span>
                            Stop Recording {formatTime(recordingTime)}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            🎤 Start Recording
                          </span>
                        )}
                      </GradientButton>
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRecording}
                        className="px-4 py-2 rounded-xl bg-white/10 border-2 border-white/20 
                                 hover:bg-white/20 hover:border-white/30 text-white transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                      >
                        📁 Upload File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="flex-1 space-y-3">
                      {/* Audio Preview */}
                      <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/90 font-medium">✓ Audio Ready</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAudioBlob(null)
                              setAudioUrl(null)
                            }}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                        {audioUrl && (
                          <audio controls src={audioUrl} className="w-full">
                            Your browser does not support audio playback.
                          </audio>
                        )}
                      </div>

                      {/* Create Voice Button */}
                      <GradientButton
                        onClick={createVoice}
                        disabled={isCreatingVoice || !customVoiceName.trim()}
                        className="w-full"
                      >
                        {isCreatingVoice ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              ✨
                            </motion.span>
                            Creating Voice...
                          </span>
                        ) : (
                          '✨ Create Custom Voice'
                        )}
                      </GradientButton>
                    </div>
                  )}
                </div>

                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-white/60 text-sm"
                  >
                    Recording will auto-stop at 3 minutes
                  </motion.div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-start gap-2 backdrop-blur-sm"
                >
                  <span className="text-red-400">⚠️</span>
                  <div>
                    <p className="text-red-300 text-sm font-medium">Error</p>
                    <p className="text-red-200 text-xs">{error}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}

export default VoiceSelector
