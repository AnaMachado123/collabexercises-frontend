// src/pages/Login.jsx
import "../App.css";
import "./Login.css";

function Login() {
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Lado esquerdo - laranja */}
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
            <h1>Welcome Back !</h1>
            <p>
              Share exercises, explore solutions and learn in a collaborative
              way.
            </p>
          </div>
        </div>

        {/* Lado direito - formulário */}
        <div className="login-right">
          <div className="login-card">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to CollabExercises</p>

            <form>
              {/* Email */}
              <div className="field-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">@</span>
                  <input
                    type="email"
                    placeholder="student@university.pt"
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
                  <input type="password" placeholder="••••••••••" />
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="extras-row">
                <label className="remember">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button type="button" className="link-button">
                  Forgot password ?
                </button>
              </div>

              {/* Botão login */}
              <button type="submit" className="primary-button">
                Log in
              </button>

              {/* Create account */}
              <p className="create-account">
                Don’t have an account ?{" "}
                <button type="button" className="link-button">
                  Create one
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
