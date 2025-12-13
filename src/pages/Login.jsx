import "../App.css";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");

    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-page slide-left">
      <div className="login-container">
        {/* LEFT */}
        <div className="login-left">
          <div className="logo">
            <div className="logo-icon">
              <span className="logo-cap">
                <i className="fa-solid fa-graduation-cap"></i>
              </span>
            </div>
            <span className="logo-text">CollabExercises</span>
          </div>

          <div className="welcome-text">
            <h1>Welcome Back!</h1>
            <p>Share exercises, explore solutions and learn collaboratively.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-card">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to CollabExercises</p>

            {error && <p className="error-text">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">@</span>
                  <input name="email" type="email" required />
                </div>
              </div>

              <div className="field-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input name="password" type="password" required />
                </div>
              </div>

              <button type="submit" className="primary-button">
                Log in
              </button>

              <p className="create-account">
                Don’t have an account?{" "}
                <Link to="/register" className="link-button">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
