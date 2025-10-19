import { motion } from 'framer-motion'

function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  ...props 
}) {
  const hoverAnimation = hover ? {
    scale: 1.02,
    boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)'
  } : {}

  return (
    <motion.div
      className={`glass-card p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={hoverAnimation}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard

