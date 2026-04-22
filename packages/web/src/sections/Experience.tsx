import { experience } from "../data";

export function Experience() {
  return (
    <section id="experience">
      <div className="section-label reveal">02 — Experience</div>
      <h2 className="section-title reveal">Where I've worked</h2>
      <div className="cards-stack">
        {experience.map((e) => (
          <article className="card reveal" key={e.role + e.company}>
            <div className="card-head">
              <h3 className="card-title">
                {e.role}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                  · {e.company}
                </span>
              </h3>
              <span className="card-meta">{e.period}</span>
            </div>
            <p>{e.description}</p>
            <div className="tags">
              {e.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
