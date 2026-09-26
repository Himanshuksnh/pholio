import type { LucideIcon } from 'lucide-react'
import {
  CloudUpload,
  CodeXml,
  CreditCard,
  Database,
  Gauge,
  Globe,
  LayoutDashboard,
  PenTool,
  Smartphone,
} from 'lucide-react'

import type { Service, ServiceIcon } from '@/data/services'
import { cn } from '@/lib/cn'

/** Icon registry for the service cards. */
const serviceIcons: Record<ServiceIcon, LucideIcon> = {
  globe: Globe,
  mobile: Smartphone,
  code: CodeXml,
  design: PenTool,
  dashboard: LayoutDashboard,
  database: Database,
  payment: CreditCard,
  performance: Gauge,
  cloud: CloudUpload,
}

export interface ServiceCardProps {
  service: Service
  /** 1-based position, rendered as a quiet index marker. */
  index: number
  className?: string
}

/** Bordered service card: icon, index, title, description and deliverables. */
export function ServiceCard({ service, index, className }: ServiceCardProps) {
  const Icon = serviceIcons[service.icon]

  return (
    <article
      className={cn(
        'edge-highlight group flex h-full flex-col rounded-2xl border border-line bg-ink-900/40 p-6',
        'transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:border-electric-500/30 hover:bg-ink-850/60 sm:p-7',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-xl border border-line-strong text-bone-300 transition-colors duration-500 group-hover:border-electric-500/40 group-hover:text-electric-300"
        >
          <Icon className="size-[1.125rem]" strokeWidth={1.5} />
        </span>
        <span
          aria-hidden="true"
          className="label-xs pt-1.5 text-bone-600 transition-colors duration-500 group-hover:text-electric-400/90"
        >
          {String(index).padStart(2, '0')}
        </span>
      </div>

      <h2 className="mt-7 text-lg font-medium tracking-[-0.02em] text-bone-50">
        {service.title}
      </h2>

      <p className="mt-3.5 text-sm leading-relaxed text-bone-400">{service.description}</p>

      <ul className="mt-7 space-y-2.5 border-t border-line pt-5">
        {service.includes.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-xs text-bone-500">
            <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-bone-600" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
