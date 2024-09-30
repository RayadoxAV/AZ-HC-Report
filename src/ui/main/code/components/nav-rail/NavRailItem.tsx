/* 
  Raymundo Paz
  September 2024
*/

import { Link, useMatch, useResolvedPath } from 'react-router-dom';

interface NavRailItemProps {
  title: string;
  icon: string;
  destination: string;
}

const NavRailItem: React.FC<NavRailItemProps> = ({ title, icon, destination }) => {
  const resolved = useResolvedPath(destination);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Link to={destination}>
      <div className={`nav-item ${match ? 'active' : ''}`}>
        <span className="icon" data-icon={icon}></span>
        <span className="title">{title}</span>
      </div>
    </Link>
  );
}

export default NavRailItem;
