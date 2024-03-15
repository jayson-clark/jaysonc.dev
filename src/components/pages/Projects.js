import React from 'react';
import '../../styles/pages/Projects.css';
import data from '../../assets/projects.json';

// Component for project links
const ProjectLink = ({ url, icon }) => (
    <a target="_blank" href={url} rel="noreferrer noopener">
        <i className={icon} />
    </a>
);

// Component for project tags
const ProjectTag = ({ tag }) => (
    <div className="tag">
        <p>{tag}</p>
    </div>
);

const Project = ({ id }) => {
    const projectData = data[id];

    const links = projectData.links.map((link, index) => (
        <ProjectLink key={index} url={link.url} icon={link.icon} />
    ));

    const tags = projectData.tags.map((tag, index) => (
        <ProjectTag key={index} tag={tag} />
    ));

    return (
        <div className="project">
            <div className="thumbnail">
                <img src={projectData.image_url} alt={projectData.name} />
            </div>
            <div className="body">
                <div className="header">
                    <h2>{projectData.name}</h2>
                    <div className="links">{links}</div>
                </div>
                <p>{projectData.short_description}</p>
                <div className="tags">{tags}</div>
            </div>
        </div>
    );
};

const Projects = () => (
    <div className="content" style={{ display: 'block', paddingTop: '120px' }}>
        <div className="projects">
            {Object.keys(data).map(id => (
                <Project key={id} id={id} />
            ))}
        </div>
    </div>
);

export default Projects;
