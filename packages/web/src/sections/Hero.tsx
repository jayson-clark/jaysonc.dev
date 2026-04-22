import { useEffect, useRef } from "react";
import gsap from "gsap";
import { profile } from "../data";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 })
        .from(".hero-name", { y: 30, opacity: 0, duration: 0.8 }, "-=0.3")
        .from(".hero-role", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
        .from(".hero-intro", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(
          ".hero-links .btn",
          { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 },
          "-=0.4",
        )
        .from(
          ".hero-photo",
          { scale: 0.9, opacity: 0, duration: 0.9, ease: "power2.out" },
          "-=0.9",
        );

      gsap.to(".hero-photo", {
        y: -10,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="hero" ref={root}>
      <div>
        <div className="section-label hero-eyebrow">Portfolio</div>
        <h1 className="hero-name">
          Hi, I'm <span>{profile.name.split(" ")[0]}</span>.
        </h1>
        <div className="hero-role">{profile.role}</div>
        <p className="hero-intro">{profile.intro}</p>
        <div className="hero-links">
          <a
            className="btn primary"
            href={profile.links.resume}
            target="_blank"
            rel="noreferrer"
          >
            Resume
          </a>
          <a
            className="btn"
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="btn"
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a className="btn" href={`mailto:${profile.email}`}>
            Email
          </a>
        </div>
      </div>
      <div className="hero-photo-wrap">
        {profile.photoUrl ? (
          <img
            className="hero-photo"
            src={profile.photoUrl}
            alt={`Portrait of ${profile.name}`}
          />
        ) : (
          <div className="hero-photo placeholder">YOUR PHOTO</div>
        )}
      </div>
    </section>
  );
}
