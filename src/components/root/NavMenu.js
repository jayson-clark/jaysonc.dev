import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCode } from '@fortawesome/free-solid-svg-icons';

import '../../styles/root/NavMenu.css';

const NavMenu = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [navHeight, setNavHeight] = useState('auto');
  const location = useLocation();

  useEffect(() => {
    const children = document.querySelectorAll('#nav a');
    const singleHeight = [...children][1].offsetHeight;
    const allHeight = [...children].length * singleHeight;

    isHovered ? setNavHeight(`${allHeight}px`) : setNavHeight(`${singleHeight}px`);

  }, [isHovered]);

  return (
    <div
      className='nav' id="nav" style={{ height: navHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        <FontAwesomeIcon icon={faHouse} />
      </Link>
      <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>
        <FontAwesomeIcon icon={faCode} />
      </Link>
    </div>
  );
};

export default NavMenu;
