// src/pages/Profile.jsx
import "./Profile.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function initialsFromName(name) {
  return (
    name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "??"
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openUserMenu, setOpenUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const storedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("user") || "null");
  }, []);

  const [profile, setProfile] = useState({
    name: storedUser?.name || "John Doe",
    email: storedUser?.email || "john.doe@university.edu",
    memberSince: storedUser?.memberSince || "2025",
    stats: { exercises: 0, solutions: 0, saved: 0 },
  });

  const [form, setForm] = useState({
    name: storedUser?.name || "John Doe",
    email: storedUser?.email || "john.doe@university.edu",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // load profile (back)
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/users/me");
        if (!alive) return;

        const next = {
          name: data?.name || storedUser?.name || "John Doe",
          email: data?.email || storedUser?.email || "john.doe@university.edu",
          memberSince: data?.memberSince || "2025",
          stats: {
            exercises: data?.stats?.exercises ?? 0,
            solutions: data?.stats?.solutions ?? 0,
            saved: data?.stats?.saved ?? 0,
          },
        };

        setProfile(next);
        setForm({ name: next.name, email: next.email });
      } catch (err) {
        console.warn("Profile endpoint not ready yet:", err?.message || err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [storedUser?.name, storedUser?.email]);

  const initials = initialsFromName(profile.name);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCancel = () => {
    setForm({ name: profile.name, email: profile.email });
    setToast("");
    setError("");
    navigate("/dashboard");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setToast("");

      const data = await apiRequest("/users/me", {
        method: "PUT",
        body: { name: form.name, email: form.email },
      });

      const next = {
        name: data?.name ?? form.name,
        email: data?.email ?? form.email,
        memberSince: data?.memberSince ?? profile.memberSince,
        stats: {
          exercises: data?.stats?.exercises ?? profile.stats.exercises ?? 0,
          solutions: data?.stats?.solutions ?? profile.stats.solutions ?? 0,
          saved: data?.stats?.saved ?? profile.stats.saved ?? 0,
        },
      };

      setProfile(next);
      setForm({ name: next.name, email: next.email });

      // atualiza o user local também (para o dashboard/navbar)
      localStorage.setItem("user", JSON.stringify({ ...data }));

      setToast("Profile updated successfully.");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setError(err?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openDeleteModal = () => setShowDeleteModal(true);

  const closeDeleteModal = () => {
    if (saving) return;
    setShowDeleteModal(false);
  };

  const confirmDeleteAccount = async () => {
    try {
      setSaving(true);
      setError("");
      setToast("");

      await apiRequest("/users/me", { method: "DELETE" });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Could not delete account.");
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="profile-page">
      {/* HEADER */}
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
            title={profile.name}
            onClick={() => setOpenUserMenu((v) => !v)}
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

      {/* CONTENT */}
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings</p>
        </div>

        {loading ? (
          <div className="profile-skeleton">
            <div className="sk-card" />
          </div>
        ) : (
          <div className="profile-card">
            <div className="profile-top">
              <div className="profile-avatar">{initials}</div>

              <div className="profile-top-info">
                <div className="profile-name">{profile.name}</div>
                <div className="profile-email">{profile.email}</div>
                <div className="profile-since">
                  Member since · {profile.memberSince}
                </div>

                <div className="profile-stats">
                  <span className="stat">
                    <i className="fa-regular fa-file-lines" />{" "}
                    {profile.stats.exercises} Exercises
                  </span>
                  <span className="dot">·</span>
                  <span className="stat">
                    <i className="fa-regular fa-lightbulb" />{" "}
                    {profile.stats.solutions} Solutions
                  </span>
                  <span className="dot">·</span>
                  <span className="stat">
                    <i className="fa-regular fa-bookmark" />{" "}
                    {profile.stats.saved} Saved
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-form">
              {toast && <div className="profile-toast">{toast}</div>}
              {error && <div className="profile-error">{error}</div>}

              <label className="field-label">Full name</label>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                type="text"
              />

              <label className="field-label">Email</label>
              <input
                className="input input-disabled"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                disabled
              />

              <div className="profile-actions">
                <button type="button" className="btn-ghost" onClick={handleCancel}>
                  Cancel
                </button>

                <button
                  type="button"
                  className="view-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-account">
              <div className="account-title">Account actions</div>

              <button type="button" className="account-item" onClick={handleLogoutAll}>
                <i className="fa-solid fa-right-from-bracket" />
                Logout from all devices
              </button>

              <button
                type="button"
                className="account-item danger"
                onClick={openDeleteModal}
              >
                <i className="fa-regular fa-trash-can" />
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal} role="presentation">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>

            <div className="modal-title">Delete account?</div>
            <div className="modal-text">
              This action cannot be undone. Your account and data will be permanently removed.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn ghost"
                onClick={closeDeleteModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-btn danger"
                onClick={confirmDeleteAccount}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
