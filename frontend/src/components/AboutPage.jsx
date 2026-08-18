import {
  ArrowLeft,
  Award,
  Bot,
  CalendarDays,
  Image,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BounceCards from "./BounceCards";
import Stack from "./Stack";



const education = [
  {
    accent: "var(--ctp-blue)",
    degree: "BS Computer Science",
    school: "FEU Institute of Technology",
    location: "Manila, PH",
    period: "2024 - Present",
    summary:
      "Studying computer science with a software engineering specialization, focused on AI systems, web development, databases, and applied software projects.",
    tags: ["Software Engineering", "Web Development", "AI Systems", "Database Systems"],
    imageSrc: "/images/education/feu-tech.png",
    imageAlt: "FEU Institute of Technology campus or school photo",
    logoSrc: "/images/education/feu-tech.png",
    logoAlt: "FEU Institute of Technology logo",
  },
  {
    accent: "var(--ctp-green)",
    degree: "Science, Technology, Engineering, and Mathematics",
    school: "La Salle College Antipolo",
    location: "Antipolo, PH",
    period: "2022 - 2024",
    summary:
      "Completed the STEM track and built a foundation in mathematics, research, and analytical thinking for computer science and software engineering.",
    tags: ["STEM", "Research", "Engineering", "Foundations"],
    imageSrc: "/images/education/la-salle-college-antipolo.png",
    imageAlt: "La Salle College Antipolo school photo",
    logoSrc: "/images/education/la-salle-college-antipolo.png",
    logoAlt: "La Salle College Antipolo logo",
  },
];

const eventPhotos = [
  {
    title: "AWS Students Tech Day",
    date: "12-02-25",
    meta: "Cloud, security, and student career paths",
    imageSrc: "/images/events/aws-student-tech-day.jpeg",
    imageAlt: "Photo from AWS Students Tech Day",
  },
  {
    title: "State of the Nation in AI",
    date: "01-30-26",
    meta: "Responsible AI, governance, and national AI strategy",
    imageSrc: "/images/events/sonai.jpeg",
    imageAlt: "Photo from State of the Nation in AI",
  },
  {
    title: "MiniPay | Celo Community Mixer",
    date: "05-21-25",
    meta: "Blockchain, Web3, and digital payments",
    imageSrc: "/images/events/minipay.jpeg",
    imageAlt: "Photo from MiniPay Celo Community Mixer",
  },
  {
    title: "GDG Cloud Manila: Build with AI",
    date: "06-07-26",
    meta: "Google Cloud, AI research, and multi-agent systems",
    imageSrc: "/images/events/gdg.jpeg",
    imageAlt: "Photo from GDG Cloud Manila Build with AI",
  },
];

const profilePhotos = [
  {
    label: "Aaron 01",
    src: "/images/profile/profile1.jpeg",
    alt: "Aaron Arada portrait photo",
  },
  {
    label: "Aaron 02",
    src: "/images/profile/profile2.jpeg",
    alt: "Aaron Arada photo",
  },
  {
    label: "Aaron 03",
    src: "/images/profile/profile3.jpeg",
    alt: "Aaron Arada photo",
  },
  {
    label: "Aaron 04",
    src: "/images/profile/profile4.jpeg",
    alt: "Aaron Arada photo",
  },
];

const certifications = [
  {
    name: "AWS Academy Graduate - Generative AI Foundations - Training Badge",
    issuer: "AWS Training and Certification",
    date: "Issued August 2026",
    credentialUrl: "https://www.credly.com/badges/1e196669-e582-4a00-8a16-cf0b74fb2c95/public_url",
  },
  {
    name: "IT Specialist - Python",
    issuer: "Certiport",
    date: "Issued July 2026",
    credentialUrl: "https://www.credly.com/badges/ec1e2018-4ce3-43e6-add2-47db4eb680e8/public_url",
  },
  {
    name: "Microsoft Office Specialist: Excel Associate",
    issuer: "Microsoft",
    date: "Issued August 2023",
    credentialUrl: "https://www.credly.com/badges/d7302b70-bf16-4c05-989b-aab9a76c1938",
  },
];

function SectionKicker({ children }) {
  return (
    <p
      className="font-mono text-xs uppercase tracking-widest"
      style={{ color: "var(--ctp-accent)" }}
    >
      {children}
    </p>
  );
}

function SectionIntro({ title, children }) {
  return (
    <div className="space-y-3">
      <h2
        className="max-w-3xl font-sans font-bold leading-tight text-balance"
        style={{ color: "var(--ctp-text)", fontSize: "clamp(1.35rem, 3vw, 2rem)" }}
      >
        {title}
      </h2>
      {children && (
        <p className="max-w-3xl font-sans text-base leading-relaxed" style={{ color: "var(--ctp-subtext1)" }}>
          {children}
        </p>
      )}
    </div>
  );
}

function TerminalPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg p-5 ${className}`}
      style={{
        background: "var(--ctp-mantle)",
        border: "1px solid var(--ctp-surface0)",
      }}
    >
      {children}
    </div>
  );
}

function TagList({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded px-2 py-1 font-sans text-xs font-medium"
          style={{
            background: "var(--ctp-surface0)",
            color: "var(--ctp-subtext1)",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function escapeSvgText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function eventPlaceholder(title, index) {
  const safeTitle = escapeSvgText(title);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b1f33"/>
          <stop offset="58%" stop-color="#021526"/>
          <stop offset="100%" stop-color="#010d19"/>
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="28" fill="url(#bg)"/>
      <rect x="28" y="28" width="264" height="264" rx="22" fill="none" stroke="#313244" stroke-width="3"/>
      <circle cx="160" cy="132" r="34" fill="#a6e3a1" opacity="0.9"/>
      <path d="M126 196h68l-22-30-18 22-10-13-18 21z" fill="#cdd6f4" opacity="0.78"/>
      <text x="160" y="235" text-anchor="middle" fill="#cdd6f4" font-family="monospace" font-size="16" font-weight="700">${safeTitle}</text>
      <text x="160" y="264" text-anchor="middle" fill="#a6adc8" font-family="monospace" font-size="13">add photo ${index + 1}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function profilePlaceholder(label, index) {
  const safeLabel = escapeSvgText(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">
      <defs>
        <linearGradient id="profileBg${index}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#112c3d"/>
          <stop offset="52%" stop-color="#051a2c"/>
          <stop offset="100%" stop-color="#010d19"/>
        </linearGradient>
      </defs>
      <rect width="420" height="420" rx="34" fill="url(#profileBg${index})"/>
      <rect x="24" y="24" width="372" height="372" rx="28" fill="none" stroke="#313244" stroke-width="4"/>
      <circle cx="210" cy="164" r="58" fill="#a6e3a1"/>
      <path d="M112 336c10-66 52-102 98-102s88 36 98 102" fill="#313244"/>
      <path d="M138 335c12-42 40-66 72-66s60 24 72 66" fill="#cdd6f4" opacity="0.55"/>
      <text x="210" y="376" text-anchor="middle" fill="#cdd6f4" font-family="monospace" font-size="20" font-weight="700">${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function ProfilePhotoStack() {
  const cards = useMemo(
    () =>
      profilePhotos.map((photo, index) => (
        <div
          key={photo.label}
          className="h-full w-full overflow-hidden rounded-xl"
          style={{
            background: "var(--ctp-crust)",
            border: "1px solid var(--ctp-surface1)",
          }}
        >
          <img
            src={photo.src || profilePlaceholder(photo.label, index)}
            alt={photo.alt}
            className="pointer-events-none h-full w-full object-cover"
          />
        </div>
      )),
    []
  );

  return (
    <div className="flex justify-center pt-4 lg:pt-14">
      <div className="h-80 w-80 max-w-full sm:h-88 sm:w-88 lg:h-96 lg:w-96">
        <Stack
          randomRotation
          sensitivity={160}
          sendToBackOnClick
          mobileClickOnly
          pauseOnHover
          cards={cards}
        />
      </div>
    </div>
  );
}

function EventsSection() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 639px)").matches
  );
  const images = eventPhotos.map((event, index) => event.imageSrc || eventPlaceholder(event.title, index));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const handleChange = () => setIsCompact(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const transformStyles = isCompact
    ? [
      "rotate(6deg) translate(-76px)",
      "rotate(-2deg) translate(-26px)",
      "rotate(4deg) translate(26px)",
      "rotate(-6deg) translate(76px)",
    ]
    : [
      "rotate(6deg) translate(-230px)",
      "rotate(-2deg) translate(-78px)",
      "rotate(4deg) translate(78px)",
      "rotate(-6deg) translate(230px)",
    ];

  return (
    <section className="px-6 pb-16 sm:px-8 lg:pb-20">
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionIntro
          title="Events and community"
        >
          Browse conferences, meetups, and learning events I've attended. Select a photo to see the event details.
        </SectionIntro>

        <div className="flex min-h-[19rem] items-center justify-center overflow-visible py-6 sm:min-h-[23rem] sm:py-8 lg:min-h-[26rem]">
          <BounceCards
            images={images}
            imageAlts={eventPhotos.map((event) => event.imageAlt)}
            cardTitles={eventPhotos.map((event) => event.title)}
            cardDescriptions={eventPhotos.map((event) => event.meta)}
            cardKickers={eventPhotos.map((event) => event.date)}
            containerWidth={isCompact ? 300 : 880}
            containerHeight={isCompact ? 270 : 360}
            cardSize={isCompact ? 128 : 230}
            cardAspectRatio="4 / 5"
            animationDelay={0.15}
            animationStagger={0.06}
            easeType="elastic.out(1, 0.55)"
            transformStyles={transformStyles}
            enableHover
          />
        </div>
      </div>
    </section>
  );
}

function SchoolLogoHoverPanel({ item }) {
  const logoImage = item.logoSrc || item.imageSrc;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-30 w-2/3 translate-x-full overflow-hidden opacity-0 transition duration-700 ease-out group-hover:translate-x-0 group-hover:opacity-100 sm:w-1/2"
      aria-hidden="true"
    >
      {logoImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${logoImage})`,
            maskImage: "linear-gradient(to right, black 0%, black 86%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 0%, black 86%, transparent 100%)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--ctp-mantle), var(--ctp-base) 55%, var(--ctp-crust))",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--ctp-mantle) 10%, transparent), color-mix(in srgb, var(--ctp-mantle) 16%, transparent), transparent)",
        }}
      />
      <div className="relative flex h-full items-center justify-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-xl p-4 shadow-lg transition duration-500 group-hover:scale-105"
          style={{
            background: "color-mix(in srgb, var(--ctp-surface0) 86%, transparent)",
            border: "1px solid var(--ctp-surface1)",
          }}
        >
          {logoImage ? (
            <img src={logoImage} alt="" className="max-h-full max-w-full object-contain drop-shadow" />
          ) : (
            <Image size={28} style={{ color: "var(--ctp-accent)" }} />
          )}
        </div>
      </div>
    </div>
  );
}

