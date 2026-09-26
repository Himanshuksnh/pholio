import { ContactCta } from '@/components/home/ContactCta'
import { Hero } from '@/components/home/Hero'
import { Intro } from '@/components/home/Intro'
import { ProcessSection } from '@/components/home/ProcessSection'
import { SelectedProjects } from '@/components/home/SelectedProjects'
import { ServicesOverview } from '@/components/home/ServicesOverview'
import { site } from '@/config/site'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function HomePage() {
  useDocumentMeta({
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  })

  return (
    <>
      <Hero />
      <Intro />
      <SelectedProjects />
      <ServicesOverview />
      <ProcessSection />
      <ContactCta />
    </>
  )
}
