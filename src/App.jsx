import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Layout from '@/components/Layout'
import Dashboard from '@/components/pages/Dashboard'
import ConsultaSaldos from '@/components/pages/ConsultaSaldos'
import NotasFiscais from '@/components/pages/NotasFiscais'
import UploadXML from '@/components/pages/UploadXML'
import SincronizarMaino from '@/components/pages/SincronizarMaino'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/saldos" element={<ConsultaSaldos />} />
            <Route path="/notas-fiscais" element={<NotasFiscais />} />
            <Route path="/upload-xml" element={<UploadXML />} />
            <Route path="/sincronizar" element={<SincronizarMaino />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </Router>
  )
}

export default App
