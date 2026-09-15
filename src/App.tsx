import { useState, useEffect, useRef } from "react";
import vectorRunImg from "./imports/vectorrun.jpg";
import profilePhoto from "./imports/profile.png";
import mazePuzzleImg from "./imports/image.png";
import skyCityImg from "./imports/skycity.png";
import aiCareerCoachImg from "./imports/aicoach.png";
import healthcareImg from "./imports/healthcars.png";
import fashionImg from "./imports/fashion.png";

// ── Animation hooks ───────────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setCount(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

function useTyping(text: string, speed = 80, delay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { displayed, done };
}

// Particle canvas
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 80;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.6 ? "#00d4ff" : "#7c3aed",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

// Reveal wrapper
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}) {
  const { ref, visible } = useReveal();
  const translate =
    direction === "up" ? "translateY(32px)" :
    direction === "left" ? "translateX(-32px)" :
    direction === "right" ? "translateX(32px)" : "none";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0)" : translate,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Home", "About", "Skills", "Projects", "Experience", "Education", "Contact"];

const SKILLS = {
  "Game Development": {
    icon: "🎮",
    color: "#00d4ff",
    items: ["Unity Game Engine", "C# Programming", "Game Mechanics Development", "UI Implementation — Unity UI", "Physics Handling — Unity Physics", "Debugging & Problem Solving"],
  },
  "Game Dev Skills": {
    icon: "🕹️",
    color: "#7c3aed",
    items: ["Player Movement Implementation", "Level Design — Basic", "Game Testing & Debugging", "Prototype Development"],
  },
  "AI / ML": {
    icon: "🧠",
    color: "#a855f7",
    items: ["Python", "Machine Learning", "Deep Learning", "RAG", "Computer Vision"],
  },
  "Tools": {
    icon: "🔧",
    color: "#f59e0b",
    items: ["Git", "GitHub", "Visual Studio"],
  },
};

const PROJECTS = [
  {
    id: "01",
    title: "2D Vector Run",
    subtitle: "2D Vector Run Game — Prototype",
    desc: "A 2D runner game using Unity with responsive character movement, smooth controls, and two playable levels.",
    tech: ["Unity", "C#"],
    status: "Completed",
    statusColor: "#10b981",
    bg: "from-emerald-900/40 to-cyan-900/30",
    imgUrl: vectorRunImg,
    github: "https://github.com/kharishk2006-debug/vector-run-prototype",
  },
  {
    id: "02",
    title: "2D Maze Puzzle",
    subtitle: "2D Maze Puzzle Game — Prototype",
    desc: "A 2D maze game with player movement and collision systems, focusing on interactive gameplay mechanics.",
    tech: ["Unity", "C#"],
    status: "Completed",
    statusColor: "#10b981",
    bg: "from-blue-900/40 to-indigo-900/30",
    imgUrl: mazePuzzleImg,
    github: "https://github.com/harish-k/2d-maze-puzzle",
  },
  {
    id: "03",
    title: "SKY CITY",
    subtitle: "3D Futuristic Endless Runner — Coming Soon",
    desc: "An upcoming 3D endless-runner set in a high-tech cyber city where a robot navigates futuristic environments.",
    tech: ["Unity", "C#"],
    status: "Coming Soon",
    statusColor: "#f59e0b",
    bg: "from-violet-900/40 to-purple-900/30",
    imgUrl: skyCityImg,
  },
  {
    id: "04",
    title: "AI Career Coach",
    subtitle: "Resume & Interview Assistant",
    desc: "AI-powered career platform for resume analysis, ATS evaluation, cover letters, and mock interviews.",
    tech: ["Python", "Streamlit", "Groq", "GenAI"],
    status: "Completed",
    statusColor: "#10b981",
    bg: "from-cyan-900/40 to-blue-900/30",
    imgUrl: aiCareerCoachImg,
    github: "https://github.com/kharishk2006-debug/AI-Career-Coach-Resume-Analyze",
  },
  {
    id: "05",
    title: "Healthcare Analytics",
    subtitle: "ML Mini Project",
    desc: "Healthcare analytics solution predicting hospital stay, readmission, and patient risk using XGBoost & K-Means.",
    tech: ["Python", "ML", "XGBoost"],
    status: "Completed",
    statusColor: "#10b981",
    bg: "from-teal-900/40 to-emerald-900/30",
    imgUrl: healthcareImg,
  },
  {
    id: "06",
    title: "Fashion Classifier",
    subtitle: "Deep Learning Mini Project",
    desc: "CNN model using TensorFlow/Keras to classify Fashion-MNIST grayscale images with batch normalization.",
    tech: ["Python", "TensorFlow", "Keras"],
    status: "Completed",
    statusColor: "#10b981",
    bg: "from-pink-900/40 to-rose-900/30",
    imgUrl: fashionImg,
  },
];

const EXPERIENCES = [
  {
    role: "Junior Game Developer",
    company: "Foxziod Game Studios",
    type: "Part Time",
    typeColor: "#00d4ff",
    desc: "Worked on game development tasks using Unity Engine and contributed to implementing and refining gameplay features. Used C# to improve game functionality and prototype development.",
    tags: ["Unity", "C#", "Gameplay Systems", "Debugging"],
    icon: "🎮",
  },
  {
    role: "Game Developer Intern",
    company: "Foxziod Game Studios",
    type: "Internship",
    typeColor: "#7c3aed",
    desc: "Gained hands-on experience in Unity game development and C# scripting. Implemented character movement and developed a 2D Maze Puzzle Game prototype.",
    tags: ["Unity", "C#", "Character Movement", "Level Design"],
    icon: "🕹️",
  },
  {
    role: "AI Developer Intern",
    company: "CodeWork.ai",
    type: "Internship (1 Month)",
    typeColor: "#a855f7",
    desc: "Developed an AI-powered Career Coach combining resume analysis, ATS evaluation, cover letter generation, and interactive mock interviews using Python and Generative AI.",
    tags: ["Python", "GenAI", "LLMs", "Prompt Engineering"],
    icon: "🤖",
  },
];

const CERTIFICATIONS = [
  { title: "Python Programming Certification", icon: "🐍", color: "#3b82f6" },
  { title: "C / C++ Programming Certification", icon: "⚙️", color: "#00d4ff" },
  { title: "Diploma in Computer Applications — DCA", icon: "💻", color: "#7c3aed" },
  { title: "Game Developer Internship", subtitle: "Foxziod Game Studios", icon: "🎮", color: "#10b981" },
  { title: "AI Developer Internship", subtitle: "CodeWork.ai", icon: "🤖", color: "#a855f7" },
];

const EXPLORING = [
  { title: "Advanced Unity", icon: "⚡", desc: "Advanced systems, gameplay mechanics, optimization, and complex game development workflows.", color: "#00d4ff" },
  { title: "3D Game Development", icon: "🎯", desc: "3D environments, character systems, level design, and building immersive gameplay experiences.", color: "#7c3aed" },
  { title: "AI Agents", icon: "🤖", desc: "Building intelligent AI agents and integrating AI capabilities into practical applications.", color: "#a855f7" },
];

// ── Components ────────────────────────────────────────────────────────────────

