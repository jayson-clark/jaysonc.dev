import { education } from "../data";

export function Education() {
  return (
    <section id="education">
      <div className="section-label reveal">02 — Education</div>
      <h2 className="section-title reveal">Where I've studied</h2>
      <div className="cards-stack">
        {education.map((e) => (
          <article className="card reveal" key={e.school + e.detail}>
            <div className="card-head">
              <h3 className="card-title">
                {e.school}{" "}
                <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                  · {e.detail}
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
