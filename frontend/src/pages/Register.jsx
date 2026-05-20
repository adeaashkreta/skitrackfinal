import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "../styles/Register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Navbar />

      <section className="register-page">
        <form className="register-card">
          <h1>Create account</h1>
          <p>Start your winter journey</p>

          <label>Full name</label>
          <input type="text" placeholder="Enter your full name" />

          <label>Email address</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="auth-btn" type="submit">
            Create Account
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </section>
    </>
  );
}

export default Register;
