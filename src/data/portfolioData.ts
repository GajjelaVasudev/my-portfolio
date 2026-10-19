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

export type HackathonStatus = 'Shortlisted' | 'Finalist' | 'Participant' | 'Winner';

export interface HackathonItem {
  id: string;
  name: string;
  status: HackathonStatus;
  role: string;
  date: string;
  projectTitle?: string;
  description: string;
  technicalContributions: string[];
  teamworkHighlight?: string;
  technologies: string[];
  actionText?: string;
  actionUrl?: string;
}

export interface WorkExperienceItem {
  id: string;
  organization: string;
  role: string;
  period: string;
  location?: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  actionText?: string;
  actionUrl?: string;
}

export interface ExperienceSectionData {
  sectionHeading: string;
  kicker: string;
  supportingLine: string;
  hackathons: {
    categoryNumber: string;
    categoryTitle: string;
    items: HackathonItem[];
  };
  professional: {
    categoryNumber: string;
    categoryTitle: string;
    items: WorkExperienceItem[];
  };
}

export interface SkillCategory {
  id: string;
  categoryNumber: string;
  name: string;
  skills: string[];
  isAnchor?: boolean;
}

export interface TechnicalStackData {
  sectionHeading: string;
  kicker: string;
  supportingLine: string;
  categories: SkillCategory[];
}

export interface CredentialItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  actionText?: string;
}

export interface CredentialsData {
  sectionHeading: string;
  kicker: string;
  supportingLine: string;
  items: CredentialItem[];
}

export interface CodingProfileItem {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  badge?: string;
  actionText?: string;
}

export interface CodingProfilesData {
  sectionHeading: string;
  kicker: string;
  supportingLine: string;
  items: CodingProfileItem[];
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
  experience: ExperienceSectionData;
  technicalStack: TechnicalStackData;
  credentials: CredentialsData;
  codingProfiles: CodingProfilesData;
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
    { label: "EXPERIENCE", href: "#experience" },
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

  experience: {
    sectionHeading: "EXPERIENCE",
    kicker: "TRAJECTORY & PRACTICE",
    supportingLine: "Challenges I've taken on and experience I've gained along the way.",
    hackathons: {
      categoryNumber: "01",
      categoryTitle: "HACKATHONS",
      items: [
        {
          id: "hack-01",
          name: "Smart India Hackathon (SIH)",
          status: "Shortlisted",
          role: "Backend & Systems Lead",
          date: "2024",
          projectTitle: "Automated Workflow Ingestion Engine",
          description: "Proposed and architected a decentralized verification and data processing pipeline addressing high-volume institutional submission workflows.",
          technicalContributions: [
            "Architected asynchronous ingestion microservice with retry queues and validation boundaries",
            "Designed structured REST API contracts and role-based access schemas for multi-tier evaluators"
          ],
          teamworkHighlight: "Led a cross-functional team of 4 engineers, coordinating architecture milestones and Git pull request reviews.",
          technologies: ["Node.js", "Express", "MongoDB", "Docker", "REST APIs"],
          actionText: "Repository ↗",
          actionUrl: "https://github.com/GajjelaVasudev"
        },
        {
          id: "hack-02",
          name: "National Level Collegiate Hackathon",
          status: "Finalist",
          role: "Full-Stack Developer",
          date: "2023",
          projectTitle: "Decentralized Care Coordination Interface",
          description: "Engineered a rapid-response clinical coordination prototype supporting real-time patient alerts under a competitive 36-hour sprint.",
          technicalContributions: [
            "Implemented persistent state synchronisation and low-latency clinical alert triggers",
            "Built a resilient, high-contrast user interface optimized for rapid response under network volatility"
          ],
          teamworkHighlight: "Pair-programmed critical state synchronization logic and led end-to-end integration testing.",
          technologies: ["React", "TypeScript", "Node.js", "WebSockets"],
          actionText: "Demo & Code ↗",
          actionUrl: "https://github.com/GajjelaVasudev"
        }
      ]
    },
    professional: {
      categoryNumber: "02",
      categoryTitle: "EXPERIENCE",
      items: [
        {
          id: "exp-01",
          organization: "Software Engineering Intern",
          role: "Backend Engineering Intern",
          period: "2024 — Present",
          location: "Hybrid",
          description: "Working on core backend services, API contract optimization, and reliable data persistence layers for operational systems.",
          responsibilities: [
            "Engineered modular REST endpoints with strict validation boundaries and error isolation",
            "Analyzed database query patterns and applied targeted indexing to enhance throughput",
            "Contributed to automated unit testing suites and continuous integration review workflows"
          ],
          technologies: ["Java", "Spring Boot", "PostgreSQL", "Docker", "Git"],
          actionText: "Organization Profile ↗",
          actionUrl: "https://github.com/GajjelaVasudev"
        },
        {
          id: "exp-02",
          organization: "Academic & Systems Research Projects",
          role: "Systems Contributor & Student Developer",
          period: "2023 — 2024",
          location: "On-Campus",
          description: "Explored distributed microservice architectures, fault-tolerant service discovery, and modular application design through targeted laboratory projects.",
          responsibilities: [
            "Designed and benchmarked dynamic service routing topologies using Netflix Eureka and Spring Cloud",
            "Documented architectural trade-offs, decoupling strategies, and container deployment best practices"
          ],
          technologies: ["Spring Cloud", "Eureka", "Docker", "Microservices"],
          actionText: "View GitHub ↗",
          actionUrl: "https://github.com/GajjelaVasudev"
        }
      ]
    }
  },

