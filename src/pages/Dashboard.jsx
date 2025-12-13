// src/pages/Dashboard.jsx
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const initials =
    user?.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "??";

  // ✅ states para exercícios
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest("/exercises"); // GET /api/exercises
        setExercises(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [navigate]);

  const subjects = ["All", ...new Set(
    exercises.map(e => e.subject).filter(Boolean)
  )];

  const filteredExercises = exercises.filter(
    ex => selectedSubject === "All" || ex.subject === selectedSubject
  );



  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <span className="dashboard-logo-text">CollabExercises</span>
        </div>

        <div className="header-center">
          <nav className="dashboard-nav">
            <button className="nav-link nav-link--active">Home</button>
            <button className="nav-link">My Exercises</button>
            <button className="nav-link">My Solutions</button>
          </nav>
        </div>

        <div className="header-right">
          <div className="dashboard-user-circle" title={user?.name}>
            {initials}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="dashboard-main">
        {/* LADO ESQUERDO */}
        <section className="dashboard-left">
          {/* Search */}
          <div className="dashboard-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search Exercises..." />
          </div>

          {/* Filtros */}
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


          {/* ✅ ESTADOS */}
          {loading && <p>Loading exercises...</p>}
          {error && <p className="error-text">{error}</p>}

          {/* ✅ LISTA REAL */}
          {!loading && !error && filteredExercises.map((ex) => (
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
                    <i className="fa-solid fa-arrow-up"></i> {ex.upvotes ?? 0}
                  </span>
                  <span>
                    <i className="fa-regular fa-comment"></i> {ex.commentsCount ?? 0}
                  </span>
                  <span>
                    <i className="fa-regular fa-lightbulb"></i> {ex.solutionsCount ?? 0} Solutions
                  </span>
                </div>

                <button className="exercise-button">View exercise</button>
              </div>
            </article>
          ))}

          {/* caso não haja exercícios */}
          {!loading && !error && filteredExercises.length === 0 && (
              <p>No exercises yet. Create the first one</p>
          )}
        </section>

        {/* LADO DIREITO */}
        <aside className="dashboard-right">
          <section className="share-card">
            <h2>Share your knowledge</h2>
            <p>
              Post a new exercise and help the community
              <br />
              learn together
            </p>

            <button className="share-button">
              <span>+ Post new&nbsp;exercise</span>
            </button>
          </section>

          <section className="activity-card">
            <div className="activity-header">
              <span className="activity-icon">
                <i className="fa-regular fa-clock"></i>
              </span>
              <h3>Recent activity</h3>
            </div>

            {/* isto fica fake por agora */}
            <div className="activity-item">
              <div className="activity-line">
                <span className="activity-name">Maria Santos</span>
                <span className="activity-action">posted a solution</span>
                <span className="activity-link">QuickSort</span>
              </div>
              <div className="activity-time">2h ago</div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default Dashboard;
