import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import SectionView from './pages/SectionView';
import FollowUp from './pages/FollowUp';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/section/:id" element={<SectionView />} />
        <Route path="/follow-up" element={<FollowUp />} />
      </Routes>
    </Router>
  );
}