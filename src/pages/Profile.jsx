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

  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // profile data
  const [profile, setProfile] = useState({
    name: storedUser?.name || "John Doe",
    email: storedUser?.email || "john.doe@university.edu",
    memberSince: storedUser?.memberSince || "2025",
    passwordMasked: "••••••••",
    stats: {
      exercises: 12,
      solutions: 8,
      saved: 5,
    },
  });

  // form state
  const [form, setForm] = useState({
    name: storedUser?.name || "John Doe",
    email: storedUser?.email || "john.doe@university.edu",
  });

  // load profile (back)
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ Ajusta se o teu backend tiver outro endpoint
        // Ex: "/users/me" ou "/profile/me"
        const data = await apiRequest("/users/me");

        if (!alive) return;

        const next = {
          name: data?.name || storedUser?.name || "John Doe",
          email: data?.email || storedUser?.email || "john.doe@university.edu",
          memberSince: data?.memberSince || "2025",
          passwordMasked: "••••••••",
          stats: {
            exercises: data?.stats?.exercises ?? 0,
            solutions: data?.stats?.solutions ?? 0,
            saved: data?.stats?.saved ?? 0,
          },
        };

        setProfile(next);
        setForm({ name: next.name, email: next.email });
      } catch (err) {
        // fallback: usa o que já temos (localStorage / default)
        console.warn("Profile endpoint not ready yet:", err?.message || err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [storedUser?.email, storedUser?.name]);

  const initials = initialsFromName(profile.name);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCancel = () => {
    setForm({ name: profile.name, email: profile.email });
    setToast("");
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setToast("");

      // ✅ endpoint exemplo - ajusta quando ligares o back
      // await apiRequest("/users/me", { method: "PUT", body: { name: form.name } });

      // por agora só atualiza no front + localStorage
      const updated = { ...profile, name: form.name };
      setProfile(updated);

      const existing = JSON.parse(localStorage.getItem("user") || "null");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...(existing || {}), name: form.name, email: form.email })
      );

      setToast("Profile updated successfully.");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setError(err?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    // se tiveres route para change password, mete aqui
    alert("Change password flow (to be implemented)");
  };

  const handleLogoutAll = () => {
    alert("Logout from all devices (to be implemented)");
  };

  const handleDeleteAccount = () => {
    const ok = window.confirm("Delete account? This action cannot be undone.");
    if (!ok) return;
    alert("Delete account (to be implemented)");
  };

  return (
    <div className="profile-page">
      {/* ✅ HEADER / NAVBAR igual aos outros */}
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

      {/* ✅ CONTENT */}
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
            {/* top info */}
            <div className="profile-top">
              <div className="profile-avatar">{initials}</div>

              <div className="profile-top-info">
                <div className="profile-name">{profile.name}</div>
                <div className="profile-email">{profile.email}</div>
                <div className="profile-since">Member since · {profile.memberSince}</div>

                <div className="profile-stats">
                  <span className="stat">
                    <i className="fa-regular fa-file-lines" /> {profile.stats.exercises} Exercises
                  </span>
                  <span className="dot">·</span>
                  <span className="stat">
                    <i className="fa-regular fa-lightbulb" /> {profile.stats.solutions} Solutions
                  </span>
                  <span className="dot">·</span>
                  <span className="stat">
                    <i className="fa-regular fa-bookmark" /> {profile.stats.saved} Saved
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-divider" />

            {/* form */}
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

              <label className="field-label">Password</label>
              <input className="input input-disabled" value={profile.passwordMasked} disabled />
              <button type="button" className="link-btn" onClick={handleChangePassword}>
                Change password
              </button>

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

            {/* account actions */}
            <div className="profile-account">
              <div className="account-title">Account actions</div>

              <button type="button" className="account-item" onClick={handleLogoutAll}>
                <i className="fa-solid fa-right-from-bracket" />
                Logout from all devices
              </button>

              <button type="button" className="account-item danger" onClick={handleDeleteAccount}>
                <i className="fa-regular fa-trash-can" />
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
