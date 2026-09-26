import { cn } from '@/lib/cn'

import { site } from '@/config/site'

/**
 * Route-level loading state shown while a lazily loaded page chunk arrives.
 * Announced politely so screen reader users are told the page is loading.
 */
export function RouteFallback({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-[70svh] w-full flex-col items-center justify-center gap-6 px-6',
        className,
      )}
    >
      <span className="sr-only">Loading page…</span>
      <div aria-hidden="true" className="flex items-center gap-2">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 animate-pulse rounded-full bg-electric-500/70"
            style={{ animationDelay: `${index * 140}ms`, animationDuration: '1.1s' }}
          />
        ))}
      </div>
      <p aria-hidden="true" className="label-xs text-bone-600">
        {site.name}
      </p>
    </div>
  )
}
