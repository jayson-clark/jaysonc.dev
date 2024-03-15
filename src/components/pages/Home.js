import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

import '../../styles/pages/Home.css';
import headshotJPG from '../../assets/images/headshot.JPG';

// Represents a single character in the name display
const CharacterSpan = ({ character, index, length, baseStyles }) => {
    const rotationDegree = 8;
    const deg = rotationDegree * (index - (length / 2 - 0.5));
    const styles = {
        ...baseStyles,
        transform: `translate(-50%, -50%) translateY(-50%) rotate(${deg}deg)`,
    };

    return <span style={styles}>{character}</span>;
};

// Represents a single icon link
const IconLink = ({ icon, link, index, length, baseStyles }) => {
    const rotationDegree = 12;
    const deg = rotationDegree * (index - (length / 2 - 0.5));
    const styles = {
        ...baseStyles,
        transform: `translate(-50%, -50%) translateY(50%) rotate(${deg}deg)`,
    };

    return (
        <div style={styles}>
            <a href={link} target="_blank" rel="noopener noreferrer">
                <i className={icon}></i>
            </a>
        </div>
    );
};

const Home = () => {
    const name = 'Jayson Clark';
    const headshotRef = useRef(null);
    const [characterStyles, setCharacterStyles] = useState({});
    const [iconStyles, setIconStyles] = useState({});

    // Social media icons and links
    const socialMedia = [
        { icon: "fa-brands fa-linkedin", link: 'https://www.linkedin.com/in/jayson-clark-328201217/' },
        { icon: "fa-brands fa-github", link: 'https://github.com/jayson-clark' },
        { icon: "fa-solid fa-envelope", link: 'mailto:jayson.clark0421@gmail.com' },
    ];

    useEffect(() => {

        // Calculate and update styles for characters and icons
        const updateStyles = () => {
            if (!headshotRef.current) return;

            const rect = headshotRef.current.getBoundingClientRect();
            const borderWidth = parseFloat(window.getComputedStyle(headshotRef.current).borderWidth);
            const left = rect.left + headshotRef.current.clientWidth / 2 + borderWidth;
            const top = rect.top + headshotRef.current.clientHeight / 2 + borderWidth;

            const baseStyle = {
                left: `${left}px`,
                top: `${top}px`,
                height: `${headshotRef.current.clientHeight / 2 + 35}px`, // Shared base height for both characters and icons
            };

            setCharacterStyles({ ...baseStyle, height: `${parseFloat(baseStyle.height) + 3}px` }); // Slightly adjust for character display
            setIconStyles(baseStyle);
        };

        // Initialize styles
        updateStyles();

        // Update styles on window resize, debounced to improve performance
        const debouncedHandleResize = debounce(updateStyles, 100);
        window.addEventListener('resize', debouncedHandleResize);

        // Cleanup on component unmount
        return () => window.removeEventListener('resize', debouncedHandleResize);
    }, []);

    return (
        <div className='content column'>
            <img ref={headshotRef} className='headshot' src={headshotJPG} alt='Headshot' />
            <div className='top'>
                {name.split('').map((char, i) => (
                    <CharacterSpan
                        key={i}
                        character={char}
                        index={i}
                        length={name.length}
                        baseStyles={characterStyles}
                    />
                ))}
            </div>
            <div className='bottom'>
                {socialMedia.map((item, i) => (
                    <IconLink
                        key={i}
                        icon={item.icon}
                        link={item.link}
                        index={i}
                        length={socialMedia.length}
                        baseStyles={iconStyles}
                    />
                ))}
            </div>
        </div>
    );
};

export default Home;
