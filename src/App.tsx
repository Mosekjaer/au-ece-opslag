import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { Shell } from './components/Shell'
import { Home } from './components/Home'
import { CoursePage } from './components/CoursePage'
import { TopicPage } from './components/TopicPage'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:course" element={<CoursePage />} />
            <Route path="/:course/:slug" element={<TopicPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </MotionConfig>
  )
}
