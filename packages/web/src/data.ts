export const profile = {
  name: "Jayson Clark",
  role: "Software Engineer · CS & Math Student",
  intro:
    "I'm a computer science and mathematics student at The Ohio State University who loves building systems from the ground up. I'm especially interested in systems programming, graphics, networking, embedded systems, and full-stack software, and I enjoy turning ambitious ideas into polished, working projects.",
  email: "jayson.clark0421@gmail.com",
  photoUrl: "/me.jpeg", // put a path like "/me.jpg" in packages/web/public/ to show your photo
  links: {
    github: "https://github.com/jayson-clark",
    linkedin: "https://www.linkedin.com/in/jayson-clark-328201217/", // replace with your real LinkedIn
    resume: "/jayson_clark_resume.pdf",
  },
};

export type Education = {
  school: string;
  detail: string;
  period: string;
  description: string;
  tags: string[];
};

export const education: Education[] = [
  {
    school: "The Ohio State University",
    detail: "Dual Degree — B.S. Computer Science & B.S. Mathematics",
    period: "Aug 2023 — May 2027",
    description:
      "Pursuing a dual degree with a B.S. in Computer Science and a B.S. in Theoretical Mathematics.",
    tags: ["Computer Science", "Mathematics"],
  },
  {
    school: "The University of Akron",
    detail: "Dual Enrollment",
    period: "2021 — 2023",
    description:
      "Completed 33 college credits through dual enrollment while in high school.",
    tags: ["Dual Enrollment", "33 Credits"],
  },
];

export type Experience = {
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
};

