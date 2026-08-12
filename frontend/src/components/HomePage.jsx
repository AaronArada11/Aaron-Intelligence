import { Contact } from "./Contact";
import { Dashboard } from "./Dashboard";
import { Hero } from "./Hero";
import { Projects } from "./Projects";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Projects />
      <Dashboard />
      <Contact />
    </main>
  );
}
