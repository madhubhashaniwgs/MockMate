import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <Brain size={32}/>
        <span>MockMate</span>
      </div>


      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/login">
          Login
        </Link>

        <Link className="register-btn" to="/register">
          Get Started
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;