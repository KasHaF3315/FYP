import { motion } from 'motion/react';
import { cardEntrance, subwayBounce } from './subwayMotion';

interface AnimatedGameCardProps {
  image: string;
  alt: string;
  onClick: () => void;
  gradient: string;
  delay?: number;
}

export function AnimatedGameCard({ image, alt, onClick, gradient, delay = 0 }: AnimatedGameCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg ${gradient}`}
      {...cardEntrance(delay)}
      whileHover={{ scale: 1.06, y: -8, rotate: -1 }}
      whileTap={{ scale: 0.94 }}
      transition={subwayBounce}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
        animate={{ x: ['-120%', '220%'] }}
        transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
      />

      {/* Floating bob */}
      <motion.img
        src={image}
        alt={alt}
        className="relative z-0 h-full w-full object-cover"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.3 }}
      />

      {/* Gloss overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
    </motion.button>
  );
}
