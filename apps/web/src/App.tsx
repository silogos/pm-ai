import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkspaceList from './components/WorkspaceList';
import WorkspaceDetail from './components/WorkspaceDetail';
import FeatureDetail from './components/FeatureDetail';
import PlanDashboard from './components/PlanDashboard';
import { WorkspaceOverview } from './components/WorkspaceOverview';
import './styles/App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <header className="app-header">
            <h1>PM-AI Dashboard</h1>
            <nav className="app-nav">
              <Link to="/">Workspaces</Link>
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<WorkspaceList />} />
              <Route path="/workspace" element={<WorkspaceOverview />} />
              <Route path="/workspace/:workspaceId" element={<WorkspaceDetail />} />
              <Route path="/feature/:featureId" element={<FeatureDetail />} />
              <Route path="/plan/:id" element={<PlanDashboard />} />
              <Route path="*" element={<WorkspaceList />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
