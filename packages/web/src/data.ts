export const profile = {
  name: "Jayson Clark",
  role: "Software Engineer · CS Student",
  intro:
    "I'm a computer science student who loves building expressive, performant software — from graphics and tooling to full-stack web apps. Currently focused on systems programming, interactive visuals, and shipping polished side projects.",
  email: "jayson.clark0421@gmail.com",
  photoUrl: "", // put a path like "/me.jpg" in packages/web/public/ to show your photo
  links: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    resume: "/resume.pdf",
  },
};

export type Experience = {
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
};

export const experience: Experience[] = [
  {
    role: "Software Engineering Intern",
    company: "Company Name",
    period: "Summer 2025",
    description:
      "Built internal tooling and shipped user-facing features across the stack. Replace this copy with a real bullet or two about what you actually did.",
    tags: ["TypeScript", "React", "Node.js"],
  },
  {
    role: "Undergraduate Research Assistant",
    company: "University Lab",
    period: "2024 — Present",
    description:
      "Placeholder: describe the research, your contributions, and any papers, demos, or systems you built.",
    tags: ["C++", "Graphics", "Research"],
  },
];

export type Project = {
  name: string;
  blurb: string;
  tags: string[];
  github?: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    name: "Circuit Background",
    blurb:
      "Procedural animated circuit-board background with interactive pulse lighting. Written in TypeScript on a 2D canvas, the component driving this page.",
    tags: ["TypeScript", "Canvas", "React"],
    github: "https://github.com/",
  },
  {
    name: "Project Two",
    blurb:
      "Placeholder — short blurb about what this project does, why it's interesting, and what you learned building it.",
    tags: ["Go", "Systems"],
    github: "https://github.com/",
    demo: "#",
  },
  {
    name: "Project Three",
    blurb:
      "Placeholder — a third project to fill out the grid. Swap in your favorite work.",
    tags: ["Python", "ML"],
    github: "https://github.com/",
  },
];

export type Course = {
  code: string;
  title: string;
};

export const coursework: Course[] = [
  { code: "CS 225", title: "Data Structures" },
  { code: "CS 374", title: "Algorithms & Models of Computation" },
  { code: "CS 233", title: "Computer Architecture" },
  { code: "CS 241", title: "Systems Programming" },
  { code: "CS 418", title: "Interactive Computer Graphics" },
  { code: "CS 411", title: "Database Systems" },
  { code: "CS 421", title: "Programming Languages" },
  { code: "MATH 415", title: "Applied Linear Algebra" },
];
