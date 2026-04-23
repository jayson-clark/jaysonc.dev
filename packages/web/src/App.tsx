import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CircuitBackground } from "@portfolio/circuit-bg";
import "./styles.css";
import { Nav } from "./components/Nav";
import { Hero } from "./sections/Hero";
import { Education } from "./sections/Education";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { Coursework } from "./sections/Coursework";

gsap.registerPlugin(ScrollTrigger);

export function App() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.from(".nav", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <CircuitBackground />
      <Nav />
      <main>
        <Hero />
        <Education />
        <Experience />
        <Projects />
        <Coursework />
      </main>
    </>
  );
}