  technicalStack: {
    sectionHeading: "CORE TECHNICAL STACK",
    kicker: "CAPABILITIES & FOUNDATIONS",
    supportingLine: "Core technologies, languages, and systems I work with to build resilient software.",
    categories: [
      {
        id: "languages",
        categoryNumber: "01",
        name: "Programming Languages",
        skills: ["Java", "JavaScript", "TypeScript", "Python", "C"],
        isAnchor: true
      },
      {
        id: "frontend",
        categoryNumber: "02",
        name: "Frontend Development",
        skills: ["React", "HTML5", "CSS3", "Responsive Design"]
      },
      {
        id: "backend",
        categoryNumber: "03",
        name: "Backend Development",
        skills: ["Node.js", "Express", "Spring Boot", "REST APIs", "Microservices"],
        isAnchor: true
      },
      {
        id: "databases",
        categoryNumber: "04",
        name: "Databases & Caching",
        skills: ["MongoDB", "PostgreSQL", "Redis"]
      },
      {
        id: "devops",
        categoryNumber: "05",
        name: "DevOps & Developer Tools",
        skills: ["Git", "GitHub", "Docker", "Postman", "Linux"]
      },
      {
        id: "core-cs",
        categoryNumber: "06",
        name: "Core Computer Science",
        skills: [
          "Data Structures & Algorithms",
          "Object-Oriented Programming (OOP)",
          "Database Management Systems (DBMS)",
          "Operating Systems",
          "Computer Networks"
        ]
      }
    ]
  },

  credentials: {
    sectionHeading: "VERIFIED CREDENTIALS",
    kicker: "CERTIFICATIONS & ACCREDITATIONS",
    supportingLine: "Technical certifications, verified technical coursework, and academic credentials.",
    items: [
      {
        id: "cred-01",
        name: "Java Programming & Object-Oriented Design",
        issuer: "Oracle / Coursera Verified",
        issueDate: "2024",
        credentialId: "JAVA-DS-2024-VG",
        verificationUrl: "https://github.com/GajjelaVasudev",
        actionText: "View Credential ↗"
      },
      {
        id: "cred-02",
        name: "Full-Stack Web Development & Microservices",
        issuer: "Meta / Coursera Verified",
        issueDate: "2023",
        credentialId: "FS-ARCH-9948",
        verificationUrl: "https://github.com/GajjelaVasudev",
        actionText: "View Credential ↗"
      },
      {
        id: "cred-03",
        name: "Database Systems & SQL Optimization",
        issuer: "Stanford Online / EdX Verified",
        issueDate: "2023",
        credentialId: "DB-SQL-4122",
        verificationUrl: "https://github.com/GajjelaVasudev",
        actionText: "View Credential ↗"
      }
    ]
  },

  codingProfiles: {
    sectionHeading: "CODING PROFILES",
    kicker: "PROBLEM SOLVING & PRACTICE",
    supportingLine: "Competitive programming and algorithmic problem-solving profiles across major platforms.",
    items: [
      {
        id: "leetcode",
        platform: "LeetCode",
        username: "Vasudev_gajjela",
        profileUrl: "https://leetcode.com/u/Vasudev_gajjela/",
        badge: "ALGORITHMS",
        actionText: "View Profile"
      },
      {
        id: "codechef",
        platform: "CodeChef",
        username: "vkl2400031804",
        profileUrl: "https://www.codechef.com/users/vkl2400031804",
        badge: "COMPETITIVE",
        actionText: "View Profile"
      },
      {
        id: "codeforces",
        platform: "Codeforces",
        username: "Gajjela_Vasudev",
        profileUrl: "https://codeforces.com/profile/Gajjela_Vasudev",
        badge: "CONTESTS",
        actionText: "View Profile"
      },
      {
        id: "hackerrank",
        platform: "HackerRank",
        username: "h2400031804",
        profileUrl: "https://www.hackerrank.com/profile/h2400031804",
        badge: "CHALLENGES",
        actionText: "View Profile"
      }
    ]
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