export const experience: Experience[] = [
  {
    role: "Lead Teaching Associate",
    company: "The Ohio State University",
    period: "Aug 2024 — Present",
    description:
    "Led firmware development for a custom microcontroller-based robot platform, enabling real-time position tracking, remote kill signals, and robot authentication for automatic scoring. Also developed the C#/OpenCV course software that tracks student robots via AruCo markers, communicates with on-robot firmware over a custom protocol, and powers automatic scoring and a live leaderboard for the course competition — software, firmware, and microcontrollers that support around 300 students every year. As the lead TA on the microcontroller team, troubleshoot and repair microcontrollers for each student team whenever issues arise. Support students throughout their robot design projects, mentoring them on software development, CAD, and overall design. Teach Excel, MATLAB, C/C++, and CAD assignments while reinforcing core engineering concepts and teamwork.",
    tags: ["C#", "C++", "OpenCV", "AruCo", "MATLAB", "CAD", "Networking", "Embedded Systems", "Teaching"],
  },
  {
    role: "Founder / Full-Stack Developer",
    company: "Polsar LLC",
    period: "March 2026 — Present",
    description:
      "Founded and am building Polsar, an early-stage white-label order processing platform for restaurants. Developing custom storefronts, order management, staff dashboards, Stripe-based payments, and multi-tenant infrastructure designed for reusable deployment across multiple businesses. Currently building the MVP and onboarding the first client.",
    tags: ["TypeScript", "React Native", "Node.js", "OpenAPI", "Stripe", "Full-Stack"],
  },
  {
    role: "Independent Full-Stack Developer",
    company: "Pizza Shack (Freelance Client)",
    period: "Nov 2022 — May 2024",
    description:
      "Contracted independently by the owner to design and ship a complete order processing platform from scratch, including a customer mobile app and public-facing website that has processed close to 2,000 orders to date. Integrated secure payment processing, a Python-driven automatic order-ticket printing pipeline, and a secure database layer. Operate under an ongoing retainer, scoping requirements directly with the client and shipping maintenance and new features as the shop's operations evolve.",
    tags: ["Full-Stack", "Flutter", "Mobile", "Python", "Payments", "Databases"],
  },
  {
    role: "Web Development Intern",
    company: "A Special Wish — Ohio Valley",
    period: "Sep 2022 — August 2024",
    description:
      "Rebuilt the organization's website architecture from the ground up to improve maintainability and streamline content updates. Designed and implemented a custom CMS so the director and marketing team can publish updates without any coding knowledge, and work directly with the director to align site functionality with organizational goals.",
    tags: ["Web", "CMS", "JavaScript", "Firebase", "Nonprofit"],
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
    name: "Rendor — JSON Schema-Driven UI",
    blurb:
      "Built Rendor, a JSON schema-driven UI system that enables server-driven UIs across React and React Native applications. Includes a custom expression engine for dynamic logic, a template system for reusable components, and a renderer that interprets JSON definitions into fully interactive interfaces — letting backends ship UI updates without redeploying clients.",
    tags: ["TypeScript", "React", "React Native", "JSON Schema", "Server-Driven UI"],
    github: "https://github.com/jayson-clark/rendor",
  },
  {
    name: "Robot Controller Communication System",
    blurb:
      "Led the development of firmware for a custom microcontroller and communication system for an engineering course. Enabled real time position tracking for robots, remote kill signals, and robot authentication for automatic scoring systems.",
    tags: ["Embedded Systems", "ESP32", "Arduino", "C++"],
  },
  {
    name: "Robot Course Software",
    blurb:
      "Developed the software system for controlling and tracking student robots in a robotics competition course. Built a C# application that uses AruCo markers and OpenCV to track robot positions in real time, a communication system to send position data and commands to the robots, and automatic scoring and a live leaderboard for the course competition.",
    tags: ["Embedded Systems", "ESP32", "Arduino", "C++"],
  },
  {
    name: "3D Graphics Engine",
    blurb:
      "Built a 3D graphics engine from scratch in C/C++ and used it in a game project. The project involved rendering, engine architecture, and gameplay integration, and it was part of an award-winning showcase project.",
    tags: ["C++", "Graphics", "Game Engine"],
  },
  {
    name: "Empirica — CalHacks (Regeneron Track, Honorable Mention)",
    blurb:
      "Built in 36 hours at CalHacks (3,500+ hackers), Empirica turns static research papers into dynamic knowledge graphs. An agentic AI autonomously searches PubMed and Google Scholar, extracts entities (genes, diseases, drugs) with scispaCy, and builds an interactive 3D/2D graph. A RAG-enhanced Claude 3.5 Sonnet chat lets researchers query their papers with page-level citations, and a Discovery Lab generates novel hypotheses from the graph.",
    tags: ["FastAPI", "Python", "scispaCy", "NetworkX", "React", "Three.js", "RAG", "Claude"],
  },
  {
    name: "DiffSense — UC Berkeley AI Hackathon",
    blurb:
      "Developed a full-stack AI web app in 24 hours at UC Berkeley that predicts breaking changes in code before they happen. Combines an advanced RAG system with 768-dimensional semantic code embeddings, Claude-powered multi-expert analysis, and AST-based breaking change detection to surface risky changes across a codebase.",
    tags: ["RAG", "Embeddings", "Claude", "AST", "Full-Stack", "AI"],
  },
  {
    name: "SignifyAI — HackAI 2025 (1st Place)",
    blurb:
      "Won 1st place at HackAI 2025 (OSU AI Club). SignifyAI is a real-time ASL gesture and emotion detection system that translates fingerspelling, hand gestures, and facial expressions into text. Designed a three-tier TensorFlow neural network architecture with MediaPipe/OpenCV preprocessing (grayscale, background removal, hand/face detection), producing lightweight models (<25MB each) optimized for real-time inference.",
    tags: ["TensorFlow", "MediaPipe", "OpenCV", "Deep Learning", "Computer Vision"],
  },
  {
    name: "QuantifiAI — Quantathon 2025 (2nd Place)",
    blurb:
      "Took 2nd place at OSU's Quantathon 2025 (hosted with Nationwide). A multi-strategy quantitative trading system using PyTorch models, Random Forest classifiers, and statistical analysis for market regime prediction. Built an anomaly detection framework with isolation forests, volatility analysis, and catastrophe modeling, plus Markov chain models and ensemble techniques. Delivered adaptive allocation strategies that outperformed buy-and-hold with superior drawdown control, backed by a full backtesting pipeline.",
    tags: ["PyTorch", "Random Forest", "Quantitative Finance", "Time Series", "Backtesting"],
  },
  {
    name: "Beyond The Line — IMMC Fall 2025 (Meritorious)",
    blurb:
      "Earned Meritorious honors in the Fall 2025 Intercollegiate Math Modeling Challenge. Developed a computational framework to audit North Carolina's 2023 congressional map (SB 757) using a two-stage pipeline: SKATER spatial clustering partitioned 2,672 census tracts into 30 communities from demographic and LODES commuting data, and an MCMC ensemble (ReCom algorithm) generated neutral redistricting plans as a null distribution. A Shannon-entropy-based Community Splitting Index showed the enacted map's fragmentation exceeded 89% of neutral plans, with one community split at a near-maximum score of 0.9999.",
    tags: ["Python", "GeoPandas", "MCMC", "Spatial Analysis", "Unsupervised Learning"],
  },
  {
    name: "DataFest 2025 — Best Insight Finalist",
    blurb:
      "Selected as a finalist for 'Best Insight' at DataFest 2025 (American Statistical Association). Applied K-means clustering with silhouette analysis and PCA visualization to identify five distinct market segments, supported by multi-dimensional z-score feature analysis, radar charts, and time-series analysis of segment recovery. Translated the results into a strategic framework for resource allocation and opportunity identification.",
    tags: ["K-Means", "PCA", "Clustering", "Data Science", "Visualization"],
  },
  {
    name: "VR Spanish Vocab Game — World Language Appathon (Honorable Mention)",
    blurb:
      "Honorable mention at OSU's first interdisciplinary World Language Appathon between the Center for Languages, Literatures, and Cultures and CSE. Built an immersive VR language learning game for Meta Quest in Unity that teaches A1 Spanish vocabulary — the player runs an open-air Cuban food stall across three difficulty levels, reinforcing culturally significant food and vendor vocabulary and auditory comprehension.",
    tags: ["Unity", "VR", "Meta Quest", "C#", "Game Development"],
  },
];

