// src/pages/MySolutions.jsx
import "./MySolutions.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";

function getDifficultyClass(difficulty) {
  const raw = (difficulty || "").toString().toLowerCase();
  if (raw.includes("begin")) return "difficulty-beginner";
  if (raw.includes("inter")) return "difficulty-intermediate";
  if (raw.includes("adv")) return "difficulty-advanced";
  return "";
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days} days ago`;
  return `${weeks} weeks ago`;
}

export default function MySolutions() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openUserMenu, setOpenUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };


  const user = JSON.parse(localStorage.getItem("user") || "null");
  const initials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "??";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ guard de auth igual ao dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // ✅ BACK MODE (liga ao endpoint)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await apiRequest("/solutions/mine", { auth: true });


        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("MySolutions endpoint not ready yet:", err?.message || err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  const handleViewSolution = (exerciseId) => {
    if (!exerciseId) return;
    navigate(`/exercises/${exerciseId}`);
  };



  return (
    <div className="mysol-page">
      {/* ✅ HEADER / NAVBAR igual ao Dashboard */}
      <header className="dashboard-header">
        <div
          className="dashboard-logo"
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-logo-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <span className="dashboard-logo-text">CollabExercises</span>
        </div>

        <div className="header-center">
          <nav className="dashboard-nav">
            <button
              className={`nav-link ${
                location.pathname === "/dashboard" ? "nav-link--active" : ""
              }`}
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              Home
            </button>

            <button
              className={`nav-link ${
                location.pathname === "/my-exercises" ? "nav-link--active" : ""
              }`}
              onClick={() => navigate("/my-exercises")}
              type="button"
            >
              My Exercises
            </button>

            <button
              className={`nav-link ${
                location.pathname === "/my-solutions" ? "nav-link--active" : ""
              }`}
              onClick={() => navigate("/my-solutions")}
              type="button"
            >
              My Solutions
            </button>

            <button
              className={`nav-link ${
                location.pathname === "/my-saved" ? "nav-link--active" : ""
              }`}
              onClick={() => navigate("/my-saved")}
              type="button"
            >
              My Saved
            </button>
          </nav>
        </div>

        <div className="header-right" style={{ position: "relative" }}>
          <div
            className={`dashboard-user-circle ${openUserMenu ? "user-open" : ""}`}
            title={user?.name}
            onClick={() => setOpenUserMenu((v) => !v)}
            role="button"
            tabIndex={0}
          >
            {initials}
          </div>

          {/* ✅ fica sempre no DOM para animar */}
          <div className={`user-dropdown ${openUserMenu ? "open" : ""}`}>
            <button type="button" onClick={() => navigate("/profile")}>
              <i className="fa-regular fa-user" />
              Profile
            </button>

            <button type="button" className="danger" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket" />
              Logout
            </button>
          </div>
        </div>

      </header>

      {/* ✅ CONTEÚDO */}
      <div className="mysol-container">
        <div className="mysol-header">
          <h1>My Solutions</h1>
          <p>Solutions you’ve submitted to help other students</p>
        </div>

        {loading ? (
          <div className="mysol-skeleton">
            <div className="sk-card" />
            <div className="sk-card" />
            <div className="sk-card" />
          </div>
        ) : !hasItems ? (
          <div className="mysol-empty">
            <div className="empty-icon">
              <i className="fa-regular fa-lightbulb"></i>
            </div>

            <h2>You haven’t submitted any solutions yet</h2>
            <p>When you help other students by submitting a solution, it will appear here.</p>

            <button className="empty-cta" type="button" onClick={() => navigate("/dashboard")}>
              <span>Explore exercises</span>
            </button>
          </div>
        ) : (
          <div className="mysol-list">
            {items.map((sol) => {
              const solId = sol._id || sol.id;

              // ✅ tenta encontrar o id do exercício, mesmo que o backend varie o nome
              const exId =
                sol.exerciseId ||
                sol.exercise_id ||
                sol.exercise?._id ||
                sol.exercise?.id ||
                sol.exercise;

              const diffClass = getDifficultyClass(sol.difficulty || sol.exercise?.difficulty);
              const subject = sol.subject || sol.exercise?.subject || "Subject";
              const difficulty = sol.difficulty || sol.exercise?.difficulty || "Difficulty";

              const commentsCount = sol.commentsCount ?? sol.comments?.length ?? 0;
              const filesCount = sol.filesCount ?? sol.files?.length ?? 0;

              return (
                <div className="mysol-card" key={solId}>
                  <div className="mysol-card-top">
                    <h3 className="mysol-title">
                      {sol.title || sol.exerciseTitle || sol.exercise?.title || "Untitled solution"}
                    </h3>
                  </div>

                  <div className="mysol-pills">
                    <span className="pill subject">{subject}</span>
                    <span className={`pill difficulty difficulty-pill ${diffClass}`}>
                      {difficulty}
                    </span>
                  </div>

                  <div className="mysol-divider" />

                  <div className="mysol-card-bottom">
                    <div className="mysol-metrics">
                      <span className="metric">
                        <i className="fa-regular fa-comment"></i> {commentsCount} comments
                      </span>

                      <span className="metric">
                        <i className="fa-solid fa-paperclip"></i> {filesCount}{" "}
                        {filesCount === 1 ? "file" : "files"}
                      </span>

                      <span className="dot">·</span>

                      <span className="time">{timeAgo(sol.createdAt)}</span>
                    </div>

                    <div className="mysol-actions-right">
                      <button
                        type="button"
                        className="view-btn"
                        onClick={() => handleViewSolution(exId)}
                      >
                        View exercise
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
