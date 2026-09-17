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
      <div className="min-h-screen flex flex-col bg-[#F6F7F8] text-[#25313B] antialiased selection:bg-[#EBF6FA] selection:text-[#123F63]">
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
                <h1 className="text-4xl font-extrabold text-[#123F63]">404</h1>
                <p className="text-[#66737D] mt-2 text-sm">The requested official dashboard or project record was not found.</p>
                <a
                  href="/"
                  className="mt-4 px-4 py-2 bg-[#187A9E] text-white rounded-xs text-xs font-semibold hover:bg-[#156586] transition-colors shadow-none"
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
