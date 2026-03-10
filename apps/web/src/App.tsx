import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectList from './components/ProjectList';
import ProjectDashboard from './components/ProjectDashboard';
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
              <Link to="/">Projects</Link>
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<ProjectList />} />
              <Route path="/project/:id" element={<ProjectDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