function EducationCard({ item }) {
  return (
    <article
      className="group relative overflow-hidden rounded-lg p-5 transition duration-300 hover:-translate-y-1 sm:p-6"
      style={{
        background: "var(--ctp-mantle)",
        border: "1px solid var(--ctp-surface0)",
        borderColor: `color-mix(in srgb, ${item.accent} 45%, var(--ctp-surface0))`,
      }}
    >
      <SchoolLogoHoverPanel item={item} />

      <div className="relative w-full space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h3
              className="font-sans font-semibold leading-tight text-balance"
              style={{ color: "var(--ctp-text)", fontSize: "clamp(1.15rem, 2.5vw, 1.5rem)" }}
            >
              {item.degree}
            </h3>
            <p className="font-sans text-sm font-semibold" style={{ color: "var(--ctp-text)" }}>
              {item.school}
            </p>
          </div>
          <span
            className="inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 font-sans text-xs font-medium whitespace-nowrap"
            style={{
              background: "var(--ctp-surface0)",
              color: "var(--ctp-subtext1)",
            }}
          >
            {item.period}
          </span>
        </div>

        <div className="flex items-center gap-2 font-sans text-sm" style={{ color: "var(--ctp-subtext1)" }}>
          <MapPin size={14} style={{ color: item.accent }} />
          {item.location}
        </div>

        <p className="font-sans text-base leading-relaxed" style={{ color: "var(--ctp-subtext1)" }}>
          {item.summary}
        </p>

        <TagList tags={item.tags} />
      </div>
    </article>
  );
}

