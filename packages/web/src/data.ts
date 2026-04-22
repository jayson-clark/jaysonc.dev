export const profile = {
  name: "Jayson Clark",
  role: "Software Engineer · CS & Math Student",
  intro:
    "I'm a computer science and mathematics student at The Ohio State University who loves building systems from the ground up. I'm especially interested in systems programming, graphics, networking, embedded systems, and full-stack software, and I enjoy turning ambitious ideas into polished, working projects.",
  email: "jayson.clark0421@gmail.com",
  photoUrl: "/me.jpeg", // put a path like "/me.jpg" in packages/web/public/ to show your photo
  links: {
    github: "https://github.com/jayson-clark",
    linkedin: "https://www.linkedin.com/", // replace with your real LinkedIn
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
    role: "Teaching Assistant",
    company: "The Ohio State University",
    period: "2024 — Present",
    description:
      "Support engineering courses by helping students with programming, embedded systems, debugging, and project development. Also contributed to course infrastructure and helped develop software and communication systems for student robot controllers.",
    tags: ["C", "C++", "Embedded Systems", "Teaching"],
  },
  {
    role: "Undergraduate Student Developer",
    company: "Personal & Academic Projects",
    period: "2023 — Present",
    description:
      "Built projects across graphics, web, embedded systems, and tooling, including a 3D graphics engine, plugin-based software systems, robotics software, and full-stack application ideas focused on clean architecture and performance.",
    tags: ["TypeScript", "C++", "React", "Systems"],
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
    name: "3D Graphics Engine",
    blurb:
      "Built a 3D graphics engine from scratch in C/C++ and used it in a game project. The project involved rendering, engine architecture, and gameplay integration, and it was part of an award-winning showcase project.",
    tags: ["C++", "Graphics", "Game Engine"],
    github: "https://github.com/jayson-clark",
  },
  {
    name: "Robot Controller Communication System",
    blurb:
      "Worked on a custom robot controller and communication system for an engineering course, involving embedded hardware, controller software, and communication between devices for student robotics projects.",
    tags: ["Embedded Systems", "ESP32", "Arduino", "C++"],
    github: "https://github.com/jayson-clark",
  },
  {
    name: "Plugin-Based Software Platform",
    blurb:
      "Designed and built modular software systems with dynamically loaded plugins, custom widgets, pages, and database-backed functionality. Focused on extensibility, architecture, and clean interfaces for adding new features.",
    tags: ["Node.js", "PostgreSQL", "Architecture", "Plugins"],
    github: "https://github.com/jayson-clark",
  },
];

export type Course = {
  code: string;
  title: string;
};

export const coursework: Course[] = [
  { code: "CSE 3341", title: "Principles of Programming Languages" },
  { code: "CSE 2321", title: "Foundations I: Discrete Structures" },
  { code: "CSE 2331", title: "Foundations II: Data Structures & Algorithms" },
  { code: "CSE 2421", title: "Systems I: Introduction to Low-Level Programming and Computer Organization" },
  { code: "MATH 3345", title: "Foundations of Higher Mathematics" },
  { code: "MATH 3345H", title: "Honors Foundations of Higher Mathematics" }, // keep only if applicable
  { code: "MATH 4181H", title: "Honors Real Analysis I" }, // adjust if your exact course number differs
  { code: "STAT", title: "Probability / Statistics Coursework" }, // replace with exact course if you want
];