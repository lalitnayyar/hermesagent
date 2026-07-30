import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Agents from './pages/Agents'
import Workflows from './pages/Workflows'
import Tasks from './pages/Tasks'
import Approvals from './pages/Approvals'
import Automation from './pages/Automation'
import Monitor from './pages/Monitor'
import Mobile from './pages/Mobile'
import Settings from './pages/Settings'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/mobile" element={<Mobile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppShell>
  )
}

export default App