export function AboutPage({ onOpenChat }) {
  return (
    <main style={{ background: "var(--ctp-base)" }}>
      <section className="px-6 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="space-y-8">
            <a
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--ctp-surface1)] px-4 py-2 font-sans text-sm font-medium transition-colors hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                color: "var(--ctp-text)",
                outlineColor: "var(--ctp-accent)",
              }}
            >
              <ArrowLeft size={15} />
              Back home
            </a>

            <div className="space-y-5">
              <h1
                className="max-w-3xl font-sans font-bold leading-tight text-balance"
                style={{
                  color: "var(--ctp-text)",
                  fontSize: "clamp(2rem, 5vw, 3.15rem)",
                }}
              >
                About Me
              </h1>
              <p
                className="max-w-2xl font-sans text-base leading-relaxed text-pretty"
                style={{ color: "var(--ctp-subtext1)", lineHeight: "1.75" }}
              >
               I'm Aaron Arada, a computer science student in Manila focused on AI and full-stack development. I build tools that make complex ideas easier to understand and use, and I update this portfolio as my work evolves.
              <br />
              <br />
              Outside software, I play Valorant, Counter-Strike 2, and Hogwarts Legacy. Away from my desk, I enjoy billiards and photography. I like challenges that sharpen both my technical judgment and the way I work with people.
              </p>
            </div>

          </div>

          <ProfilePhotoStack />
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 lg:pb-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionIntro
            title="Education"
          >
            The coursework and technical foundations behind my approach to software and AI.
          </SectionIntro>

          <div className="space-y-5">
            {education.map((item) => (
              <EducationCard key={item.school} item={item} />
            ))}
          </div>
        </div>
      </section>

      <EventsSection />

      <section className="px-6 pb-16 sm:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <SectionIntro
            title="Certifications"
          >
            Credentials earned through hands-on learning, technical training, and continuous development.
          </SectionIntro>

          <div className="grid gap-4 md:grid-cols-3">
            {certifications.map((cert) => (
              <TerminalPanel key={cert.name} className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: "var(--ctp-surface0)",
                      color: "var(--ctp-accent)",
                    }}
                  >
                    <Award size={18} />
                  </div>

                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ctp-surface1)] px-3 py-1.5 font-sans text-xs font-medium transition-colors hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ color: "var(--ctp-text)", outlineColor: "var(--ctp-accent)" }}
                    >
                      View credential
                    </a>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-sans text-sm font-semibold leading-snug" style={{ color: "var(--ctp-text)" }}>
                    {cert.name}
                  </h3>
                  <div className="space-y-2 font-sans text-xs" style={{ color: "var(--ctp-subtext1)" }}>
                    <p>{cert.issuer}</p>
                    <p className="inline-flex items-center gap-2">
                      <CalendarDays size={13} style={{ color: "var(--ctp-accent)" }} />
                      {cert.date}
                    </p>
                  </div>
                </div>
              </TerminalPanel>
            ))}
          </div>
        </div>
      </section>

     

      <section className="px-6 pb-20 sm:px-8">
        <div
          className="mx-auto flex max-w-5xl flex-col gap-5 rounded-lg p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          style={{
            background: "var(--ctp-crust)",
            border: "1px solid var(--ctp-surface0)",
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bot size={15} style={{ color: "var(--ctp-accent)" }} />
              <SectionKicker>Portfolio assistant</SectionKicker>
            </div>
            <p className="max-w-2xl font-sans text-base leading-relaxed" style={{ color: "var(--ctp-subtext1)" }}>
              Ask Aaron Intelligence about my projects, skills, experience, or current work.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ctp-surface1)] px-4 py-2 font-sans text-sm font-medium transition-colors hover:border-[var(--ctp-accent)] hover:bg-[var(--ctp-surface0)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              color: "var(--ctp-text)",
              outlineColor: "var(--ctp-accent)",
            }}
          >
            Ask Aaron Intelligence
          </button>
        </div>
      </section>
    </main>
  );
}
