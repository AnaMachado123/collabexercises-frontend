// src/pages/Dashboard.jsx
import "./Dashboard.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";
import RecentActivity from "../components/RecentActivity";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // dropdown user
  const [openUserMenu, setOpenUserMenu] = useState(false);

  // ✅ mobile menu (hambúrguer)
  const [openMobileNav, setOpenMobileNav] = useState(false);

  const headerRightRef = useRef(null);
  const mobileNavRef = useRef(null);

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

  // states
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [search, setSearch] = useState("");

  // auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (selectedSubject !== "All") params.append("subject", selectedSubject);

        const data = await apiRequest(`/exercises?${params.toString()}`);
        setExercises(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load exercises");
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [search, selectedSubject]);

  const subjects = ["All", ...new Set(exercises.map((e) => e.subject).filter(Boolean))];

  // ✅ helper: navegar e fechar menus
  const go = (path) => {
    setOpenMobileNav(false);
    setOpenUserMenu(false);
    navigate(path);
  };

  // ✅ fechar menus ao clicar fora
  useEffect(() => {
    const onDocMouseDown = (e) => {
      // user dropdown
      if (headerRightRef.current && !headerRightRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
      // mobile nav dropdown
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
        setOpenMobileNav(false);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // ✅ se passar para desktop, fecha menu mobile
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setOpenMobileNav(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="dashboard-page">
      {/* ================= HEADER ================= */}
      <header className="dashboard-header">
        <div
          className="dashboard-logo"
          onClick={() => go("/dashboard")}
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-logo-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <span className="dashboard-logo-text">CollabExercises</span>
        </div>

        {/* NAV DESKTOP */}
        <div className="header-center">
          <nav className="dashboard-nav">
            <button
              className={`nav-link ${location.pathname === "/dashboard" ? "nav-link--active" : ""}`}
              onClick={() => go("/dashboard")}
              type="button"
            >
              Home
            </button>

            <button
              className={`nav-link ${location.pathname === "/my-exercises" ? "nav-link--active" : ""}`}
              onClick={() => go("/my-exercises")}
              type="button"
            >
              My Exercises
            </button>

            <button
              className={`nav-link ${location.pathname === "/my-solutions" ? "nav-link--active" : ""}`}
              onClick={() => go("/my-solutions")}
              type="button"
            >
              My Solutions
            </button>

            <button
              className={`nav-link ${location.pathname === "/my-saved" ? "nav-link--active" : ""}`}
              onClick={() => go("/my-saved")}
              type="button"
            >
              My Saved
            </button>
          </nav>
        </div>

        {/* RIGHT: mobile btn + user */}
        <div className="header-right" style={{ position: "relative" }} ref={headerRightRef}>
          {/* ✅ HAMBÚRGUER (aparece só no mobile via CSS) */}
          <div className="mobile-nav-wrap" ref={mobileNavRef}>
            <button
              className={`mobile-menu-btn ${openMobileNav ? "open" : ""}`}
              type="button"
              aria-label="Open menu"
              aria-expanded={openMobileNav}
              onClick={() => {
                setOpenMobileNav((v) => !v);
                setOpenUserMenu(false);
              }}
            >
              <span />
              <span />
              <span />
            </button>

            {/* ✅ DROPDOWN MOBILE */}
            <div className={`mobile-nav ${openMobileNav ? "open" : ""}`}>
              <button
                type="button"
                className={`mobile-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
                onClick={() => go("/dashboard")}
              >
                Home
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${location.pathname === "/my-exercises" ? "active" : ""}`}
                onClick={() => go("/my-exercises")}
              >
                My Exercises
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${location.pathname === "/my-solutions" ? "active" : ""}`}
                onClick={() => go("/my-solutions")}
              >
                My Solutions
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${location.pathname === "/my-saved" ? "active" : ""}`}
                onClick={() => go("/my-saved")}
              >
                My Saved
              </button>
            </div>
          </div>

          {/* USER CIRCLE */}
          <div
            className={`dashboard-user-circle ${openUserMenu ? "user-open" : ""}`}
            onClick={() => {
              setOpenUserMenu((v) => !v);
              setOpenMobileNav(false);
            }}
            role="button"
            tabIndex={0}
            title={user?.name}
          >
            {initials}
          </div>

          <div className={`user-dropdown ${openUserMenu ? "open" : ""}`}>
            <button type="button" onClick={() => go("/profile")}>
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

      {/* ================= MAIN ================= */}
      <main className="dashboard-main">
        {/* LEFT */}
        <section className="dashboard-left">
          {/* Search */}
          <div className="dashboard-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search Exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="dashboard-filters">
            {subjects.map((subj) => (
              <button
                key={subj}
                className={`filter-pill ${selectedSubject === subj ? "filter-pill--active" : ""}`}
                onClick={() => setSelectedSubject(subj)}
                type="button"
              >
                {subj}
              </button>
            ))}
          </div>

          {/* States */}
          {loading && <p>Loading exercises...</p>}
          {error && <p className="error-text">{error}</p>}

          {/* Exercise list */}
          {!loading &&
            !error &&
            exercises.map((ex) => (
              <article className="exercise-card" key={ex._id}>
                <div className="exercise-card-body">
                  <h3 className="exercise-title">{ex.title}</h3>

                  <div className="exercise-tags-row">
                    <span className="exercise-tag">{ex.subject}</span>

                    {ex.difficulty && (
                      <span className={`exercise-tag difficulty-pill difficulty-${ex.difficulty.toLowerCase()}`}>
                        {ex.difficulty}
                      </span>
                    )}
                  </div>

                  <p className="exercise-description clamp-3">{ex.description}</p>
                </div>

                <div className="exercise-card-footer">
                  <div className="exercise-metrics">
                    <span>
                      <i className="fa-regular fa-bookmark"></i> {ex.savesCount ?? 0}
                    </span>
                    <span>
                      <i className="fa-regular fa-comment"></i> {ex.commentsCount ?? 0}
                    </span>
                    <span>
                      <i className="fa-regular fa-lightbulb"></i> {ex.solutionsCount ?? 0} Solutions
                    </span>
                  </div>

                  <button className="exercise-button" onClick={() => navigate(`/exercises/${ex._id}`)}>
                    View exercise
                  </button>
                </div>
              </article>
            ))}

          {!loading && !error && exercises.length === 0 && <p>No exercises found</p>}
        </section>

        {/* RIGHT */}
        <aside className="dashboard-right">
          <section className="share-card">
            <h2>Share your knowledge</h2>
            <p>
              Post a new exercise and help the community
              <br />
              learn together
            </p>

            <button className="share-button" onClick={() => navigate("/exercises/new")}>
              + Post new exercise
            </button>
          </section>

          <section className="activity-card">
            <div className="activity-header">
              <span className="activity-icon">
                <i className="fa-regular fa-clock"></i>
              </span>
              <h3>Recent activity</h3>
            </div>

            <div className="activity-list">
              <RecentActivity limit={30} />
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default Dashboard;