function NavBar({ active, onNav }: { active: string; onNav: (s: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(8, 12, 26, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,212,255,0.1)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={() => onNav("Home")}
          className="flex items-center gap-2 group"
        >
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "Orbitron, sans-serif", color: "#00d4ff" }}
          >
            {"</>"}
          </span>
          <span
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            HARISH{" "}
            <span style={{ color: "#00d4ff" }}>K.</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => onNav(link)}
              className="px-3 py-1.5 text-sm font-medium rounded transition-all duration-200"
              style={{
                fontFamily: "Rajdhani, sans-serif",
                letterSpacing: "0.05em",
                color: active === link ? "#00d4ff" : "#94a3b8",
                borderBottom: active === link ? "2px solid #00d4ff" : "2px solid transparent",
              }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Social Icons */}
        <div className="hidden md:flex items-center gap-3">
          {[
            { label: "GitHub", icon: GitHubIcon },
            { label: "LinkedIn", icon: LinkedInIcon },
            { label: "Email", icon: EmailIcon },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="w-8 h-8 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ color: "#64748b", border: "1px solid rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#00d4ff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              aria-label={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-400 hover:text-cyan-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span style={{ fontSize: 24 }}>{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ background: "rgba(8,12,26,0.98)", borderColor: "rgba(0,212,255,0.15)" }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => { onNav(link); setMenuOpen(false); }}
              className="block px-6 py-3 text-sm font-medium border-b"
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: active === link ? "#00d4ff" : "#94a3b8",
                borderColor: "rgba(0,212,255,0.05)",
              }}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// SVG Icons
function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function EmailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function SectionHeader({ label, title, accent }: { label: string; title: string; accent?: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-xl">{accent}</span>
      <div>
        <h2
          className="text-2xl font-bold text-white uppercase tracking-wider"
          style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.1em" }}
        >
          {title}
        </h2>
        <div className="h-0.5 mt-1 w-16 rounded" style={{ background: "linear-gradient(90deg, #00d4ff, transparent)" }} />
      </div>
    </div>
  );
}

function Badge({ label, color = "#00d4ff" }: { label: string; color?: string }) {
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}44`,
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: `${color}20`,
        color,
        border: `1px solid ${color}50`,
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full pulse-glow"
        style={{ background: color }}
      />
      {status}
    </span>
  );
}

// ── Global Animated Background ────────────────────────────────────────────────

function GlobalAnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = document.body.scrollHeight;
    };
    resize();

    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(document.body);
    window.addEventListener("resize", resize);

    // ── Grid nodes ─────────────────────────────────────────────────────────────
    const COLS = 24, ROWS = 18;
    type Node = { x: number; y: number; pulse: number; speed: number; active: boolean };
    const nodes: Node[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        nodes.push({
          x: (c / (COLS - 1)) * 1,
          y: (r / (ROWS - 1)) * 1,
          pulse: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.006,
          active: Math.random() > 0.65,
        });
      }
    }

    // ── Matrix columns ─────────────────────────────────────────────────────────
    const MATRIX_COLS = Math.floor(window.innerWidth / 20);
    type Col = { x: number; y: number; speed: number; len: number; opacity: number; chars: string[] };
    const matrixCols: Col[] = Array.from({ length: MATRIX_COLS }, (_, i) => ({
      x: i * 20 + 10,
      y: Math.random() * -800,
      speed: 0.4 + Math.random() * 0.8,
      len: 6 + Math.floor(Math.random() * 12),
      opacity: 0.06 + Math.random() * 0.08,
      chars: Array.from({ length: 20 }, () => "01</>{}[]#@$%^&*!?░▒▓█"[Math.floor(Math.random() * 22)]),
    }));

    // ── Aurora waves ───────────────────────────────────────────────────────────
    type Wave = { phase: number; speed: number; amp: number; freq: number; color: string; yBase: number };
    const waves: Wave[] = [
      { phase: 0,    speed: 0.003, amp: 120, freq: 0.0015, color: "rgba(0,212,255,", yBase: 0.15, },
      { phase: 2.1,  speed: 0.002, amp: 100, freq: 0.0012, color: "rgba(124,58,237,", yBase: 0.45, },
      { phase: 4.2,  speed: 0.0025,amp: 90,  freq: 0.0018, color: "rgba(168,85,247,", yBase: 0.75, },
    ];

    let t = 0;

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      // ── Aurora waves ────────────────────────────────────────────────────────
      waves.forEach((w) => {
        w.phase += w.speed;
        const yCenter = w.yBase * H;
        const grad = ctx.createLinearGradient(0, yCenter - w.amp, 0, yCenter + w.amp);
        grad.addColorStop(0, w.color + "0)");
        grad.addColorStop(0.5, w.color + "0.035)");
        grad.addColorStop(1, w.color + "0)");

        ctx.beginPath();
        ctx.moveTo(0, yCenter);
        for (let x = 0; x <= W; x += 4) {
          const y = yCenter + Math.sin(x * w.freq + w.phase) * w.amp
                            + Math.sin(x * w.freq * 1.7 + w.phase * 0.6) * (w.amp * 0.4);
          if (x === 0) ctx.moveTo(x, y - w.amp * 1.5);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H + 200);
        ctx.lineTo(0, H + 200);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // ── Grid lines ──────────────────────────────────────────────────────────
      const gCols = 32, gRows = Math.ceil(H / (W / gCols));
      const cw = W / gCols, ch = W / gCols;
      ctx.strokeStyle = "rgba(0,212,255,0.04)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= gCols; c++) {
        ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke();
      }
      for (let r = 0; r <= gRows; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke();
      }

      // ── Pulsing grid nodes ───────────────────────────────────────────────────
      nodes.forEach((n) => {
        n.pulse += n.speed;
        if (!n.active) return;
        const px = n.x * W, py = n.y * H;
        const glow = (Math.sin(n.pulse) + 1) * 0.5;
        const r = 1.5 + glow * 1.5;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${0.12 + glow * 0.25})`;
        ctx.fill();

        // Connecting lines to nearest active node
        nodes.forEach((n2) => {
          if (!n2.active || n2 === n) return;
          const dx = (n.x - n2.x) * W, dy = (n.y - n2.y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < W / 8) {
            const alpha = (1 - dist / (W / 8)) * 0.06 * glow;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(n2.x * W, n2.y * H);
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        });
      });

      // ── Matrix rain ─────────────────────────────────────────────────────────
      ctx.font = "11px 'JetBrains Mono', monospace";
      matrixCols.forEach((col) => {
        col.y += col.speed;
        if (col.y > H + col.len * 14) {
          col.y = Math.random() * -400;
          col.speed = 0.4 + Math.random() * 0.8;
        }
        // Shuffle chars occasionally
        if (t % 20 === 0) {
          const idx = Math.floor(Math.random() * col.chars.length);
          col.chars[idx] = "01</>{}[]#@$%^&*!?░▒▓"[Math.floor(Math.random() * 21)];
        }
        col.chars.forEach((ch, i) => {
          const yPos = col.y + i * 14;
          if (yPos < 0 || yPos > H) return;
          const isHead = i === col.len - 1;
          ctx.fillStyle = isHead
            ? `rgba(180,255,255,${col.opacity * 1.8})`
            : `rgba(0,212,255,${col.opacity * (1 - i / col.len)})`;
          ctx.fillText(ch, col.x, yPos);
        });
      });

      // ── Floating hex accents ────────────────────────────────────────────────
      const hexTime = t * 0.002;
      [[0.12, 0.22], [0.78, 0.55], [0.5, 0.85], [0.88, 0.12], [0.35, 0.68]].forEach(([fx, fy], i) => {
        const hx = fx * W + Math.sin(hexTime + i * 1.3) * 30;
        const hy = fy * H + Math.cos(hexTime * 0.8 + i * 0.9) * 25;
        const size = 28 + Math.sin(hexTime + i) * 6;
        const alpha = 0.05 + Math.sin(hexTime * 1.2 + i) * 0.03;
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const angle = (Math.PI / 3) * s - Math.PI / 6;
          const xp = hx + size * Math.cos(angle);
          const yp = hy + size * Math.sin(angle);
          if (s === 0) ctx.moveTo(xp, yp); else ctx.lineTo(xp, yp);
        }
        ctx.closePath();
        ctx.strokeStyle = i % 2 === 0 ? `rgba(0,212,255,${alpha})` : `rgba(124,58,237,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 1, width: "100vw" }}
    />
  );
}

// ── Section Backgrounds ───────────────────────────────────────────────────────

// ── Per-section canvas hook ────────────────────────────────────────────────────
function useSectionCanvas(
  drawFn: (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(drawFn);
  drawRef.current = drawFn;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let running = true;
    let t = 0;
    let W = 0, H = 0;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = canvas.parentElement!.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pause animation when section is off-screen
    const io = new IntersectionObserver(
      ([e]) => { running = e.isIntersecting; if (running) tick(); },
      { threshold: 0.01 }
    );
    io.observe(canvas.parentElement!);

    const tick = () => {
      if (!running) return;
      t++;
      ctx.clearRect(0, 0, W, H);
      drawRef.current(ctx, W, H, t);
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      running = false;
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return canvasRef;
}

// ── About: floating glowing particles + DNA helix strands ─────────────────────
function AboutBg() {
  type P = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string };
  const particles = useRef<P[]>([]);

  const ref = useSectionCanvas((ctx, W, H, t) => {
    if (particles.current.length === 0) {
      particles.current = Array.from({ length: 55 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.45,
        color: Math.random() > 0.5 ? "#00d4ff" : "#7c3aed",
      }));
    }
    const ps = particles.current;

    // Particles
    ps.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const glow = (Math.sin(t * 0.03 + p.x * 0.01) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.8 + glow * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor((p.alpha * (0.6 + glow * 0.4)) * 255).toString(16).padStart(2, "0");
      ctx.fill();
    });

    // Connections
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(ps[i].x, ps[i].y);
          ctx.lineTo(ps[j].x, ps[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.07 * (1 - d / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // DNA double helix — right side
    const helix = { cx: W * 0.88, amp: 38, spacing: 22, speed: 0.018 };
    for (let i = 0; i < 28; i++) {
      const y = (i / 27) * H;
      const phase = (i / 27) * Math.PI * 5 + t * helix.speed;
      const x1 = helix.cx + Math.cos(phase) * helix.amp;
      const x2 = helix.cx + Math.cos(phase + Math.PI) * helix.amp;
      const alpha = 0.12 + Math.abs(Math.cos(phase)) * 0.18;
      // Strand dots
      ctx.beginPath(); ctx.arc(x1, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${alpha})`; ctx.fill();
      ctx.beginPath(); ctx.arc(x2, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,58,237,${alpha})`; ctx.fill();
      // Rungs
      if (i % 2 === 0) {
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(0,212,255,${alpha * 0.5})`; ctx.lineWidth = 0.8; ctx.stroke();
      }
    }

    // Floating hex outlines
    [[0.08, 0.15], [0.2, 0.75], [0.5, 0.35], [0.75, 0.85]].forEach(([fx, fy], i) => {
      const hx = fx * W + Math.sin(t * 0.008 + i) * 18;
      const hy = fy * H + Math.cos(t * 0.006 + i * 1.3) * 14;
      const sz = 20 + i * 6;
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const a = (Math.PI / 3) * s;
        s === 0 ? ctx.moveTo(hx + sz * Math.cos(a), hy + sz * Math.sin(a))
                : ctx.lineTo(hx + sz * Math.cos(a), hy + sz * Math.sin(a));
      }
      ctx.closePath();
      ctx.strokeStyle = i % 2 === 0 ? `rgba(0,212,255,0.07)` : `rgba(124,58,237,0.07)`;
      ctx.lineWidth = 0.8; ctx.stroke();
    });
  });

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.9 }} />;
}

