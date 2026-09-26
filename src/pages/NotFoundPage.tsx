import { ArrowLeft } from 'lucide-react'

import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const TITLE = 'Page not found'
const DESCRIPTION = 'The page you were looking for does not exist.'

export default function NotFoundPage() {
  useDocumentMeta({ title: TITLE, description: DESCRIPTION, noIndex: true })

  return (
    <section className="flex min-h-[80svh] items-center py-32">
      <Container>
        <p className="label-xs text-electric-400">Error 404</p>
        <h1 className="mt-6 text-[clamp(2.5rem,7vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.04em]">
          This page does not exist.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-bone-400">
          The link may be out of date, or the address might have a typo. Everything we have built
          is one click away.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/" variant="primary" size="lg" trailing={<ArrowLeft className="size-4" />}>
            Back to home
          </ButtonLink>
          <ButtonLink to="/projects" variant="secondary" size="lg">
            Browse projects
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
