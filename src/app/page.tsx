import { Hero } from '@/components/landing/Hero'
import { About } from '@/components/landing/About'
import { Testimonials } from '@/components/landing/Testimonials'
import { MembershipComparison } from '@/components/landing/MembershipComparison'
import { Storefront } from '@/components/landing/Storefront'
import { EmailCapture } from '@/components/landing/EmailCapture'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Testimonials />
      <MembershipComparison />
      <Storefront />
      <EmailCapture />
    </main>
  )
}
