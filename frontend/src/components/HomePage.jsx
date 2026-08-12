import { Contact } from "./Contact";
import { Dashboard } from "./Dashboard";
import { Hero } from "./Hero";
import { MapCard } from "./MapCard";
import { Projects } from "./Projects";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Projects />
      <section
        id="contact"
        className="homepage-dashboard-contact bg-[var(--ctp-base)] px-6 py-14"
        aria-label="Dashboard and contact"
      >
        <div className="homepage-bottom-grid mx-auto max-w-6xl">
          <Dashboard />
          <Contact />
          <MapCard />
        </div>
      </section>
    </main>
  );
}
