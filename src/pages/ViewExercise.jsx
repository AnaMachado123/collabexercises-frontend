// src/pages/ViewExercise.jsx
import "./ViewExercise.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function ViewExercise() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Saved (front-only for now)
  const [isSaved, setIsSaved] = useState(false);
  const [savePop, setSavePop] = useState(false);

  // ✅ Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  // ✅ Solutions
  const [solutions, setSolutions] = useState([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutionNotes, setSolutionNotes] = useState("");
  const [solutionFiles, setSolutionFiles] = useState([]);
  const [postingSolution, setPostingSolution] = useState(false);

  const commentsRef = useRef(null);
  const solutionsRef = useRef(null);

  // ✅ attachments UI (comments)
  const [commentFiles, setCommentFiles] = useState([]);
  const fileInputRef = useRef(null);

  // ✅ attachments UI (solutions)
  const solutionFileInputRef = useRef(null);

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const displayName = user?.name || user?.username || user?.email || "User";

  const initials =
    displayName
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "U";

  // ✅ load saved state from backend (per exercise)
  useEffect(() => {
    if (!id) return;

    const fetchSavedState = async () => {
      try {
        const data = await apiRequest(`/exercises/${id}/is-saved`, {
          auth: true,
        });
        setIsSaved(!!data.saved);
      } catch (err) {
        console.warn("is-saved not available yet:", err?.message || err);
        setIsSaved(false);
      }
    };

    fetchSavedState();
  }, [id]);

  const toggleSaved = async () => {
    if (!id) return;

    try {
      const data = await apiRequest(`/exercises/${id}/save-toggle`, {
        method: "POST",
        auth: true,
      });

      setIsSaved(!!data.saved);

      // atualiza contador imediatamente
      setExercise((prev) =>
        prev ? { ...prev, savesCount: data.savesCount } : prev
      );

      if (data.saved) {
        setSavePop(true);
        window.setTimeout(() => setSavePop(false), 320);
      }
    } catch (err) {
      console.error("SAVE TOGGLE ERROR:", err);
      alert("Não consegui guardar. Estás logada? (token) 👀");
    }
  };

  // ✅ difficulty class (bulletproof)
  const difficultyClass = useMemo(() => {
    const raw = (exercise?.difficulty || "").toString().toLowerCase();
    if (raw.includes("begin")) return "difficulty-beginner";
    if (raw.includes("inter")) return "difficulty-intermediate";
    if (raw.includes("adv")) return "difficulty-advanced";
    return "";
  }, [exercise?.difficulty]);

  // counts (fallback para listas)
  const commentsCount = useMemo(() => {
    const n = exercise?.commentsCount;
    if (typeof n === "number") return n;
    return comments.length;
  }, [exercise, comments.length]);

  const solutionsCount = useMemo(() => {
    const n = exercise?.solutionsCount;
    if (typeof n === "number") return n;
    return solutions.length;
  }, [exercise, solutions.length]);

  const savedCount = useMemo(() => {
    const n = exercise?.savesCount ?? exercise?.savedCount;
    return typeof n === "number" ? n : 0;
  }, [exercise]);

  // ✅ Fetch exercise
  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const data = await apiRequest(`/exercises/${id}`);
        setExercise(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExercise();
  }, [id]);

  // ✅ Fetch comments
  useEffect(() => {
    if (!id) return;

    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const data = await apiRequest(`/exercises/${id}/comments`);
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Comments endpoint not ready yet:", err?.message || err);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  // ✅ Fetch solutions
  useEffect(() => {
    if (!id) return;

    const fetchSolutions = async () => {
      setSolutionsLoading(true);
      try {
        const data = await apiRequest(`/exercises/${id}/solutions`);
        setSolutions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Solutions endpoint not ready yet:", err?.message || err);
        setSolutions([]);
      } finally {
        setSolutionsLoading(false);
      }
    };

    fetchSolutions();
  }, [id]);

  // scroll helpers
  const handleScrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollToSolutions = () => {
    solutionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ comment files UI
  const openFilePicker = () => fileInputRef.current?.click();

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setCommentFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removePickedFile = (index) => {
    setCommentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ solution files UI
  const openSolutionFilePicker = () => solutionFileInputRef.current?.click();

  const onPickSolutionFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSolutionFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeSolutionFile = (index) => {
    setSolutionFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Post comment — texto e/ou ficheiros (multipart)
  const handlePostComment = async () => {
    const text = newComment.trim();

    if (!text && commentFiles.length === 0) {
      alert("Write something or attach at least one file 🙂");
      return;
    }

    setPosting(true);

    try {
      const fd = new FormData();
      fd.append("text", text);
      commentFiles.forEach((f) => fd.append("files", f));

      const created = await apiRequest(`/exercises/${id}/comments`, {
        method: "POST",
        auth: true,
        body: fd,
      });

      setComments((prev) => [created, ...prev]);
      setNewComment("");
      setCommentFiles([]);
    } catch (err) {
      console.error(err);
      alert("Erro ao publicar comentário. Vê se estás logada (token) 👀");
    } finally {
      setPosting(false);
    }
  };

  // ✅ Post solution — texto e/ou ficheiros (multipart)
  const handlePostSolution = async () => {
    const text = solutionNotes.trim();

    if (!text && solutionFiles.length === 0) {
      alert("Write something or attach at least one file 🙂");
      return;
    }

    setPostingSolution(true);

    try {
      const fd = new FormData();
      fd.append("text", text); // ✅ backend espera "text"
      solutionFiles.forEach((f) => fd.append("files", f)); // ✅ backend espera "files"

      const created = await apiRequest(`/exercises/${id}/solutions`, {
        method: "POST",
        auth: true,
        body: fd,
      });

      setSolutions((prev) => [created, ...prev]);
      setSolutionNotes("");
      setSolutionFiles([]);
    } catch (err) {
      console.error(err);
      alert("Erro ao submeter solução. Vê se estás logada (token) 👀");
    } finally {
      setPostingSolution(false);
    }
  };

  if (loading) {
    return (
      <div className="view-page">
        <div className="view-container skeleton">
          <div className="sk-title"></div>
          <div className="sk-tags"></div>
          <div className="sk-meta"></div>
          <div className="sk-grid">
            <div className="sk-block"></div>
            <div className="sk-block"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  const exerciseAttachments = exercise.attachments || [];

  return (
    <div className="view-page">
      <div className="view-container">
        {/* BREADCRUMB */}
        <div className="breadcrumb">
          <span onClick={() => navigate("/dashboard")}>Home</span>
          <span className="separator">›</span>
          <span onClick={() => navigate("/dashboard")}>Exercises</span>
          <span className="separator">›</span>
          <span className="active">{exercise.title}</span>
        </div>

        {/* TITLE + SAVE */}
        <div className="view-title-row">
          <h1 className="view-title">{exercise.title}</h1>

          <button
            type="button"
            className={`bookmark-btn ${isSaved ? "saved" : ""} ${
              savePop ? "pop" : ""
            }`}
            onClick={toggleSaved}
            aria-label={isSaved ? "Unsave exercise" : "Save exercise"}
            title={isSaved ? "Saved" : "Save"}
          >
            <i
              className={isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}
            ></i>
          </button>
        </div>

        {/* TAGS */}
        <div className="view-tags">
          <span className="pill subject">{exercise.subject}</span>

          <span className={`pill difficulty difficulty-pill ${difficultyClass}`}>
            {exercise.difficulty}
          </span>
        </div>

        {/* META */}
        <div className="view-meta">
          Created by <strong>{exercise.createdBy?.name}</strong> ·{" "}
          {new Date(exercise.createdAt).toLocaleDateString()}
        </div>

        {/* METRICS */}
        <div className="view-metrics">
          <span>{savedCount ?? 0} saved</span>

          <button type="button" className="metric-link" onClick={handleScrollToComments}>
            {commentsCount ?? 0} comments
          </button>

          <button type="button" className="metric-link" onClick={handleScrollToSolutions}>
            {solutionsCount ?? 0} solutions
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="view-grid">
          <section className="view-description">
            <h3>Description</h3>
            <p>{exercise.description}</p>
          </section>

          <aside className="view-attachments">
            <h3>Attached files</h3>

            {exerciseAttachments.length === 0 && (
              <p className="empty">No attachments</p>
            )}

            {exerciseAttachments.map((file, index) => (
              <a
                key={index}
                className="attachment"
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file.originalName || "file"}
              </a>
            ))}
          </aside>
        </div>

        {/* ✅ COMMENTS */}
        <section className="comments-section" ref={commentsRef}>
          <div className="comments-header">
            <h3>Comments</h3>
            <span className="comments-count">{commentsCount ?? 0}</span>
          </div>

          <div className="comment-form">
            <div className="comment-avatar">{initials}</div>

            <div className="comment-inputs">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="comment-file-input"
                onChange={onPickFiles}
              />

              <div className="comment-textarea-wrap">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or leave feedback…"
                  rows={3}
                />

                <button
                  type="button"
                  className="comment-attach-btn"
                  onClick={openFilePicker}
                  aria-label="Attach files"
                  title="Attach files"
                >
                  <i className="fa-solid fa-paperclip"></i>
                </button>
              </div>

              {commentFiles.length > 0 && (
                <div className="comment-files">
                  {commentFiles.map((f, idx) => (
                    <div className="file-chip" key={`${f.name}-${idx}`}>
                      <span className="file-chip-name">{f.name}</span>
                      <button
                        type="button"
                        className="file-chip-remove"
                        onClick={() => removePickedFile(idx)}
                        aria-label="Remove file"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="comment-actions">
                <button
                  className="comment-post-btn"
                  type="button"
                  onClick={handlePostComment}
                  disabled={posting || (!newComment.trim() && commentFiles.length === 0)}
                >
                  {posting ? "Posting..." : "Post comment"}
                </button>
              </div>
            </div>
          </div>

          <div className="comment-list">
            {commentsLoading ? (
              <p className="comments-empty">Loading comments…</p>
            ) : comments.length === 0 ? (
              <p className="comments-empty">No comments yet. Be the first </p>
            ) : (
              comments.map((c) => (
                <div className="comment-item" key={c.id || c._id}>
                  <div className="comment-avatar">
                    {(c.user?.name?.[0] || "U").toUpperCase()}
                  </div>

                  <div className="comment-content">
                    <div className="comment-meta">
                      <span className="comment-name">{c.user?.name || "User"}</span>
                      <span className="comment-dot">·</span>
                      <span className="comment-time">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                      </span>
                    </div>

                    <p className="comment-text">{c.text}</p>

                    {!!(c.attachments || []).length && (
                      <div className="solution-files-list">
                        {(c.attachments || []).map((f, idx) => (
                          <a
                            key={idx}
                            className="solution-file"
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {f.originalName || "file"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ✅ SOLUTIONS */}
        <section className="solutions-section" ref={solutionsRef}>
          <div className="solutions-header">
            <h3>Solutions</h3>
            <span className="solutions-count">{solutionsCount ?? 0}</span>
          </div>

          <p className="solutions-hint">
            Submit an official solution with text and/or files (PDF/code/images). You can attach multiple files.
          </p>

          <div className="solution-form">
            <input
              ref={solutionFileInputRef}
              type="file"
              multiple
              className="solution-file-input"
              onChange={onPickSolutionFiles}
            />

            <div className="solution-notes-wrap">
              <textarea
                value={solutionNotes}
                onChange={(e) => setSolutionNotes(e.target.value)}
                placeholder="Write your solution here (code/text) and/or attach files…"
                rows={4}
              />

              <button
                type="button"
                className="solution-attach-btn"
                onClick={openSolutionFilePicker}
                aria-label="Attach solution files"
                title="Attach files"
              >
                <i className="fa-solid fa-paperclip"></i>
              </button>
            </div>

            {solutionFiles.length > 0 && (
              <div className="solution-files">
                {solutionFiles.map((f, idx) => (
                  <div className="file-chip" key={`${f.name}-${idx}`}>
                    <span className="file-chip-name">{f.name}</span>
                    <button
                      type="button"
                      className="file-chip-remove"
                      onClick={() => removeSolutionFile(idx)}
                      aria-label="Remove file"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="solution-actions">
              <button
                className="solution-post-btn"
                type="button"
                onClick={handlePostSolution}
                disabled={postingSolution || (!solutionNotes.trim() && solutionFiles.length === 0)}
              >
                {postingSolution ? "Submitting..." : "Submit solution"}
              </button>
            </div>
          </div>

          <div className="solution-list">
            {solutionsLoading ? (
              <p className="solutions-empty">Loading solutions…</p>
            ) : solutions.length === 0 ? (
              <p className="solutions-empty">No solutions yet. Be the first </p>
            ) : (
              solutions.map((s) => (
                <div className="solution-item" key={s.id || s._id}>
                  <div className="solution-meta">
                    <span className="solution-name">{s.user?.name || "User"}</span>
                    <span className="comment-dot">·</span>
                    <span className="solution-time">
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : ""}
                    </span>
                  </div>

                  {/* ✅ BACK DEVOLVE "text", não "notes" */}
                  {s.text && <p className="solution-notes">{s.text}</p>}

                  {/* ✅ BACK DEVOLVE "attachments", não "files" */}
                  {!!(s.attachments || []).length && (
                    <div className="solution-files-list">
                      {(s.attachments || []).map((f, idx) => (
                        <a
                          key={idx}
                          className="solution-file"
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {f.originalName || "file"}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
}

export default ViewExercise;
