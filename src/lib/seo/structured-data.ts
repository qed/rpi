import { SITE_NAME } from '@/lib/constants'

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rpi-sable.vercel.app',
    description:
      'Real estate investing education. Learn to invest like the top 2% with Monika Jazyk and her team of experts.',
    founder: {
      '@type': 'Person',
      name: 'Monika Jazyk',
    },
  }
}

export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is RPI Education?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RPI Education is a real estate investing education company that offers programs ranging from community access to elite coaching.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is Monika Jazyk?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Monika Jazyk is the founder of RPI Education with over 15 years of experience in real estate investing.',
        },
      },
      {
        '@type': 'Question',
        name: 'What programs does RPI offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RPI offers Community Access ($30/mo), Wealth Immersion Program ($297/mo), Personal Coaching ($997/mo), and Elite Investor (from $15,000).',
        },
      },
    ],
  }
}
