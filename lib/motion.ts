import type { Variants, Transition } from "framer-motion"

/**
 * Standard Transitions for smooth, professional motion - slightly refined pacing for elegant visibility
 */
export const defaultTransition: Transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
}

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
}

// Hero entrance variants (0.7s, 0.12s stagger)
export const heroStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
}

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export const heroSearchSlideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// Hero photo scale 1.06 -> 1 over 1.6s
export const heroPhotoScale: Variants = {
  hidden: { scale: 1.06, opacity: 0.8 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// Fade up with whileInView once (viewport margin -80px), stagger 0.1s
export const cardStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const cardFadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// Modal scale 0.96 -> 1 + fade, 260ms
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.26,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
}

// Backwards-compatible exports
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: customDelay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: customDelay,
    },
  }),
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
}

export const cardEntrance: Variants = cardFadeUp

export const cardHover: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -3,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export const heroBadge: Variants = heroItem
export const heroHeading: Variants = heroItem
export const heroSubtitle: Variants = heroItem
export const heroSearch: Variants = heroSearchSlideUp
