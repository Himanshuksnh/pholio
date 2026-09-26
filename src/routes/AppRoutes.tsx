import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { PageTransition } from '@/components/layout/PageTransition'
import { RouteFallback } from '@/components/ui/RouteFallback'
import HomePage from '@/pages/HomePage'

/* Route-level code splitting: only the landing page ships in the initial bundle. */
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function AppRoutes() {
  const location = useLocation()

  return (
    <PageTransition>
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </PageTransition>
  )
}

export default AppRoutes
