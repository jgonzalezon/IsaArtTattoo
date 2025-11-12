import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Me from "./pages/Me";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> · <Link to="/login">Login</Link> · <Link to="/register">Registro</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/confirm-email" element={<ConfirmEmail/>} />
        <Route path="/forgot" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/me" element={
          <ProtectedRoute><Me/></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}
