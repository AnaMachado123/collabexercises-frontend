// src/pages/Dashboard.jsx
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        {/* LEFT - Logo */}
        <div className="dashboard-logo">
            <div className="dashboard-logo-icon">
            <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <span className="dashboard-logo-text">CollabExercises</span>
        </div>

        {/* CENTER - Menu */}
        <div className="header-center">
            <nav className="dashboard-nav">
            <button className="nav-link nav-link--active">Home</button>
            <button className="nav-link">My Exercises</button>
            <button className="nav-link">My Solutions</button>
            </nav>
        </div>

        {/* RIGHT - User */}
        <div className="header-right">
            <div className="dashboard-user-circle">AN</div>
        </div>
        </header>


      {/* MAIN */}
      <main className="dashboard-main">
        {/* LADO ESQUERDO */}
        <section className="dashboard-left">
          {/* Search */}
          <div className="dashboard-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search Exercises..."
            />
          </div>

          {/* Filtros */}
          <div className="dashboard-filters">
            <button className="filter-pill filter-pill--active">All</button>
            <button className="filter-pill">Math</button>
            <button className="filter-pill">Programming</button>
            <button className="filter-pill">Databases</button>
            <button className="filter-pill">Network</button>
          </div>

          {/* Exercício 1 */}
          <article className="exercise-card">
            <div className="exercise-card-body">
              <h3 className="exercise-title">
                QuickSort Sorting Algorithm in Python
              </h3>

              <div className="exercise-tags-row">
                <span className="exercise-tag">Programming</span>
                <span className="exercise-tag exercise-tag--outlined">
                  Advanced
                </span>
              </div>

              <p className="exercise-description">
                Implement the recursive QuickSort algorithm and analyze its time
                complexity...
              </p>
            </div>

            <div className="exercise-card-footer">
              <div className="exercise-metrics">
                <span>
                  <i className="fa-solid fa-arrow-up"></i> 42
                </span>
                <span>
                  <i className="fa-regular fa-comment"></i> 18
                </span>
                <span>
                  <i className="fa-regular fa-lightbulb"></i> 12 Solutions
                </span>
              </div>

              <button className="exercise-button">View exercise</button>
            </div>
          </article>

          {/* Exercício 2 */}
          <article className="exercise-card">
            <div className="exercise-card-body">
              <h3 className="exercise-title">
                Partial Derivatives Calculation
              </h3>

              <div className="exercise-tags-row">
                <span className="exercise-tag">Math</span>
                <span className="exercise-tag exercise-tag--outlined">
                  Intermediate
                </span>
              </div>

              <p className="exercise-description">
                Compute the partial derivatives of the function f(x,y) = ...
              </p>
            </div>

            <div className="exercise-card-footer">
              <div className="exercise-metrics">
                <span>
                  <i className="fa-solid fa-arrow-up"></i> 15
                </span>
                <span>
                  <i className="fa-regular fa-comment"></i> 22
                </span>
                <span>
                  <i className="fa-regular fa-lightbulb"></i> 17 Solutions
                </span>
              </div>

              <button className="exercise-button">View exercise</button>
            </div>
          </article>
        </section>

        {/* LADO DIREITO */}
        <aside className="dashboard-right">
          {/* Share your knowledge */}
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

          {/* Recent activity */}
          <section className="activity-card">
            <div className="activity-header">
              <span className="activity-icon">
                <i className="fa-regular fa-clock"></i>
              </span>
              <h3>Recent activity</h3>
            </div>

           <div className="activity-item">
                <div className="activity-line">
                    <span className="activity-name">Maria Santos</span>
                    <span className="activity-action">posted a solution</span>
                    <span className="activity-link">QuickSort</span>
                </div>
                <div className="activity-time">2h ago</div>
                </div>

                <div className="activity-item">
                <div className="activity-line">
                    <span className="activity-name">João Costa</span>
                    <span className="activity-action">commented on</span>
                    <span className="activity-link">Partial Derivatives</span>
                </div>
                <div className="activity-time">3h ago</div>
                </div>

                <div className="activity-item">
                    <div className="activity-line">
                        <span className="activity-name">Ana Silva</span>
                        <span className="activity-action">posted a new exercise</span>
                        <span className="activity-link">SQL Joins</span>
                    </div>
                <div className="activity-time">5h ago</div>
                </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default Dashboard;
