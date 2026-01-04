// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateExercise from "./pages/CreateExercise.jsx";
import ViewExercise from "./pages/ViewExercise.jsx";
import MyExercises from "./pages/MyExercises.jsx";
import MySolutions from "./pages/MySolutions.jsx";
import MySaved from "./pages/MySaved.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      {/*  DEFAULT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* APP */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/exercises/new" element={<CreateExercise />} />
      <Route path="/exercises/:id" element={<ViewExercise />} />
      <Route path="/my-exercises" element={<MyExercises />} />
      <Route path="/my-solutions" element={<MySolutions />} />
      <Route path="/my-saved" element={<MySaved />} />


    </Routes>
  </BrowserRouter>
);
