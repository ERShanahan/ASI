import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <nav>
        <NavLink to="/" end className="nav-link">
          Home
        </NavLink>
        <NavLink to="/record" className="nav-link">
          Record
        </NavLink>
        <NavLink to="/learn" className="nav-link">
          Learn
        </NavLink>
      </nav>
    </header>
  );
}