export type Course = {
  code: string;
  title: string;
};

export const coursework: Course[] = [
  // Computer Science
  { code: "CSE 2221", title: "Software I: Software Components" },
  { code: "CSE 2231", title: "Software II: Software Development & Design" },
  { code: "CSE 2321", title: "Foundations I: Discrete Structures" },
  { code: "CSE 2331", title: "Foundations II: Data Structures & Algorithms" },
  { code: "CSE 2421", title: "Systems I: Low-Level Programming and Computer Organization" },
  { code: "CSE 2431", title: "Systems II: Operating Systems" },
  { code: "CSE 3241", title: "Database Systems" },
  { code: "CSE 3341", title: "Principles of Programming Languages" },
  { code: "CSE 3461", title: "Computer Networking" },
  { code: "CSE 3521", title: "Artificial Intelligence" },
  { code: "CSE 3901", title: "Project: Web Applications" },
  { code: "CSE 5351", title: "Cryptography" },

  // Math / Statistics
  { code: "MATH 2153", title: "Calculus III" },
  { code: "MATH 2255", title: "Differential Equations" },
  { code: "MATH 2568", title: "Linear Algebra" },
  { code: "MATH 3345H", title: "Honors Foundations of Higher Mathematics" },
  { code: "MATH 4547", title: "Analysis I" },
  { code: "MATH 4548", title: "Analysis II" },
  { code: "MATH 4580", title: "Abstract Algebra I" },
  { code: "MATH 5051", title: "Mathematical Logic" },
  { code: "MATH 5101", title: "Finite Linear Mathematics" },
  { code: "STAT 4201", title: "Mathematical Statistics I" },
  { code: "STAT 4202", title: "Mathematical Statistics II" },
];