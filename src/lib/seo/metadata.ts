import type { Metadata } from 'next'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants'

export function getDefaultMetadata(): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rpi-sable.vercel.app'

  return {
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      'Learn real estate investing from Monika Jazyk and her team of experts. Programs for every level — from community access to elite coaching.',
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description:
        'AI-powered real estate investing education. Community, courses, and coaching for every level.',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description:
        'AI-powered real estate investing education. Community, courses, and coaching for every level.',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
