import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PageWrapper from './components/PageWrapper'
import Home from './pages/Home'
import Perfumes from './pages/Perfumes'
import PerfumeDetail from './pages/PerfumeDetail'
import HowItWorks from './pages/HowItWorks'
import FindPulvis from './pages/FindPulvis'
import StationPage from './pages/StationPage'
import Journal from './pages/Journal'
import ArticleDetail from './pages/ArticleDetail'
import Faq from './pages/Faq'
import Help from './pages/Help'
import Professionals from './pages/Professionals'
import LegalNotice from './pages/LegalNotice'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/parfums" element={<Perfumes />} />
            <Route path="/parfums/:slug" element={<PerfumeDetail />} />
            <Route path="/comment-ca-marche" element={<HowItWorks />} />
            <Route path="/trouver-pulvis" element={<FindPulvis />} />
            <Route path="/station/:stationId" element={<StationPage />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<ArticleDetail />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/aide" element={<Help />} />
            <Route path="/professionnels" element={<Professionals />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  )
}
