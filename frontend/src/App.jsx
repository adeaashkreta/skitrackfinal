import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Resorts from "./pages/Resorts";
import ResortDetails from "./pages/ResortDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Bookings from "./pages/Bookings";
import Rentals from "./pages/Rentals";
import Conditions from "./pages/Conditions";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resorts" element={<Resorts />} />
        <Route path="/resorts/:id" element={<ResortDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/conditions" element={<Conditions />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
