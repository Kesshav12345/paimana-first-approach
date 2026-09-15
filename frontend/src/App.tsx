import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { SectorAnalytics } from './pages/SectorAnalytics';
import { MinistryAnalytics } from './pages/MinistryAnalytics';
import { StateAnalytics } from './pages/StateAnalytics';
import { EarlyWarning } from './pages/EarlyWarning';
import { Projects } from './pages/Projects';
import { ProjectIntelligence } from './pages/ProjectIntelligence';
import { Operations } from './pages/Operations';
import { Methodology } from './pages/Methodology';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/sectors" element={<SectorAnalytics />} />
            <Route path="/ministries" element={<MinistryAnalytics />} />
            <Route path="/states" element={<StateAnalytics />} />
            <Route path="/early-warning" element={<EarlyWarning />} />
            <Route path="/projects/:id" element={<ProjectIntelligence />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/methodology" element={<Methodology />} />
            
            {/* 404 Fallback */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <h1 className="text-4xl font-extrabold text-slate-800">404</h1>
                <p className="text-slate-600 mt-2">The requested dashboard or project view was not found.</p>
                <a
                  href="/"
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Return to Home
                </a>
              </div>
            } />
          </Routes>
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>
              PAIMANA-INTEL &copy; 2026 — Government Infrastructure Early Warning & Decision Support System
            </p>
            <div className="flex items-center gap-4">
              <span>Canonical Dataset: <strong>v2026.07</strong></span>
              <span>•</span>
              <span>Model Family: <strong>CatBoost MLOps</strong></span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">Deterministic + ML Stack</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
