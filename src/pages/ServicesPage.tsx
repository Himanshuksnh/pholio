import { ContactCta } from '@/components/home/ContactCta'
import { RevealItem, RevealGroup } from '@/components/motion/Reveal'
import { ServiceCard } from '@/components/services/ServiceCard'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { engagementBasics, services } from '@/data/services'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const TITLE = 'Services'
const DESCRIPTION =
  'Nine practices covering the full lifecycle of a software product — from the first sketch through deployment, optimisation and the maintenance that follows.'

export default function ServicesPage() {
  useDocumentMeta({ title: TITLE, description: DESCRIPTION })

  return (
    <>
      <PageHeader
        eyebrow="Capabilities"
        title={
          <>
            Built to cover the whole{' '}
            <span className="font-accent text-electric-gradient">lifecycle.</span>
          </>
        }
        description={DESCRIPTION}
      />

      <Container className="pb-8">
        <RevealGroup as="ul" className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {services.map((service, index) => (
            <RevealItem key={service.id} as="li" className="h-full">
              <ServiceCard service={service} index={index + 1} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      <Section
        ariaLabel="What every engagement includes"
        spacing="lg"
        className="mt-20 sm:mt-24"
        containerClassName="border-t border-line pt-16 sm:pt-20"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-2xl leading-tight tracking-[-0.028em] sm:text-3xl">
              On every engagement,
              <br />
              <span className="font-accent text-bone-400">without exception.</span>
            </h2>
          </div>

          <div className="lg:col-span-8">
            <RevealGroup as="ul" className="grid list-none gap-x-10 gap-y-8 p-0 sm:grid-cols-2">
              {engagementBasics.map((item) => (
                <RevealItem key={item.title} as="li">
                  <h3 className="text-sm font-medium text-bone-100">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-bone-500">{item.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </Section>

      <ContactCta />
    </>
  )
}
