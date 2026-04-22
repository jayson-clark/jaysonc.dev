import { coursework } from "../data";

export function Coursework() {
  return (
    <section id="coursework">
      <div className="section-label reveal">04 — Coursework</div>
      <h2 className="section-title reveal">Relevant coursework</h2>
      <div className="coursework-grid">
        {coursework.map((c) => (
          <div className="course reveal" key={c.code}>
            <span>{c.title}</span>
            <span className="course-code">{c.code}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
