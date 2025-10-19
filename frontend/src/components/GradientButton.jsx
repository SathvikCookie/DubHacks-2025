import { motion } from 'framer-motion'

function GradientButton({ 
  children, 
  onClick, 
  disabled = false, 
  className = '', 
  size = 'medium',
  variant = 'primary',
  type = 'button',
  ...props 
}) {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }

  const variantClasses = {
    primary: 'gradient-button',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50'
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variant === 'primary' ? variantClasses.primary : variantClasses.secondary}
        ${sizeClasses[size]}
        ${className}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      `}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default GradientButton

