import { Link } from "react-router-dom";
import logo from "../assets/logo1.png";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo">
        <img src={logo} alt="MockMate" />
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