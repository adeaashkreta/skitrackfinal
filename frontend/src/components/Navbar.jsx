import { Link } from "react-router-dom";
import { FaSearch, FaHeart, FaUser, FaSkiing } from "react-icons/fa";

import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FaSkiing className="brand-icon" />

        <span className="brand-text">Ski Track</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/resorts">Resorts</Link>
        <Link to="/conditions">Conditions</Link>
        <Link to="/bookings">Bookings</Link>
        <Link to="/rentals">Rentals</Link>
      </div>

      <div className="navbar-right">
        <div className="search-box">
          <input type="text" placeholder="Search..." />

          <button type="button">
            <FaSearch />
          </button>
        </div>

        <Link to="/favorites" className="nav-icon">
          <FaHeart />
        </Link>

        <Link to="/login" className="nav-icon">
          <FaUser />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
