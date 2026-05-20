import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "../styles/Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Navbar />

      <section className="login-page">
        <form className="login-card">
          <h1>Sign in</h1>
          <p>Continue to SkiTrack</p>

          <label>Email address</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="auth-btn" type="submit">
            Login
          </button>

          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link to="/register">Register here</Link>
          </p>
        </form>
      </section>
    </>
  );
}

export default Login;
