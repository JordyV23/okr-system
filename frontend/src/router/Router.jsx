import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Dashboard,
  Objectives,
  CheckIns,
  NotFound,
  Reports,
  Settings,
  Team,
  Evaluations,
} from "../pages";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/objectives" element={<Objectives />} />
        <Route path="/checkins" element={<CheckIns />} />
        <Route path="/team" element={<Team />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
