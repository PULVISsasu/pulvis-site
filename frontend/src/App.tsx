import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PageWrapper from './components/PageWrapper'
import Home from './pages/Home'
import LeConcept from './pages/LeConcept'
import SallesDeSport from './pages/SallesDeSport'
import LaStation from './pages/LaStation'
import CommentCaFonctionne from './pages/CommentCaFonctionne'
import Faq from './pages/Faq'
import DevenirPartenaire from './pages/DevenirPartenaire'
import LegalNotice from './pages/LegalNotice'
import Confidentialite from './pages/Confidentialite'
import Cookies from './pages/Cookies'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/le-concept" element={<LeConcept />} />
            <Route path="/salles-de-sport" element={<SallesDeSport />} />
            <Route path="/la-station" element={<LaStation />} />
            <Route path="/comment-ca-fonctionne" element={<CommentCaFonctionne />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/devenir-partenaire" element={<DevenirPartenaire />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/politique-de-confidentialite" element={<Confidentialite />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  )
}
