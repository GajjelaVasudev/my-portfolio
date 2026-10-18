export interface NavLink {
  label: string;
  href: string;
}

export interface ProjectItem {
  id: string;
  tag: string;
  category: string;
  title: string;
  tech: string[];
  description: string;
  bullets?: string[];
  metricLabel: string;
  metricValue?: string;
  actionText: string;
  actionUrl: string;
  imageAlt: string;
  isFeatured?: boolean;
}

export interface PortfolioData {
  personal: {
    name: string;
    firstName: string;
    lastName: string;
    descriptor: string;
    role: string;
    year: string;
    heroHeadline: {
      lead: string;
      italic: string;
      trail: string;
    };
    heroBio: string;
    footerBio: string;
    email: string;
    githubUrl: string;
    linkedinUrl: string;
    resumeUrl: string;
  };
  navigation: NavLink[];
  featuredProject: ProjectItem;
  gridProjects: ProjectItem[];
  about: {
    sectionHeading: string;
    monogramTag: string;
    blueprintRole: string;
    blueprintSummary: string;
    headline: {
      lead: string;
      italic: string;
      trail: string;
    };
    body: string;
    enjoyBuilding: {
      label: string;
      text: string;
    };
    exploringNext: {
      label: string;
      text: string;
    };
    offScreenContext: string;
  };
  notes: {
    sectionHeading: string;
    tag: string;
    readTime: string;
    title: string;
    url: string;
  };
  contact: {
    sectionHeading: string;
    headline: {
      lead: string;
      italic: string;
      trail: string;
    };
    subhead: string;
  };
}

export const portfolioData: PortfolioData = {
  personal: {
    name: "Gajjela Vasudev",
    firstName: "Gajjela",
    lastName: "Vasudev",
    descriptor: "Software Engineer & Developer",
    role: "Software Engineer & Developer",
    year: "2025",
    heroHeadline: {
      lead: "Building ideas into",
      italic: "real-world",
      trail: "software."
    },
    heroBio: "I'm a Computer Science student and software engineer who enjoys building reliable backend systems, modular web applications, and turning ideas into useful real-world software.",
    footerBio: "Computer Science student and software engineer focused on building resilient backend systems, thoughtful web applications, and clean software.",
    email: "gajjelavasudev@gmail.com",
    githubUrl: "https://github.com/GajjelaVasudev",
    linkedinUrl: "https://linkedin.com/in/gajjelavasudev",
    resumeUrl: "#resume"
  },

  navigation: [
    { label: "ABOUT", href: "#about" },
    { label: "SELECTED WORK", href: "#work" },
    { label: "NOTES", href: "#notes" },
    { label: "CONTACT", href: "#contact" }
  ],

  featuredProject: {
    id: "01",
    tag: "SELECTED WORK",
    category: "FEATURED ARCHITECTURE",
    title: "Online Job Recruitment System",
    tech: ["Java", "Spring Boot", "Spring Cloud", "Eureka", "Docker"],
    description: "A microservices-based recruitment application designed for decoupled service resilience, high-throughput applicant tracking, and automated candidate evaluation pipelines.",
    bullets: [
      "↳ Service Discovery & Dynamic Routing (Netflix Eureka)",
      "↳ Containerized distributed deployment orchestration",
      "↳ Asynchronous candidate ingestion pipelines"
    ],
    metricLabel: "TOPOLOGY NOMINAL",
    actionText: "INSPECT ARCHITECTURE & CODE →",
    actionUrl: "https://github.com/GajjelaVasudev/online-job-recruitment",
    imageAlt: "Distributed Service Topology and Talent Pipeline Dashboard",
    isFeatured: true
  },

  gridProjects: [
    {
      id: "02",
      tag: "PROJECT 02",
      category: "FULL-STACK APPLICATION",
      title: "Scalable E-commerce Platform",
      tech: ["React", "Node.js", "Express", "MongoDB"],
      description: "End-to-end modular digital storefront engineered for transactional consistency, instant catalog search, and checkout state persistence.",
      metricLabel: "PERF: 98 LIGHTHOUSE",
      actionText: "VIEW PROJECT →",
      actionUrl: "https://github.com/GajjelaVasudev",
      imageAlt: "Clean modern e-commerce storefront displayed on a laptop display",
      isFeatured: false
    },
    {
      id: "03",
      tag: "PROJECT 03",
      category: "CLINICAL WORKFLOW",
      title: "Maternal Healthcare Platform",
      tech: ["Node.js", "MongoDB", "Role-Based Access Control"],
      description: "Role-based clinical coordination platform supporting longitudinal patient care pathways, prenatal milestones, and structured clinical notes with strict audit logging.",
      metricLabel: "SECURITY: RBAC ENFORCED",
      actionText: "VIEW PROJECT →",
      actionUrl: "https://github.com/GajjelaVasudev",
      imageAlt: "NurtureConnect patient timeline clinical workflow interface",
      isFeatured: false
    }
  ],

  about: {
    sectionHeading: "ABOUT ME",
    monogramTag: "GAJJELA VASUDEV // SOFTWARE & SYSTEMS",
    blueprintRole: "SOFTWARE & SYSTEMS",
    blueprintSummary: "Computer Science student. Focused on resilient microservices, modular backends, and clean software architecture.",
    headline: {
      lead: "I write software with an emphasis on",
      italic: "clarity",
      trail: "over accidental complexity."
    },
    body: "Rather than chasing every transient framework, I gravitate toward fundamentals: how data moves across networks, how state persists reliably, and how clean interfaces empower real people to execute critical tasks with confidence.",
    enjoyBuilding: {
      label: "WHAT I ENJOY BUILDING",
      text: "Backend distributed workflows, decoupled microservice topologies, reliable API contracts, and thoughtfully structured web applications."
    },
    exploringNext: {
      label: "WHAT I'M EXPLORING NEXT",
      text: "High-concurrency messaging brokers, distributed consensus algorithms, query planners, and low-level systems programming in Rust."
    },
    offScreenContext: "OFF-SCREEN CONTEXT: Reading distributed systems whitepapers, exploring Swiss typographic design, and long-distance road cycling."
  },

  notes: {
    sectionHeading: "NOTES & IDEAS",
    tag: "ASYNC PATTERNS",
    readTime: "8 MIN READ →",
    title: "Mental Models for Asynchronous State in Modern Web Apps",
    url: "#notes"
  },

  contact: {
    sectionHeading: "LET'S TALK",
    headline: {
      lead: "Have an idea? Let's build something",
      italic: "meaningful",
      trail: "."
    },
    subhead: "Always open to software engineering internships, collaborative open-source work, or conversations about distributed systems and deliberate interface design."
  }
};
