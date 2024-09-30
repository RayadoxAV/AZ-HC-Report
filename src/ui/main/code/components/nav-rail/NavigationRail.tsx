/* 
  Raymundo Paz
  September 2024
*/

import './NavigationRail.css';
import NavRailItem from './NavRailItem';

const NavigationRail: React.FC = () => {
  return (
    <div className="nav-rail">
      <NavRailItem title="Comparator" icon="difference" destination="" />
      <NavRailItem title="Entries" icon="table" destination="entries" />
      <NavRailItem title="Reports" icon="chart" destination="reports" />
      <NavRailItem title="Settings" icon="settings" destination="Settings" />
    </div>
  );
}

export default NavigationRail;
