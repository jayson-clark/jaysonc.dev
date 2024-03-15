import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import '../../styles/root/NavMenu.css';

const NavMenu = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [navHeight, setNavHeight] = useState('auto');
  const location = useLocation();

  useEffect(() => {
    const navElement = document.getElementById('nav');
    const resizeObserver = new ResizeObserver(entries => {
      calculateNavHeight();
    });

    resizeObserver.observe(navElement);

    return () => resizeObserver.unobserve(navElement);
  }, [isHovered]);

  // Function to calculate and set navigation height
  const calculateNavHeight = () => {
    const children = document.querySelectorAll('#nav a');
    if (children.length > 0) {
      const singleHeight = children[1].offsetHeight;
      const allHeight = children.length * singleHeight;
      const newHeight = isHovered ? `${allHeight}px` : `${singleHeight}px`;
      setNavHeight(newHeight);
    }
  };

  return (
    <div
      className='nav' id="nav" style={{ height: navHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        <i className="fa-solid fa-house" />
      </Link>
      <Link to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>
        <i className="fa-solid fa-code" />
      </Link>
    </div>
  );
};

export default NavMenu;
