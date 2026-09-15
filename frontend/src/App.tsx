import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GovernmentHeader } from './components/layout/GovernmentHeader';
import { Navbar } from './components/layout/Navbar';
import { AppFooter } from './components/layout/AppFooter';
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
      <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#172B4D] antialiased selection:bg-[#1877C9] selection:text-white">
        {/* National Government Masthead */}
        <GovernmentHeader />
        
        {/* Primary Navigation */}
        <Navbar />
        
        {/* Main Workspace */}
        <main className="flex-1 w-full">
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
                <h1 className="text-4xl font-extrabold text-[#0B2945]">404</h1>
                <p className="text-slate-600 mt-2 text-sm">The requested dashboard or project view was not found.</p>
                <a
                  href="/"
                  className="mt-4 px-4 py-2 bg-[#1877C9] text-white rounded-lg text-xs font-semibold hover:bg-[#123B63] transition-colors shadow-xs"
                >
                  Return to National Overview
                </a>
              </div>
            } />
          </Routes>
        </main>

        {/* Institutional Government Footer */}
        <AppFooter />
      </div>
    </Router>
  );
}

export default App;