// ── Skills: circuit board with travelling electrons ────────────────────────────
function SkillsBg() {
  type Electron = { pathIdx: number; progress: number; speed: number; color: string };
  const electrons = useRef<Electron[]>([]);
  const paths = useRef<[number, number][][]>([]);

  const ref = useSectionCanvas((ctx, W, H, t) => {
    // Build paths once
    if (paths.current.length === 0) {
      const pw = W, ph = H;
      paths.current = [
        [[0.05*pw,0.2*ph],[0.25*pw,0.2*ph],[0.25*pw,0.5*ph],[0.55*pw,0.5*ph],[0.55*pw,0.15*ph],[0.85*pw,0.15*ph]],
        [[0.1*pw,0.8*ph],[0.4*pw,0.8*ph],[0.4*pw,0.55*ph],[0.7*pw,0.55*ph],[0.7*pw,0.85*ph],[0.95*pw,0.85*ph]],
        [[0.15*pw,0.4*ph],[0.35*pw,0.4*ph],[0.35*pw,0.7*ph],[0.6*pw,0.7*ph],[0.6*pw,0.35*ph],[0.9*pw,0.35*ph]],
        [[0,0.6*ph],[0.2*pw,0.6*ph],[0.2*pw,0.9*ph],[0.5*pw,0.9*ph]],
        [[0.45*pw,0],[0.45*pw,0.3*ph],[0.75*pw,0.3*ph],[0.75*pw,0.65*ph],[pw,0.65*ph]],
      ];
      electrons.current = Array.from({ length: 18 }, () => ({
        pathIdx: Math.floor(Math.random() * paths.current.length),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        color: Math.random() > 0.5 ? "#00d4ff" : "#7c3aed",
      }));
    }

    // Draw circuit traces
    paths.current.forEach((path, pi) => {
      ctx.beginPath();
      path.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.strokeStyle = pi % 2 === 0 ? "rgba(0,212,255,0.07)" : "rgba(124,58,237,0.06)";
      ctx.lineWidth = 1; ctx.stroke();

      // Junction dots
      path.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pi % 2 === 0 ? "rgba(0,212,255,0.18)" : "rgba(124,58,237,0.18)";
        ctx.fill();
      });
    });

    // Animate electrons
    electrons.current.forEach((e) => {
      e.progress += e.speed;
      if (e.progress >= 1) { e.progress = 0; e.pathIdx = Math.floor(Math.random() * paths.current.length); }
      const path = paths.current[e.pathIdx];
      const totalSeg = path.length - 1;
      const seg = Math.min(Math.floor(e.progress * totalSeg), totalSeg - 1);
      const local = (e.progress * totalSeg) - seg;
      const [x1, y1] = path[seg], [x2, y2] = path[seg + 1];
      const ex = x1 + (x2 - x1) * local, ey = y1 + (y2 - y1) * local;

      // Glow
      const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, 10);
      grad.addColorStop(0, e.color + "cc");
      grad.addColorStop(1, e.color + "00");
      ctx.beginPath(); ctx.arc(ex, ey, 10, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      // Core dot
      ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = e.color + "ee"; ctx.fill();

      // Trail
      for (let tr = 1; tr <= 5; tr++) {
        const trProg = Math.max(0, e.progress - tr * 0.012);
        const trSeg = Math.min(Math.floor(trProg * totalSeg), totalSeg - 1);
        const trLocal = (trProg * totalSeg) - trSeg;
        const [tx1, ty1] = path[trSeg], [tx2, ty2] = path[trSeg + 1];
        const tx = tx1 + (tx2 - tx1) * trLocal, ty = ty1 + (ty2 - ty1) * trLocal;
        ctx.beginPath(); ctx.arc(tx, ty, 1.5 - tr * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = e.color + Math.floor((1 - tr / 5) * 0.5 * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }
    });

    // Animated grid lines
    const gridAlpha = 0.04;
    const cols = 20, rows = Math.ceil(H / (W / cols));
    const cw = W / cols, ch = cw;
    ctx.strokeStyle = `rgba(0,212,255,${gridAlpha})`; ctx.lineWidth = 0.5;
    for (let c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke(); }
    for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke(); }

    // Moving horizontal scan line
    const scanY = ((t * 0.6) % (H + 40)) - 20;
    const scanGrad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
    scanGrad.addColorStop(0, "rgba(0,212,255,0)");
    scanGrad.addColorStop(0.5, "rgba(0,212,255,0.06)");
    scanGrad.addColorStop(1, "rgba(0,212,255,0)");
    ctx.fillStyle = scanGrad; ctx.fillRect(0, scanY - 8, W, 16);
  });

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.95 }} />;
}

