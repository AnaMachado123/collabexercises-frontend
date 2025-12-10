// src/App.jsx
import { Navigate } from "react-router-dom";

function App() {
  // sempre que alguém vai a "/", vai direto para /login
  return <Navigate to="/login" replace />;
}

export default App;
