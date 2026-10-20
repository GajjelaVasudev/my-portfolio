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
  githubUrl?: string;
  liveUrl?: string;
  isPrivate?: boolean;
  imageAlt: string;
  isFeatured?: boolean;
  placeholderInitials?: string;
}

export type HackathonStatus = 'Shortlisted' | 'Finalist' | 'Participant' | 'Winner' | 'Runner-up';

export interface HackathonItem {
  id: string;
  name: string;
  status: HackathonStatus;
  achievement?: string;
  event?: string;
  team?: string;
  role: string;
  date: string;
  projectTitle?: string;
  description: string;
  technicalContributions: string[];
  teamworkHighlight?: string;
  technologies: string[];
  actionText?: string;
  actionUrl?: string;
  isFeatured?: boolean;
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
  category: string;
  level?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl: string;
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

export interface NoteItem {
  id: string;
  number: string;
  category: string;
  readTime: string;
  title: string;
  preview: string;
  paragraphs: string[];
  listHeader?: string;
  listItems?: string[];
  conclusion?: string;
  tags: string[];
}

export interface NotesSectionData {
  sectionHeading: string;
  kicker: string;
  supportingLine: string;
  items: NoteItem[];
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
    headline: string;
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
  notes: NotesSectionData;
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
    year: "2026",
    heroHeadline: {
      lead: "Building ideas into",
      italic: "real-world",
      trail: "software."
    },
    heroBio: "Computer Science student and aspiring software engineer building reliable backend services, full-stack applications, and practical AI-powered tools.",
    footerBio: "Computer Science student and aspiring software engineer focused on building reliable backend systems, thoughtful web applications, and practical software solutions.",
    email: "vgajjella@gmail.com",
    githubUrl: "https://github.com/GajjelaVasudev",
    linkedinUrl: "https://linkedin.com/in/gajjelavasudev",
    resumeUrl: "/resume.pdf"
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
    category: "Learning Management System",
    title: "NxtGen LMS",
    tech: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "Supabase"],
    description: "A learning management platform that organizes courses, learning materials, assessments, and student progress through role-based workflows.",
    bullets: [
      "↳ Role-based workflows for Admins, Instructors & Students",
      "↳ Course management, learning resources & assignment submission",
      "↳ Dynamic assessment scoring and longitudinal student progress tracking"
    ],
    metricLabel: "VERCEL DEPLOYMENT",
    actionText: "LIVE DEMO →",
    actionUrl: "https://nxt-gen-lms.vercel.app",
    githubUrl: "https://github.com/GajjelaVasudev/NxtGen-LMS",
    liveUrl: "https://nxt-gen-lms.vercel.app",
    imageAlt: "NxtGen LMS landing page and learning management portal interface",
    isFeatured: true
  },

  gridProjects: [
    {
      id: "02",
      tag: "PROJECT 02",
      category: "Full-Stack E-commerce",
      title: "Scalable E-commerce Platform",
      tech: ["Node.js", "Express", "MongoDB", "Redis", "JWT"],
      description: "A full-stack e-commerce platform in development, focused on building the backend foundations for product management, cart operations, authentication, and order workflows.",
      metricLabel: "STATUS: BACKEND PHASE",
      actionText: "GITHUB (PRIVATE) →",
      actionUrl: "https://github.com/GajjelaVasudev/scalable-ecommerce-platform",
      githubUrl: "https://github.com/GajjelaVasudev/scalable-ecommerce-platform",
      isPrivate: true,
      imageAlt: "Scalable E-commerce Platform minimal placeholder in active development",
      placeholderInitials: "SE",
      isFeatured: false
    },
    {
      id: "03",
      tag: "PROJECT 03",
      category: "Web Application",
      title: "Webinar Management System",
      tech: ["Django", "Django REST Framework", "React", "TypeScript", "PostgreSQL", "Tailwind CSS"],
      description: "A full-stack webinar and event management platform featuring role-based access control, automated attendee registrations, session scheduling, and certificate verification workflows.",
      metricLabel: "STATUS: COMPLETED",
      actionText: "GITHUB REPO →",
      actionUrl: "https://github.com/GajjelaVasudev/Webinar-Management-System",
      githubUrl: "https://github.com/GajjelaVasudev/Webinar-Management-System",
      imageAlt: "Webinar Management System event dashboard and attendee registration platform",
      isFeatured: false
    }
  ],

  about: {
    sectionHeading: "ABOUT ME",
    monogramTag: "GAJJELA VASUDEV // SOFTWARE & SYSTEMS",
    blueprintRole: "SOFTWARE ENGINEERING & DEVELOPMENT",
    blueprintSummary: "Computer Science student building thoughtful digital experiences through full-stack development, software architecture, and practical AI.",
    headline: "I build software that balances *functionality*, *clarity*, and *real-world impact*.",
    body: "I enjoy turning ideas into working applications from intuitive user interfaces and responsive web experiences to reliable APIs, well-structured databases, and intelligent features. My approach is rooted in understanding problems, choosing the right tools, and writing software that is maintainable, useful, and built with purpose.",
    enjoyBuilding: {
      label: "WHAT I ENJOY BUILDING",
      text: "Full-stack web applications, interactive user experiences, backend services, database-driven systems, and AI-powered tools that solve practical problems."
    },
    exploringNext: {
      label: "WHAT I'M EXPLORING NEXT",
      text: "Stronger problem-solving and data structures, scalable software architecture, modern frontend engineering, distributed systems, and generative AI applications."
    },
    offScreenContext: "OFF-SCREEN CONTEXT: Exploring thoughtful digital design, reading about software engineering, experimenting with new technologies, and long-distance road cycling."
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
          id: "hack-cfg",
          name: "JPMorgan Chase Code for Good 2026",
          status: "Runner-up",
          achievement: "Runner-up — Problem Statement 2, Dharmalife",
          event: "JPMorgan Chase Code for Good 2026",
          team: "Team 28",
          role: "Full-Stack Developer",
          date: "SEP 2026",
          projectTitle: "DLONE (DLE Sarthi)",
          description: "Built DLONE (DLE Sarthi), an explainable digital assistance platform designed around the real workflow needs of rural women entrepreneurs (Direct-to-Consumer Livelihood Entrepreneurs).",
          technicalContributions: [
            "Hyperlocal recommendations with rationale and grounded, hallucination-resistant pitch generation.",
            "Automated essentials reordering reminders and defect-resolution workflows to protect commissions.",
            "Multilingual interface (English, Odia, Hindi, Telugu) with row-level security and PII sanitization."
          ],
          teamworkHighlight: "Team 28 • Problem Statement 2 (Dharmalife)",
          technologies: ["Full-Stack Web", "Grounded AI", "Row-Level Security", "Multilingual UI"],
          actionText: "View LinkedIn post ↗",
          actionUrl: "https://lnkd.in/p/dBNVE34r",
          isFeatured: true
        },
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
        }
      ]
    },
    professional: {
      categoryNumber: "02",
      categoryTitle: "INTERNSHIPS",
      items: []
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
        name: "Cambridge Linguaskill English",
        category: "English Proficiency",
        level: "B2",
        verificationUrl: "https://drive.google.com/file/d/1oB1gRHQOWxI3JFNOaPYoH3gLZAYQpTXD/view?usp=sharing",
        actionText: "View Credential"
      },
      {
        id: "cred-02",
        name: "GitHub Copilot Certification",
        category: "Developer Tools / AI-Assisted Development",
        verificationUrl: "https://learn.microsoft.com/api/credentials/share/en-us/VasuGajjela-3547/D4C9EFC6B33D353A?sharingId=83333CF69BBB7554",
        actionText: "View Credential"
      },
      {
        id: "cred-03",
        name: "AWS Certified Cloud Practitioner",
        category: "Cloud Computing",
        verificationUrl: "https://drive.google.com/file/d/14dmuVTVGn08rc6feKpH3qxN74XwJylIR/view?usp=sharing",
        actionText: "View Credential"
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
    kicker: "PRACTICE & REFLECTION",
    supportingLine: "Short engineering notes, architectural trade-offs, and practical lessons from building software.",
    items: [
      {
        id: "note-1",
        number: "01",
        category: "Product Thinking",
        readTime: "3 MIN READ",
        title: "Build for the Real Workflow",
        preview: "The best solution starts with understanding how people already work.",
        paragraphs: [
          "A useful application should fit the real workflow of the people using it. Before choosing a framework or adding an AI feature, understand the user's problem, existing tools, and everyday constraints."
        ],
        listHeader: "When building software, I want to ask three questions first:",
        listItems: [
          "What problem are we actually solving?",
          "What already works that we should preserve?",
          "How will we know the solution is genuinely useful?"
        ],
        conclusion: "Good engineering is not always about adding more features. Sometimes it is about removing unnecessary steps and making an existing process easier to complete.",
        tags: ["Product Thinking", "User-Centered Design"]
      },
      {
        id: "note-2",
        number: "02",
        category: "Backend Systems",
        readTime: "4 MIN READ",
        title: "Reliable Backends Are Built in the Details",
        preview: "An API working once does not mean it is ready for real users.",
        paragraphs: [
          "A backend is more than a collection of endpoints. Reliable systems depend on validation, clear error handling, authorization, sensible database design, and predictable behavior when something goes wrong."
        ],
        listHeader: "While building APIs, I try to think beyond the successful request:",
        listItems: [
          "What happens when the input is invalid?",
          "Can one user access another user's data?",
          "What happens when a database operation fails?",
          "Can the important behavior be tested automatically?"
        ],
        conclusion: "These details may not stand out in a demo, but they are essential for building software that people can trust.",
        tags: ["Backend Engineering", "API Design", "Testing"]
      },
      {
        id: "note-3",
        number: "03",
        category: "Continuous Learning",
        readTime: "4 MIN READ",
        title: "Learn Concepts by Building",
        preview: "Understanding a concept becomes easier when you have to make it work.",
        paragraphs: [
          "Documentation and tutorials are useful starting points, but implementing a concept exposes the questions that reading alone may not answer.",
          "When learning a new technology, I prefer a small working implementation first. I then explore what happens when the system encounters invalid inputs, unexpected failures, or increased complexity."
        ],
        listHeader: "For me, a productive learning cycle is simple:",
        listItems: [
          "Understand the core idea.",
          "Build a small example.",
          "Test different scenarios.",
          "Identify what breaks and why.",
          "Improve the implementation."
        ],
        conclusion: "The goal is not just to finish a project. It is to understand the decisions behind it and know when to apply the same concepts elsewhere.",
        tags: ["Continuous Learning", "Problem Solving", "Software Development"]
      }
    ]
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