// ── Projects: wireframe 3-D shapes + floating polygons ────────────────────────
function ProjectsBg() {
  type Poly = { x: number; y: number; vx: number; vy: number; rot: number; rotV: number; sides: number; size: number; color: string; alpha: number };
  const polys = useRef<Poly[]>([]);

  const ref = useSectionCanvas((ctx, W, H, t) => {
    if (polys.current.length === 0) {
      polys.current = Array.from({ length: 20 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.008,
        sides: [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)],
        size: 16 + Math.random() * 36,
        color: Math.random() > 0.5 ? "#00d4ff" : "#7c3aed",
        alpha: 0.05 + Math.random() * 0.1,
      }));
    }

    const ps = polys.current;
    ps.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.x < -60) p.x = W + 60; if (p.x > W + 60) p.x = -60;
      if (p.y < -60) p.y = H + 60; if (p.y > H + 60) p.y = -60;
      const pulse = (Math.sin(t * 0.02 + p.x * 0.005) + 1) * 0.5;
      const a = p.alpha + pulse * 0.06;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      for (let i = 0; i < p.sides; i++) {
        const angle = (Math.PI * 2 / p.sides) * i;
        i === 0 ? ctx.moveTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size)
                : ctx.lineTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size);
      }
      ctx.closePath();
      ctx.strokeStyle = p.color + Math.floor(a * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = 0.8; ctx.stroke();
      ctx.restore();
    });

    // Rotating wireframe cube — center
    const cx = W * 0.82, cy = H * 0.25, sz = 42;
    const angle = t * 0.012;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const verts3d: [number,number,number][] = [
      [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
      [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],
    ];
    const proj = verts3d.map(([x, y, z]) => {
      const rx = x * cos - z * sin, rz = x * sin + z * cos;
      const ry = y * Math.cos(angle * 0.6) - rz * Math.sin(angle * 0.6);
      const rz2 = y * Math.sin(angle * 0.6) + rz * Math.cos(angle * 0.6);
      const fov = sz / (3 + rz2 * 0.3);
      return [cx + rx * fov, cy + ry * fov];
    });
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    ctx.strokeStyle = "rgba(0,212,255,0.14)"; ctx.lineWidth = 0.8;
    edges.forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(proj[a][0], proj[a][1]); ctx.lineTo(proj[b][0], proj[b][1]); ctx.stroke();
    });

    // Second spinning octahedron
    const ox = W * 0.12, oy = H * 0.7, os = 32;
    const oa = t * 0.009;
    const ov: [number,number,number][] = [[0,-1,0],[1,0,0],[0,0,1],[-1,0,0],[0,0,-1],[0,1,0]];
    const op = ov.map(([x, y, z]) => {
      const rx = x * Math.cos(oa) - z * Math.sin(oa);
      const rz = x * Math.sin(oa) + z * Math.cos(oa);
      return [ox + rx * os, oy + y * os];
    });
    const oe = [[0,1],[1,2],[2,3],[3,4],[4,1],[0,2],[0,3],[0,4],[5,1],[5,2],[5,3],[5,4]];
    ctx.strokeStyle = "rgba(124,58,237,0.14)"; ctx.lineWidth = 0.8;
    oe.forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(op[a][0], op[a][1]); ctx.lineTo(op[b][0], op[b][1]); ctx.stroke();
    });

    // Dot field
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        const dx = (i / 4) * W, dy = (j / 3) * H;
        const a = (Math.sin(t * 0.025 + i * 1.1 + j * 0.7) + 1) * 0.5 * 0.08 + 0.02;
        ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${a})`; ctx.fill();
      }
    }
  });

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.95 }} />;
}

// ── Experience: laser streaks + pulsing timeline nodes ────────────────────────
function ExperienceBg() {
  type Streak = { x: number; y: number; len: number; speed: number; alpha: number; color: string };
  const streaks = useRef<Streak[]>([]);

  const ref = useSectionCanvas((ctx, W, H, t) => {
    if (streaks.current.length === 0) {
      streaks.current = Array.from({ length: 14 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        len: 40 + Math.random() * 100,
        speed: 1.2 + Math.random() * 2,
        alpha: 0.06 + Math.random() * 0.1,
        color: Math.random() > 0.5 ? "#00d4ff" : "#7c3aed",
      }));
    }

    // Diagonal grid
    ctx.save();
    ctx.setLineDash([2, 14]);
    for (let i = -20; i < W + H; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - H, H);
      ctx.strokeStyle = "rgba(0,212,255,0.04)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Horizontal streaks
    streaks.current.forEach((s) => {
      s.x += s.speed;
      if (s.x > W + s.len) s.x = -s.len;
      const grad = ctx.createLinearGradient(s.x - s.len, s.y, s.x, s.y);
      grad.addColorStop(0, s.color + "00");
      grad.addColorStop(1, s.color + Math.floor(s.alpha * 255).toString(16).padStart(2, "0"));
      ctx.beginPath(); ctx.moveTo(s.x - s.len, s.y); ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad; ctx.lineWidth = 1; ctx.stroke();
    });

    // Pulsing ring nodes
    [[0.15, 0.2], [0.5, 0.5], [0.82, 0.78], [0.3, 0.85], [0.72, 0.15]].forEach(([fx, fy], i) => {
      const nx = fx * W, ny = fy * H;
      for (let ring = 0; ring < 3; ring++) {
        const phase = (t * 0.025 + i * 0.7 + ring * 0.5) % 1;
        const r = phase * 40;
        const a = (1 - phase) * (0.12 - ring * 0.03);
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0 ? `rgba(0,212,255,${a})` : `rgba(124,58,237,${a})`;
        ctx.lineWidth = 1; ctx.stroke();
      }
      // Center core
      const coreGlow = (Math.sin(t * 0.04 + i) + 1) * 0.5;
      ctx.beginPath(); ctx.arc(nx, ny, 3 + coreGlow * 2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? `rgba(0,212,255,${0.2 + coreGlow * 0.3})` : `rgba(124,58,237,${0.2 + coreGlow * 0.3})`;
      ctx.fill();
    });

    // Vertical glowing edge
    const edgeGrad = ctx.createLinearGradient(0, 0, 0, H);
    edgeGrad.addColorStop(0, "rgba(0,212,255,0)");
    edgeGrad.addColorStop(0.4, `rgba(0,212,255,${0.03 + Math.sin(t * 0.02) * 0.02})`);
    edgeGrad.addColorStop(1, "rgba(0,212,255,0)");
    ctx.fillStyle = edgeGrad; ctx.fillRect(0, 0, 2, H);
    ctx.fillRect(W - 2, 0, 2, H);
  });

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.95 }} />;
}

// ── Exploring: star constellation + shooting stars ────────────────────────────
function ExploringBg() {
  type Star = { x: number; y: number; r: number; alpha: number; pulse: number; speed: number };
  type Shoot = { x: number; y: number; vx: number; vy: number; len: number; life: number; maxLife: number };
  const stars = useRef<Star[]>([]);
  const shoots = useRef<Shoot[]>([]);

  const ref = useSectionCanvas((ctx, W, H, t) => {
    if (stars.current.length === 0) {
      stars.current = Array.from({ length: 70 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.5 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      }));
    }

    // Spawn shooting stars
    if (t % 90 === 0 && shoots.current.length < 5) {
      shoots.current.push({
        x: Math.random() * W * 0.6, y: Math.random() * H * 0.4,
        vx: 2.5 + Math.random() * 2, vy: 1 + Math.random() * 1.5,
        len: 60 + Math.random() * 60, life: 0, maxLife: 40,
      });
    }

    // Stars
    stars.current.forEach((s) => {
      s.pulse += s.speed;
      const glow = (Math.sin(s.pulse) + 1) * 0.5;
      const a = s.alpha * (0.5 + glow * 0.5);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.7 + glow * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
    });

    // Star connections (constellation)
    const nearby = stars.current.slice(0, 25);
    for (let i = 0; i < nearby.length; i++) {
      let closest = -1, minD = Infinity;
      for (let j = 0; j < nearby.length; j++) {
        if (i === j) continue;
        const d = Math.hypot(nearby[i].x - nearby[j].x, nearby[i].y - nearby[j].y);
        if (d < 140 && d < minD) { minD = d; closest = j; }
      }
      if (closest >= 0) {
        ctx.beginPath();
        ctx.moveTo(nearby[i].x, nearby[i].y);
        ctx.lineTo(nearby[closest].x, nearby[closest].y);
        ctx.strokeStyle = `rgba(0,212,255,${0.04 * (1 - minD / 140)})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }
    }

    // Shooting stars
    shoots.current = shoots.current.filter((s) => s.life < s.maxLife);
    shoots.current.forEach((s) => {
      s.life++;
      s.x += s.vx; s.y += s.vy;
      const progress = s.life / s.maxLife;
      const a = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      const grad = ctx.createLinearGradient(s.x - s.vx * s.len / s.vx, s.y - s.vy * s.len / s.vx, s.x, s.y);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(1, `rgba(255,255,255,${a * 0.7})`);
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * (s.len / Math.hypot(s.vx, s.vy)), s.y - s.vy * (s.len / Math.hypot(s.vx, s.vy)));
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.2; ctx.stroke();
    });

    // Nebula glow blobs
    [[0.2, 0.3], [0.75, 0.6], [0.5, 0.9]].forEach(([fx, fy], i) => {
      const bx = fx * W + Math.sin(t * 0.007 + i) * 25;
      const by = fy * H + Math.cos(t * 0.005 + i * 1.4) * 20;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 90);
      const a = 0.03 + Math.sin(t * 0.01 + i) * 0.015;
      grad.addColorStop(0, i % 2 === 0 ? `rgba(0,212,255,${a})` : `rgba(124,58,237,${a})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(bx, by, 90, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
    });
  });

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.95 }} />;
}

// ── Contact: radar sweep + sonar rings ────────────────────────────────────────
function ContactBg() {
  const ref = useSectionCanvas((ctx, W, H, t) => {
    const cx = W * 0.5, cy = H * 0.45;
    const maxR = Math.min(W, H) * 0.55;

    // Concentric rings
    for (let i = 1; i <= 5; i++) {
      const r = (i / 5) * maxR;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,${0.04 + i * 0.005})`; ctx.lineWidth = 0.6; ctx.stroke();
    }

    // Cross hairs
    ctx.save();
    ctx.setLineDash([3, 9]);
    ctx.strokeStyle = "rgba(0,212,255,0.05)"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR); ctx.stroke();
    for (const a of [45, 135]) {
      const rad = a * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx - maxR * Math.cos(rad), cy - maxR * Math.sin(rad));
      ctx.lineTo(cx + maxR * Math.cos(rad), cy + maxR * Math.sin(rad));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Radar sweep
    const sweepAngle = (t * 0.025) % (Math.PI * 2);
    const sweepLen = Math.PI * 0.4;
    {
      // Fallback: manual arc fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - sweepLen, sweepAngle);
      ctx.closePath();
      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      radGrad.addColorStop(0, "rgba(0,212,255,0.0)");
      radGrad.addColorStop(0.5, "rgba(0,212,255,0.03)");
      radGrad.addColorStop(1, "rgba(0,212,255,0.0)");
      ctx.fillStyle = radGrad; ctx.fill();
    }

    // Sweep leading edge
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxR * Math.cos(sweepAngle), cy + maxR * Math.sin(sweepAngle));
    const lineGrad = ctx.createLinearGradient(cx, cy, cx + maxR * Math.cos(sweepAngle), cy + maxR * Math.sin(sweepAngle));
    lineGrad.addColorStop(0, "rgba(0,212,255,0.0)");
    lineGrad.addColorStop(1, "rgba(0,212,255,0.18)");
    ctx.strokeStyle = lineGrad; ctx.lineWidth = 1.5; ctx.stroke();

    // Radar blips
    [[0.6, 0.3], [0.35, 0.55], [0.7, 0.65], [0.25, 0.38], [0.55, 0.75]].forEach(([fx, fy], i) => {
      const bx = fx * W, by = fy * H;
      const blipAngle = Math.atan2(by - cy, bx - cx);
      const angleDiff = ((sweepAngle - blipAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const blipAlpha = angleDiff < 0.8 ? (0.8 - angleDiff) * 0.6 : Math.max(0, 0.15 - (angleDiff - 0.8) * 0.1);
      if (blipAlpha > 0.01) {
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 8);
        bg.addColorStop(0, `rgba(0,212,255,${blipAlpha})`);
        bg.addColorStop(1, `rgba(0,212,255,0)`);
        ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fillStyle = bg; ctx.fill();
        ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${blipAlpha})`; ctx.fill();
      }
    });

    // Data ticker text
    const labels = ["PING 12ms", "NET_OK", "AI_ACTIVE", "GAME_DEV"];
    ctx.font = "10px 'JetBrains Mono', monospace";
    labels.forEach((label, i) => {
      const a = (Math.sin(t * 0.02 + i * 1.5) + 1) * 0.5 * 0.12 + 0.04;
      ctx.fillStyle = `rgba(0,212,255,${a})`;
      ctx.fillText(label, 12, H - 16 - i * 18);
    });
  });

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.95 }} />;
}

// ── Sections ──────────────────────────────────────────────────────────────────

function HeroSection() {
  const { displayed: typedRole, done: roleDone } = useTyping("Game Developer & AI Engineer", 55, 1200);
  const BADGES = ["Unity", "C#", "Game Development", "AI/ML", "Python"];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden grid-bg"
      style={{ background: "linear-gradient(135deg, #080c1a 0%, #0d1224 50%, #0a0e20 100%)" }}
    >
      {/* Particle network */}
      <ParticleCanvas />

      {/* Background orbs */}
      <div
        className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animation: "float 8s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-20 left-10 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #00d4ff, transparent)", animation: "float 6s ease-in-out infinite reverse" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            <p
              className="text-slate-400 text-lg mb-2 fade-in-up"
              style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.05em", animationDelay: "0.1s" }}
            >
              Hello, I'm
            </p>
            <h1
              className="text-5xl sm:text-6xl font-black leading-none mb-3 fade-in-up glitch"
              data-text="HARISH K."
              style={{ fontFamily: "Orbitron, sans-serif", animationDelay: "0.2s" }}
            >
              <span className="text-white">HARISH </span>
              <span className="text-glow" style={{ color: "#00d4ff" }}>K.</span>
            </h1>

            {/* Typing role */}
            <h2
              className="text-2xl font-semibold mb-2 fade-in-up"
              style={{ fontFamily: "Rajdhani, sans-serif", color: "#94a3b8", animationDelay: "0.3s", minHeight: "2rem" }}
            >
              {typedRole}
              {!roleDone && <span className="cursor-blink" />}
            </h2>

            <p
              className="text-slate-400 mb-6 text-sm fade-in-up"
              style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.03em", animationDelay: "0.4s" }}
            >
              Aspiring Game Developer and AI Engineer
            </p>

            {/* Tech badges with staggered pop-in */}
            <div className="flex flex-wrap gap-2 mb-6">
              {BADGES.map((t, i) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-sm font-medium pop-in"
                  style={{
                    background: "rgba(0,212,255,0.08)",
                    color: "#00d4ff",
                    border: "1px solid rgba(0,212,255,0.3)",
                    fontFamily: "JetBrains Mono, monospace",
                    animationDelay: `${0.8 + i * 0.1}s`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="text-slate-400 mb-8 leading-relaxed max-w-md fade-in-up" style={{ animationDelay: "0.5s" }}>
              I build interactive game experiences and intelligent applications by combining creative game development with Artificial Intelligence and Machine Learning.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-10 fade-in-up" style={{ animationDelay: "0.7s" }}>
              <a
                href="#projects"
                className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0891b2)",
                  color: "#080c1a",
                  fontFamily: "Rajdhani, sans-serif",
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 20px rgba(0,212,255,0.3)",
                }}
              >
                <span>🎮</span> View Projects
              </a>
              <a
                href="/Harish_K_Resume.pdf"
                download="Harish_K_Resume.pdf"
                className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "transparent",
                  color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontFamily: "Rajdhani, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                <span>⬇</span> Download My Resume
              </a>
              <a
                href="#contact"
                className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "transparent",
                  color: "#e2e8f0",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontFamily: "Rajdhani, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                <span>✉</span> Contact Me
              </a>
            </div>

            {/* Connect */}
            <div>
              <p className="text-slate-500 text-xs mb-3 uppercase tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                Connect With Me
              </p>
              <div className="flex gap-3">
                {[
                  { label: "GitHub", Icon: GitHubIcon },
                  { label: "LinkedIn", Icon: LinkedInIcon },
                  { label: "Email", Icon: EmailIcon },
                ].map(({ label, Icon }) => (
                  <button
                    key={label}
                    className="w-10 h-10 rounded flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-110 group"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.5)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                    aria-label={label}
                  >
                    <span style={{ color: "#64748b" }} className="group-hover:text-cyan-400 transition-colors">
                      <Icon size={16} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative hidden lg:flex items-center justify-center fade-in-up" style={{ animationDelay: "0.4s" }}>
            {/* Decorative cyber circle */}
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(0,212,255,0.3), transparent 70%)",
              }}
            />
            <div
              className="relative rounded-2xl overflow-hidden float-anim"
              style={{
                border: "1px solid rgba(0,212,255,0.2)",
                boxShadow: "0 0 60px rgba(0,212,255,0.1), 0 0 120px rgba(124,58,237,0.1)",
                width: 420,
                height: 420,
              }}
            >
              <img
                src={profilePhoto}
                alt="Harish K. — Game Developer & AI Engineer"
                className="w-full h-full object-cover object-top"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.12))",
                }}
              />
              {/* Unity badge */}
              <div
                className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(8,12,26,0.9)",
                  border: "1px solid rgba(0,212,255,0.3)",
                  color: "#00d4ff",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                <span>⚡</span> Unity
              </div>
            </div>

            {/* Floating code bracket decoration */}
            <div
              className="absolute top-6 right-6 text-5xl font-black opacity-20 pulse-glow"
              style={{ fontFamily: "Orbitron, sans-serif", color: "#00d4ff" }}
            >
              {"</>"}
            </div>
            <div
              className="absolute bottom-6 left-6 text-4xl font-black opacity-15 pulse-glow"
              style={{ fontFamily: "Orbitron, sans-serif", color: "#7c3aed" }}
            >
              {"{ }"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCounter({ target, suffix = "", decimals = 0, started }: { target: number; suffix?: string; decimals?: number; started: boolean }) {
  const count = useCountUp(target * Math.pow(10, decimals), 1600, started);
  const display = decimals > 0 ? (count / Math.pow(10, decimals)).toFixed(decimals) : count;
  return <>{display}{suffix}</>;
}

function AboutSection() {
  const { ref: statsRef, visible: statsVisible } = useReveal(0.3);
  const stats = [
    { icon: "</>", target: 200, suffix: "+", label: "DSA Problems Solved", decimals: 0 },
    { icon: "🎓", target: 7.5, suffix: "", label: "B.Tech CGPA", decimals: 1 },
    { icon: "📦", target: 5, suffix: "", label: "Industry-Grade Projects", decimals: 0 },
    { icon: "📜", target: 5, suffix: "", label: "Professional Certifications", decimals: 0 },
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(6,10,24,0.92) 0%, rgba(10,14,34,0.90) 50%, rgba(13,8,32,0.92) 100%)" }}>
      <AboutBg />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About text */}
          <Reveal direction="left" className="lg:col-span-1">
            <div
              className="p-6 rounded-xl card-hover animated-border h-full"
              style={{ background: "#0d1224", border: "1px solid rgba(0,212,255,0.15)" }}
            >
              <SectionHeader label="" title="ABOUT ME" accent="👤" />
              <p className="text-slate-300 leading-relaxed mb-4 text-sm">
                I'm <span className="font-semibold text-white">Harish</span>, a B.Tech CSE (AI & ML) student and aspiring Game Developer passionate about building immersive and intelligent digital experiences.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4 text-sm">
                With skills in <span className="text-cyan-400">Unity, C#, Python, AI, and Machine Learning</span>, I combine creative game development with technical problem-solving to turn ideas into engaging and impactful applications.
              </p>
              <p className="text-slate-400 leading-relaxed text-sm">
                I'm continuously exploring new technologies, developing game prototypes, building AI-powered applications, and improving my skills through hands-on projects.
              </p>
            </div>
          </Reveal>

          {/* Quick Stats */}
          <Reveal delay={100}>
            <div
              ref={statsRef}
              className="p-6 rounded-xl"
              style={{ background: "#0d1224", border: "1px solid rgba(0,212,255,0.15)" }}
            >
              <h3
                className="text-lg font-bold text-white mb-5 text-center"
                style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.08em", color: "#00d4ff" }}
              >
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:bg-cyan-900/20"
                    style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}
                  >
                    <span className="text-2xl mb-1" style={{ fontFamily: "Orbitron, sans-serif", color: "#00d4ff" }}>
                      {s.icon}
                    </span>
                    <span
                      className="text-3xl font-black mb-1"
                      style={{ fontFamily: "Orbitron, sans-serif", color: "#00d4ff" }}
                    >
                      <StatCounter target={s.target} suffix={s.suffix} decimals={s.decimals} started={statsVisible} />
                    </span>
                    <span className="text-xs text-center text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Connect with me */}
          <Reveal direction="right" delay={200}>
            <div
              className="p-6 rounded-xl"
              style={{ background: "#0d1224", border: "1px solid rgba(0,212,255,0.15)" }}
            >
            <h3
              className="text-lg font-bold mb-5"
              style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.08em", color: "#00d4ff" }}
            >
              Connect With Me
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "GitHub", sublabel: "github.com/kharishk2006-debug", Icon: GitHubIcon, color: "#e2e8f0", href: "https://github.com/kharishk2006-debug" },
                { label: "LinkedIn", sublabel: "linkedin.com/in/harish-unity", Icon: LinkedInIcon, color: "#0077b5", href: "https://www.linkedin.com/in/harish-unity" },
                { label: "Email", sublabel: "kharishk2006@gmail.com", Icon: EmailIcon, color: "#ea4335", href: "mailto:kharishk2006@gmail.com" },
              ].map(({ label, sublabel, Icon, color, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href?.startsWith("mailto") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left group hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${color}44`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}20`, color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs text-slate-500">{sublabel}</div>
                  </div>
                </a>
              ))}
            </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section id="skills" className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(7,9,26,0.92) 0%, rgba(12,15,31,0.90) 40%, rgba(8,12,26,0.92) 100%)" }}>
      <SkillsBg />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <Reveal><SectionHeader label="" title="TECHNICAL SKILLS" accent="⚙️" /></Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(SKILLS).map(([category, { icon, color, items }], i) => (
            <Reveal key={category} delay={i * 100}>
            <div
              className="p-5 rounded-xl card-hover h-full"
              style={{
                background: "#0d1224",
                border: `1px solid ${color}25`,
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{icon}</span>
                <h3
                  className="font-bold text-sm uppercase tracking-wide"
                  style={{ fontFamily: "Rajdhani, sans-serif", color, letterSpacing: "0.08em" }}
                >
                  {category}
                </h3>
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section id="projects" className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(8,9,28,0.92) 0%, rgba(11,15,30,0.90) 50%, rgba(7,10,23,0.92) 100%)" }}>
      <ProjectsBg />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.25), rgba(124,58,237,0.25), transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader label="" title="PROJECTS" accent="📦" />
          <a
            href="#projects"
            className="text-sm font-medium hidden sm:flex items-center gap-1 transition-colors hover:text-white"
            style={{ color: "#00d4ff", fontFamily: "JetBrains Mono, monospace" }}
          >
            View All Projects →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
            <div
              className="rounded-xl overflow-hidden card-hover h-full"
              style={{
                background: "#0d1224",
                border: "1px solid rgba(0,212,255,0.12)",
              }}
            >
              {/* Image */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={p.imgUrl}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.7) saturate(1.2)" }}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${p.bg}`}
                />
                <div
                  className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(0,0,0,0.6)",
                    color: "#00d4ff",
                    fontFamily: "Orbitron, sans-serif",
                    border: "1px solid rgba(0,212,255,0.3)",
                  }}
                >
                  {p.id}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3
                  className="font-bold text-white mb-0.5"
                  style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 17, letterSpacing: "0.05em" }}
                >
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {p.subtitle}
                </p>
                <p className="text-sm text-slate-400 mb-3 leading-relaxed line-clamp-2">
                  {p.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tech.map((t) => (
                    <Badge key={t} label={t} color="#00d4ff" />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <StatusBadge status={p.status} color={p.statusColor} />
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "#94a3b8",
                        border: "1px solid rgba(255,255,255,0.12)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#00d4ff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.4)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                    >
                      <GitHubIcon size={13} />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section id="experience" className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(6,9,24,0.92) 0%, rgba(10,12,30,0.90) 35%, rgba(12,9,32,0.92) 70%, rgba(6,11,24,0.92) 100%)" }}>
      <ExperienceBg />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.2), rgba(124,58,237,0.2), transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Experience */}
          <Reveal direction="left" className="lg:col-span-1">
            <SectionHeader label="" title="EXPERIENCE" accent="💼" />
            <div className="space-y-4">
              {EXPERIENCES.map((exp, i) => (
                <div
                  key={exp.role + exp.company}
                  className="p-4 rounded-xl card-hover fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, background: "#0d1224", border: "1px solid rgba(0,212,255,0.12)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{exp.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                          {exp.role}
                        </h4>
                        <p className="text-xs text-slate-500">{exp.company}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0 ml-2"
                      style={{
                        background: `${exp.typeColor}20`,
                        color: exp.typeColor,
                        border: `1px solid ${exp.typeColor}40`,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {exp.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{exp.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "#64748b",
                          border: "1px solid rgba(255,255,255,0.07)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Education */}
          <div id="education" className="lg:col-span-1">
          <Reveal delay={150}>
            <SectionHeader label="" title="EDUCATION" accent="🎓" />
            <div
              className="p-6 rounded-xl card-hover h-fit"
              style={{ background: "#0d1224", border: "1px solid rgba(0,212,255,0.15)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
                >
                  🏛️
                </div>
                <div>
                  <h4
                    className="font-bold text-white text-sm leading-tight"
                    style={{ fontFamily: "Rajdhani, sans-serif" }}
                  >
                    Periyar Maniammai Institute of Science &amp; Technology
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-cyan-400 font-semibold text-sm" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    B.Tech — Computer Science Engineering
                  </p>
                  <p className="text-slate-400 text-xs">Specialization: AI &amp; Machine Learning</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    June 2023 – May 2027
                  </span>
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.3)",
                      fontFamily: "Orbitron, sans-serif",
                    }}
                  >
                    80%
                  </span>
                </div>

                <div
                  className="h-px w-full"
                  style={{ background: "linear-gradient(90deg, rgba(0,212,255,0.2), transparent)" }}
                />

                <p className="text-slate-400 text-xs leading-relaxed">
                  Currently pursuing B.Tech in CSE (AI &amp; ML). Developing skills in Python, Machine Learning, Data Science, and Game Development using Unity and C#.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {["Python", "ML", "Unity", "C#", "Data Science"].map((t) => (
                    <Badge key={t} label={t} color="#00d4ff" />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          </div>

          {/* Certifications */}
          <Reveal direction="right" delay={250}>
            <SectionHeader label="" title="CERTIFICATIONS" accent="📜" />
            <div className="space-y-3">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.title}
                  className="flex items-center gap-3 p-3 rounded-xl card-hover"
                  style={{ background: "#0d1224", border: "1px solid rgba(0,212,255,0.1)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ background: `${cert.color}20`, border: `1px solid ${cert.color}30` }}
                  >
                    {cert.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-tight">{cert.title}</p>
                    {cert.subtitle && (
                      <p className="text-xs text-slate-500">{cert.subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

function ExploringSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(7,9,27,0.92) 0%, rgba(14,9,32,0.90) 50%, rgba(8,12,26,0.92) 100%)" }}>
      <ExploringBg />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.35), transparent)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Currently Exploring */}
          <Reveal className="lg:col-span-2">
          <div>
            <SectionHeader label="" title="CURRENTLY EXPLORING" accent="🔭" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {EXPLORING.map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-xl card-hover"
                  style={{
                    background: "#0d1224",
                    border: `1px solid ${item.color}25`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                  >
                    {item.icon}
                  </div>
                  <h4
                    className="font-bold mb-2"
                    style={{ fontFamily: "Rajdhani, sans-serif", color: item.color, fontSize: 15 }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Current Focus flow */}
            <div
              className="p-4 rounded-xl flex flex-wrap items-center gap-2"
              style={{ background: "#0d1224", border: "1px solid rgba(0,212,255,0.1)" }}
            >
              <span className="text-slate-500 text-xs font-medium" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                Current Focus
              </span>
              {[
                { label: "Unity", color: "#00d4ff" },
                { label: "→", color: "#64748b" },
                { label: "3D Game Development", color: "#7c3aed" },
                { label: "→", color: "#64748b" },
                { label: "AI Agents", color: "#a855f7" },
              ].map((item, i) => (
                item.label === "→" ? (
                  <span key={i} style={{ color: item.color }}>→</span>
                ) : (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${item.color}20`,
                      color: item.color,
                      border: `1px solid ${item.color}40`,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {item.label}
                  </span>
                )
              ))}
            </div>
          </div>
          </Reveal>

          {/* Resume CTA */}
          <Reveal direction="right" delay={150}>
          <div
            className="relative rounded-xl overflow-hidden flex flex-col justify-between p-6"
            style={{
              background: "linear-gradient(135deg, #0d1224, #1a0d2e)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&auto=format")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "brightness(0.3) saturate(0.5)",
              }}
            />
            <div className="relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl"
                style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.4)" }}
              >
                🚀
              </div>
              <h3
                className="font-bold text-white text-lg mb-2"
                style={{ fontFamily: "Rajdhani, sans-serif" }}
              >
                Want to know more about my work?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Explore my experience, technical skills, projects, and achievements in detail.
              </p>
              <a
                href="/Harish_K_Resume.pdf"
                download="Harish_K_Resume.pdf"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white",
                  fontFamily: "Rajdhani, sans-serif",
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                }}
              >
                <span>⬇</span> Download My Resume
              </a>
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(7,9,27,0.92) 0%, rgba(10,12,30,0.90) 40%, rgba(7,9,27,0.92) 100%)" }}>
      <ContactBg />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(168,85,247,0.3), transparent)" }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <Reveal><SectionHeader label="" title="CONTACT" accent="✉️" /></Reveal>

        <Reveal delay={100}>
        <h2
          className="text-4xl font-black mb-3 gradient-text"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          Let's Build Something Awesome.
        </h2>
        <p className="text-slate-400 mb-10 max-w-xl mx-auto">
          Have a project idea, collaboration opportunity, or just want to connect? Feel free to reach out.
        </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 items-stretch">
          {[
            { icon: "✉️", label: "Email", value: "kharishk2006@gmail.com", color: "#ea4335", href: "mailto:kharishk2006@gmail.com" },
            { icon: "💼", label: "LinkedIn", value: "linkedin.com/in/harish-unity", color: "#0077b5", href: "https://www.linkedin.com/in/harish-unity" },
            { icon: "💻", label: "GitHub", value: "github.com/kharishk2006-debug", color: "#e2e8f0", href: "https://github.com/kharishk2006-debug" },
            { icon: "📍", label: "Location", value: "Thanjavur, Tamil Nadu, India", color: "#10b981" },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 80} className="h-full">
            <a
              href={(item as any).href ?? undefined}
              target={(item as any).href?.startsWith("mailto") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center text-center p-5 rounded-xl transition-all duration-200 hover:scale-[1.02] h-full min-h-[120px]"
              style={{ background: "#0d1224", border: `1px solid rgba(${item.color === "#10b981" ? "16,185,129" : "0,212,255"},0.1)` }}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {item.label}
              </p>
              <p className="text-sm font-medium text-white break-all">{item.value}</p>
            </a>
            </Reveal>
          ))}
        </div>

        <button
          className="inline-flex items-center gap-2 px-8 py-3 rounded font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00d4ff, #0891b2)",
            color: "#080c1a",
            fontFamily: "Rajdhani, sans-serif",
            fontSize: 16,
            letterSpacing: "0.08em",
            boxShadow: "0 4px 30px rgba(0,212,255,0.3)",
          }}
        >
          Get In Touch ↗
        </button>
      </div>
    </section>
  );
}

function Footer({ onNav }: { onNav: (s: string) => void }) {
  return (
    <footer
      className="py-10 border-t"
      style={{ background: "rgba(6,9,24,0.95)", borderColor: "rgba(0,212,255,0.1)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "Orbitron, sans-serif", color: "#00d4ff" }}
              >
                {"</>"}
              </span>
              <span
                className="text-lg font-bold text-white"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                HARISH <span style={{ color: "#00d4ff" }}>K.</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              Game Developer • AI Engineer
            </p>
            <p className="text-xs text-slate-600">
              Building interactive experiences and intelligent applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-xs font-bold mb-3 uppercase tracking-widest"
              style={{ color: "#00d4ff", fontFamily: "JetBrains Mono, monospace" }}
            >
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => onNav(link)}
                  className="text-xs text-slate-500 hover:text-cyan-400 transition-colors py-0.5"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4
              className="text-xs font-bold mb-3 uppercase tracking-widest"
              style={{ color: "#00d4ff", fontFamily: "JetBrains Mono, monospace" }}
            >
              Connect
            </h4>
            <div className="flex gap-3">
              {[
                { label: "GitHub", Icon: GitHubIcon },
                { label: "LinkedIn", Icon: LinkedInIcon },
                { label: "Email", Icon: EmailIcon },
              ].map(({ label, Icon }) => (
                <button
                  key={label}
                  className="w-8 h-8 rounded flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748b",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#00d4ff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.4)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                  aria-label={label}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h4
              className="text-xs font-bold mb-3 uppercase tracking-widest"
              style={{ color: "#00d4ff", fontFamily: "JetBrains Mono, monospace" }}
            >
              Location
            </h4>
            <div className="flex items-start gap-2">
              <span className="mt-0.5">📍</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thanjavur, Tamil Nadu, India
              </p>
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t"
          style={{ borderColor: "rgba(0,212,255,0.08)" }}
        >
          <p className="text-xs text-slate-600" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            © 2026 Harish K. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with ⚡ React &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.toLowerCase());
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const match = NAV_LINKS.find((l) => l.toLowerCase() === id);
            if (match) setActiveNav(match);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: "#080c1a" }}>
      {/* Global animated canvas — fixed behind everything */}
      <GlobalAnimatedBg />
      {/* All content sits above the canvas */}
      <div className="relative" style={{ zIndex: 1 }}>
        <NavBar active={activeNav} onNav={setActiveNav} />
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <ExploringSection />
        <ContactSection />
        <Footer onNav={setActiveNav} />
      </div>
    </div>
  );
}
