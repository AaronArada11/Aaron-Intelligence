import { Contact } from "./Contact";
import { Dashboard } from "./Dashboard";
import { Hero } from "./Hero";
import { MapCard } from "./MapCard";
import { Projects } from "./Projects";
import { Skills } from "./Skills";

export default function HomePage({ onOpenChat }) {
  return (
    <main>
      <Hero />
      <Projects onOpenChat={onOpenChat} />
      <Skills />
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
