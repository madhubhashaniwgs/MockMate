import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewResult from "./pages/InterviewResult";
import InterviewHistory from "./pages/InterviewHistory";
import MockInterview from "./pages/MockInterview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview-setup" element={<InterviewSetup />} />
        <Route path="/interview-result" element={<InterviewResult />} />
        <Route path="/history" element={<InterviewHistory />} />
        <Route path="/mock-interview" element={<MockInterview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;