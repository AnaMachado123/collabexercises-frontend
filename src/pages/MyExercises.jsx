// src/pages/MyExercises.jsx
import "./MyExercises.css";
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

export default function MyExercises() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openUserMenu, setOpenUserMenu] = useState(false);

  // ✅ mobile nav
  const [openMobileNav, setOpenMobileNav] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // load data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/exercises/mine");
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("MyExercises endpoint not ready yet:", err?.message || err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // lock scroll when delete modal open
  useEffect(() => {
    if (!deleteModalOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [deleteModalOpen]);

  // ESC close modal / mobile nav
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (deleteModalOpen) closeDeleteModal();
        if (openMobileNav) setOpenMobileNav(false);
        if (openUserMenu) setOpenUserMenu(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteModalOpen, openMobileNav, openUserMenu]);

  // when mobile nav opens, close user dropdown (so não ficam 2 menus a lutar)
  useEffect(() => {
    if (openMobileNav) setOpenUserMenu(false);
  }, [openMobileNav]);

  const hasItems = useMemo(() => items.length > 0, [items.length]);

  const handleNew = () => navigate("/exercises/new");
  const handleView = (id) => navigate(`/exercises/${id}`);
  const handleEdit = (id) => navigate(`/exercises/${id}/edit`);

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setDeleting(true);

      await apiRequest(`/exercises/${deleteTargetId}`, {
        method: "DELETE",
        auth: true,
      });

      setItems((prev) => prev.filter((x) => (x._id || x.id) !== deleteTargetId));
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to delete exercise.");
    } finally {
      setDeleting(false);
    }
  };

  const go = (path) => {
    setOpenMobileNav(false);
    navigate(path);
  };

  return (
    <div className="myex-page">
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

          {/* USER CIRCLE */}
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

      {/* ✅ MOBILE MENU OVERLAY + PANEL */}
      {openMobileNav && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setOpenMobileNav(false)}
        >
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

      {/* CONTEÚDO */}
      <div className="myex-container">
        <div className="myex-header">
          <h1>My Exercises</h1>
          <p>Exercises you’ve published to get help from the community</p>
        </div>

        {loading ? (
          <div className="myex-skeleton">
            <div className="sk-card" />
            <div className="sk-card" />
            <div className="sk-card" />
          </div>
        ) : !hasItems ? (
          <div className="myex-empty">
            <div className="empty-icon">
              <i className="fa-regular fa-folder-open"></i>
            </div>

            <h2>You haven’t published any exercises yet</h2>
            <p>
              When you need help, publish an exercise and get feedback from the
              community.
            </p>

            <button className="empty-cta" type="button" onClick={handleNew}>
              <span> + Post new exercise</span>
            </button>
          </div>
        ) : (
          <div className="myex-list">
            {items.map((ex) => {
              const exId = ex._id || ex.id;
              const diffClass = getDifficultyClass(ex.difficulty);

              return (
                <div className="myex-card" key={exId}>
                  <div className="myex-card-top">
                    <h3 className="myex-title">{ex.title}</h3>

                    <div className="myex-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => handleEdit(exId)}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>

                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => openDeleteModal(exId)}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </div>

                  <div className="myex-pills">
                    <span className="pill subject">{ex.subject || "Subject"}</span>
                    <span className={`pill difficulty difficulty-pill ${diffClass}`}>
                      {ex.difficulty || "Difficulty"}
                    </span>
                  </div>

                  <div className="myex-divider" />

                  <div className="myex-card-bottom">
                    <div className="myex-metrics">
                      <span className="metric">
                        <i className="fa-regular fa-bookmark"></i> {ex.savesCount ?? 0}
                      </span>
                      <span className="metric">
                        <i className="fa-regular fa-comment"></i>{" "}
                        {ex.commentsCount ?? 0}
                      </span>
                      <span className="metric">
                        <i className="fa-regular fa-lightbulb"></i>{" "}
                        {ex.solutionsCount ?? 0}
                      </span>

                      <span className="dot">·</span>

                      <span className="time">{timeAgo(ex.createdAt)}</span>
                    </div>

                    <button
                      type="button"
                      className="view-btn"
                      onClick={() => handleView(exId)}
                    >
                      View exercise
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div
          className="ce-modal-overlay"
          onClick={() => {
            if (!deleting) closeDeleteModal();
          }}
        >
          <div
            className="ce-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className="ce-modal-top">
              <div className="ce-modal-icon">
                <i className="fa-regular fa-trash-can"></i>
              </div>

              <div className="ce-modal-text">
                <h3 id="delete-title">Delete exercise?</h3>
                <p>This action cannot be undone.</p>
              </div>
            </div>

            <div className="ce-modal-actions">
              <button
                type="button"
                className="ce-btn ghost"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="ce-btn danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
