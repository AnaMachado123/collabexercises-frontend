// src/pages/MySaved.jsx
import "./MySaved.css";
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

export default function MySaved() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openMobileNav, setOpenMobileNav] = useState(false);

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

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // load saved
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/exercises/saved", { auth: true });
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("MySaved endpoint not ready yet:", err?.message || err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ESC close menus
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (openMobileNav) setOpenMobileNav(false);
        if (openUserMenu) setOpenUserMenu(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openMobileNav, openUserMenu]);

  // se abre mobile nav, fecha user dropdown
  useEffect(() => {
    if (openMobileNav) setOpenUserMenu(false);
  }, [openMobileNav]);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  // normaliza row -> exercise
  const pickExercise = (row) => {
    const ex = row?.exercise || row?.item || row?.ex || row;
    return typeof ex === "string" ? { _id: ex } : ex;
  };

  const handleView = (exerciseId) => {
    if (!exerciseId) return;
    navigate(`/exercises/${exerciseId}`);
  };

  const handleRemove = async (row) => {
    const ex = pickExercise(row);
    const exId = ex?._id || ex?.id;

    const ok = window.confirm("Remove this exercise from saved?");
    if (!ok) return;

    // optimista
    setItems((prev) =>
      prev.filter((x) => {
        const e = pickExercise(x);
        const id = e?._id || e?.id;
        return id !== exId;
      })
    );

    try {
      await apiRequest(`/exercises/${exId}/save-toggle`, {
        method: "POST",
        auth: true,
      });
    } catch (err) {
      console.warn("Remove saved failed:", err?.message || err);
    }
  };

  const go = (path) => {
    setOpenMobileNav(false);
    navigate(path);
  };

  return (
    <div className="mysaved-page">
      <header className="dashboard-header">
        <div
          className="dashboard-logo"
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-logo-icon">
            <i className="fa-solid fa-graduation-cap" />
          </div>
          <span className="dashboard-logo-text">CollabExercises</span>
        </div>

        {/* DESKTOP/TABLET NAV */}
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
          {/* ✅ HAMBURGER (mobile) */}
          <button
            type="button"
            className={`nav-toggle ${openMobileNav ? "open" : ""}`}
            onClick={() => setOpenMobileNav((v) => !v)}
            aria-label="Open menu"
            aria-expanded={openMobileNav}
          >
            <span />
            <span />
            <span />
          </button>

          {/* USER */}
          <div
            className={`dashboard-user-circle ${openUserMenu ? "user-open" : ""}`}
            title={user?.name}
            onClick={() => {
              setOpenMobileNav(false);
              setOpenUserMenu((v) => !v);
            }}
            role="button"
            tabIndex={0}
          >
            {initials}
          </div>

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

      {/* ✅ MOBILE NAV OVERLAY + PANEL */}
      {openMobileNav && (
        <div className="mobile-nav-overlay" onClick={() => setOpenMobileNav(false)}>
          <div
            className="mobile-nav-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className={`mobile-nav-link ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
              onClick={() => go("/dashboard")}
            >
              Home
            </button>

            <button
              type="button"
              className={`mobile-nav-link ${
                location.pathname === "/my-exercises" ? "active" : ""
              }`}
              onClick={() => go("/my-exercises")}
            >
              My Exercises
            </button>

            <button
              type="button"
              className={`mobile-nav-link ${
                location.pathname === "/my-solutions" ? "active" : ""
              }`}
              onClick={() => go("/my-solutions")}
            >
              My Solutions
            </button>

            <button
              type="button"
              className={`mobile-nav-link ${
                location.pathname === "/my-saved" ? "active" : ""
              }`}
              onClick={() => go("/my-saved")}
            >
              My Saved
            </button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="mysaved-container">
        <div className="mysaved-header">
          <h1>My Saved</h1>
          <p>Exercises you’ve saved to revisit later</p>
        </div>

        {loading ? (
          <div className="mysaved-skeleton">
            <div className="sk-card" />
            <div className="sk-card" />
            <div className="sk-card" />
          </div>
        ) : !hasItems ? (
          <div className="mysaved-empty">
            <div className="empty-icon">
              <i className="fa-regular fa-bookmark" />
            </div>

            <h2>No saved exercises yet</h2>
            <p>Save exercises to quickly find them later.</p>

            <button
              className="empty-cta"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 10 }} />
              Explore exercises
            </button>
          </div>
        ) : (
          <div className="mysaved-list">
            {items.map((row) => {
              const ex = pickExercise(row);
              const key = row?._id || row?.id || ex?._id || ex?.id || Math.random();

              const exId = ex?._id || ex?.id;
              const diffClass = getDifficultyClass(ex?.difficulty);

              const subject = ex?.subject || "Subject";
              const difficulty = ex?.difficulty || "Difficulty";

              const commentsCount = ex?.commentsCount ?? ex?.comments?.length ?? 0;
              const solutionsCount = ex?.solutionsCount ?? ex?.solutions?.length ?? 0;

              const savedAt = row?.savedAt || row?.createdAt || row?.created_at || null;

              return (
                <div className="mysaved-card" key={key}>
                  <div className="mysaved-bookmark" title="Saved">
                    <i className="fa-solid fa-bookmark" />
                  </div>

                  <div className="mysaved-card-top">
                    <h3 className="mysaved-title">{ex?.title || "Untitled exercise"}</h3>
                  </div>

                  <div className="mysaved-pills">
                    <span className="pill subject">{subject}</span>
                    <span className={`pill difficulty difficulty-pill ${diffClass}`}>
                      {difficulty}
                    </span>
                  </div>

                  <div className="mysaved-divider" />

                  <div className="mysaved-card-bottom">
                    <div className="mysaved-metrics">
                      <span className="metric">
                        <i className="fa-regular fa-comment" /> {commentsCount}
                      </span>
                      <span className="metric">
                        <i className="fa-regular fa-lightbulb" /> {solutionsCount} solutions
                      </span>
                      <span className="dot">·</span>
                      <span className="time">
                        {savedAt ? `Saved ${timeAgo(savedAt)}` : ""}
                      </span>
                    </div>

                    <div className="mysaved-actions-right">
                      <button
                        className="icon-btn danger"
                        title="Remove from saved"
                        type="button"
                        onClick={() => handleRemove(row)}
                      >
                        <i className="fa-regular fa-trash-can" />
                      </button>

                      <button
                        className="view-btn"
                        type="button"
                        onClick={() => handleView(exId)}
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
