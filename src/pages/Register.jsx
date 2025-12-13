// src/pages/Register.jsx
import "../App.css";
import "./Login.css";
import "./Register.css";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  // 🔹 states (NÃO afetam layout)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  // 🔹 submit handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the terms and conditions");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      if (!data.token) {
        setError("Registration succeeded but no token was returned.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");

    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-page register-page slide-right">
      <div className="login-container">
        {/* Card à ESQUERDA */}
        <div className="login-right register-card">
          <div className="login-card">
            <h2>Create your account</h2>
            <p className="subtitle">Join the collaborative learning community</p>

            {/* 🔹 erro (não mexe layout) */}
            {error && <p className="error-text">{error}</p>}

            <form onSubmit={handleRegister}>
              {/* Full name */}
              <div className="field-group">
                <label>Full name</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-user"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="field-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    placeholder="student@university.pt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="terms-row">
                <label>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                  />
                  <span>I accept the terms and the conditions</span>
                </label>
              </div>

              {/* Botão Sign up */}
              <button type="submit" className="primary-button">
                Sign up
              </button>

              {/* Link para login */}
              <p className="create-account">
                Already have an account?{" "}
                <Link to="/login" className="link-button">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* BLOCO LARANJA à DIREITA */}
        <div className="login-left register-orange">
          <div className="logo">
            <div className="logo-icon">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <span className="logo-text">CollabExercises</span>
          </div>

          <div className="welcome-text register-text">
            <h1>Create account!</h1>
            <p>Join the community and start collabing!</p>

            <ul className="register-benefits">
              <li>
                <i className="fa-solid fa-check"></i>
                <span>Access thousands of exercises</span>
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                <span>Collaborate with other students</span>
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                <span>Share your solutions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
