import { motion } from 'framer-motion'

function LoadingOverlay({ message = 'Creating your story...', steps = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-story-dark-950/90 backdrop-blur-sm"
    >
      <div className="text-center max-w-md px-8">
        {/* Animated magical book icon */}
        <motion.div
          className="text-8xl mb-6"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          📚
        </motion.div>

        {/* Main message */}
        <motion.h2
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.h2>

        {/* Progress steps */}
        {steps.length > 0 && (
          <div className="space-y-3 mt-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="flex items-center gap-3 text-left"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-story-purple-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: idx * 0.3
                  }}
                />
                <span className="text-white/80">{step}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Spinning loader */}
        <motion.div
          className="mt-8 flex justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-12 h-12 border-4 border-story-purple-500 border-t-transparent rounded-full" />
        </motion.div>

        <p className="text-white/60 text-sm mt-6">
          ⏱ This usually takes 30-60 seconds
        </p>
      </div>
    </motion.div>
  )
}

export default LoadingOverlay

