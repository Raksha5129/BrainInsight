import { Activity, BookOpenText, Brain, ChartNoAxesCombined, ScanLine, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

export type SectionId = "overview" | "analysis" | "model" | "learn";

type BrandProps = { compact?: boolean };

export function Brand({ compact = false }: BrandProps) {
  return (
    <a className={`bi-brand${compact ? " bi-brand--compact" : ""}`} href="#overview" aria-label="BrainInsight home">
      <span className="bi-brand-mark" aria-hidden="true">
        <Brain size={23} strokeWidth={1.65} />
        <span className="bi-brand-mark__orbit" />
        <span className="bi-brand-mark__dot" />
      </span>
      {!compact && (
        <span className="bi-brand-wordmark">
          <strong>Brain<span>Insight</span></strong>
          <small>NEURO RESEARCH LAB</small>
        </span>
      )}
    </a>
  );
}

const navigation: { id: SectionId; label: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "analysis", label: "MRI analysis", icon: ScanLine },
  { id: "model", label: "Model insights", icon: ChartNoAxesCombined },
  { id: "learn", label: "Disease library", icon: BookOpenText },
];

type SidebarProps = {
  active: SectionId;
  onNavigate: (section: SectionId) => void;
};

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="bi-sidebar" aria-label="Main navigation">
      <div className="bi-sidebar__brand"><Brand /></div>
      <div className="bi-nav-label">WORKSPACE</div>
      <nav className="bi-nav">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`bi-nav__item${active === id ? " is-active" : ""}`}
            onClick={() => onNavigate(id)}
            aria-current={active === id ? "page" : undefined}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
            {id === "analysis" && <span className="bi-nav__dot" aria-hidden="true" />}
          </button>
        ))}
      </nav>

      <div className="bi-sidebar__bottom">
        <div className="bi-sidebar-note">
          <span className="bi-sidebar-note__icon"><Sparkles size={15} /></span>
          <div>
            <strong>Research preview</strong>
            <p>BrainInsight v2 is ready for local inference.</p>
          </div>
        </div>
        <div className="bi-sidebar__version"><span className="bi-status-dot" /> DATASET · 12,267 IMAGES</div>
      </div>
    </aside>
  );
}
