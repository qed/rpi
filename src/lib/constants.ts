export const SITE_NAME = 'RPI Education'
export const SITE_TAGLINE = 'Invest Like the Top 2%'

export const MEMBERSHIP_TIERS = [
  {
    id: 'community',
    name: 'Community Access',
    price: '$30/mo',
    priceValue: 30,
    description: 'Join our investor community and get started on your wealth journey.',
    features: [
      'Private community forum',
      'Monthly group calls',
      'Resource library access',
      'Networking events',
    ],
    teachableUrl: 'https://rpi-education.teachable.com/p/community',
    recommended: false,
  },
  {
    id: 'wealth-immersion',
    name: 'Wealth Immersion Program',
    price: '$297/mo',
    priceValue: 297,
    description: 'Our flagship 7-module program covering every key to real estate wealth.',
    features: [
      'All Community features',
      '7 comprehensive modules',
      'Downloadable tools & templates',
      'Weekly Q&A sessions',
      'Certificate of completion',
    ],
    teachableUrl: 'https://rpi-education.teachable.com/p/wealth-immersion',
    recommended: true,
  },
  {
    id: 'coaching',
    name: 'Personal Coaching',
    price: '$997/mo',
    priceValue: 997,
    description: 'One-on-one coaching with our expert team tailored to your goals.',
    features: [
      'All Wealth Immersion features',
      'Bi-weekly 1:1 coaching calls',
      'Custom investment strategy',
      'Deal analysis support',
      'Priority email support',
    ],
    teachableUrl: 'https://rpi-education.teachable.com/p/coaching',
    recommended: false,
  },
  {
    id: 'elite',
    name: 'Elite Investor',
    price: 'From $15,000',
    priceValue: 15000,
    description: 'For high-net-worth individuals seeking premium, hands-on guidance.',
    features: [
      'All Coaching features',
      'Weekly 1:1 sessions',
      'Direct access to Monika',
      'Joint venture opportunities',
      'Concierge deal sourcing',
    ],
    teachableUrl: 'https://rpi-education.teachable.com/p/elite',
    recommended: false,
  },
] as const

export const RATE_LIMIT = {
  messagesPerHour: parseInt(process.env.RATE_LIMIT_MESSAGES_PER_HOUR || '20', 10),
  emailGateMessageCount: 3,
}

export const LEAD_SCORE_THRESHOLDS = {
  cold: 20,
  warm: 50,
} as const

export const EVENT_SCORES: Record<string, number> = {
  page_view: 1,
  chat_start: 5,
  chat_message: 2,
  quiz_start: 10,
  quiz_complete: 25,
  email_capture: 15,
  cta_click: 20,
}
