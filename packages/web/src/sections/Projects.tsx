import { projects } from "../data";

export function Projects() {
  return (
    <section id="projects">
      <div className="section-label reveal">04 — Projects</div>
      <h2 className="section-title reveal">Things I've built</h2>
      <div className="cards-grid">
        {projects.map((p) => (
          <article className="card reveal" key={p.name}>
            <h3 className="card-title">{p.name}</h3>
            <div className="card-sub">Project</div>
            <p>{p.blurb}</p>
            <div className="tags">
              {p.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {(p.github || p.demo) && (
              <div className="project-links">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noreferrer">
                    GitHub →
                  </a>
                )}
                {p.demo && (
                  <a href={p.demo} target="_blank" rel="noreferrer">
                    Demo →
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
