import type { ReactNode } from 'react'

import { Backdrop } from './Backdrop'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollToTop } from './ScrollToTop'

/** Shared chrome for every route: backdrop, navigation, main landmark, footer. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Backdrop />
      <ScrollToTop />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
