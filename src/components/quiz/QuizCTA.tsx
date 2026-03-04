import type { MembershipTierId } from '@/types'

interface QuizCTAProps {
  tierId: MembershipTierId
  teachableUrl: string
}

export function QuizCTA({ tierId, teachableUrl }: QuizCTAProps) {
  const utmUrl = `${teachableUrl}?utm_source=rpi_helper&utm_medium=quiz&utm_campaign=recommendation&utm_content=${tierId}`

  return (
    <a
      href={utmUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 block w-full rounded-lg bg-rpiGold py-3 text-center font-medium text-white transition-colors hover:bg-rpiNavy"
    >
      Get Started Now
    </a>
  )
}
