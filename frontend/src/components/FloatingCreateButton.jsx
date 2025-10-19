import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

function FloatingCreateButton() {
  const navigate = useNavigate()

  return (
    <motion.button
      onClick={() => navigate('/create')}
      className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-story-pink-400 to-story-purple-500 
                 text-white text-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 25px 50px rgba(168, 85, 247, 0.6)'
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      title="Create New Story"
    >
      <motion.span
        animate={{ rotate: [0, 90, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        ✨
      </motion.span>
    </motion.button>
  )
}

export default FloatingCreateButton

