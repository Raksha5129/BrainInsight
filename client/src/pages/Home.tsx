import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, BadgeCheck, Brain, Download, FileText, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import DiseaseLibrary from "@/components/brainInsight/DiseaseLibrary";
import { Brand, Sidebar, type SectionId } from "@/components/brainInsight/Brand";
import ModelInsights from "@/components/brainInsight/ModelInsights";
import ScanWorkspace from "@/components/brainInsight/ScanWorkspace";
import { notebookFacts } from "@/lib/brainInsightData";
import { downloadEvaluationReport } from "@/lib/createPdfReport";

const MRI_ART = "/images/brain-scan-art.webp";
const sections: SectionId[] = ["overview", "analysis", "model", "learn"];

function AppHeader({ onDownload }: { onDownload: () => void }) {
  return (
    <header className="bi-topbar">
      <div className="bi-topbar__mobile-brand"><Brand compact /></div>
      <div className="bi-breadcrumb"><span>Workspace</span><span className="bi-breadcrumb__slash">/</span><strong>Research overview</strong></div>
      <div className="bi-topbar__actions">
        <span className="bi-topbar-status"><i /> LOCAL INFERENCE</span>
        <button className="bi-button bi-button--quiet" type="button" onClick={onDownload}><Download size={15} /> <span>Evaluation PDF</span></button>
      </div>
    </header>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  const navigateTo = (section: SectionId) => {
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(section);
  };

  useEffect(() => {
    const elements = sections.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id as SectionId);
    }, { rootMargin: "-22% 0px -58% 0px", threshold: [0, 0.15, 0.35, 0.55] });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bi-app-shell">
      <Sidebar active={activeSection} onNavigate={navigateTo} />
      <div className="bi-main-column">
        <AppHeader onDownload={downloadEvaluationReport} />
        <main className="bi-main">
          <section className="bi-hero" id="overview">
            <div className="bi-hero__glow" aria-hidden="true" />
            <div className="bi-hero__copy">
              <div className="bi-eyebrow"><span className="bi-eyebrow__line" /> BRAIN MRI CLASSIFICATION <span className="bi-hero__version">· MODEL STUDY 02</span></div>
              <h1>Read the signal.<br /><span>Keep the context.</span></h1>
              <p className="bi-hero__description">An interpretable research workspace for exploring a five-class brain MRI model—its workflow, its results, and the limits that matter.</p>
              <div className="bi-hero__actions">
                <button className="bi-button bi-button--primary bi-button--large" type="button" onClick={() => navigateTo("analysis")}><ScanLine size={16} /> Explore MRI workflow <ArrowDown size={15} /></button>
                <button className="bi-button bi-button--outline bi-button--large" type="button" onClick={() => navigateTo("model")}><FileText size={16} /> Inspect model</button>
              </div>
              <div className="bi-hero__trust"><span><BadgeCheck size={15} /> Notebook-derived metrics</span><span><ShieldCheck size={15} /> Research use only</span></div>
            </div>
            <div className="bi-hero-visual" aria-label="Illustrative MRI artwork; not a scan result">
              <div className="bi-hero-visual__orbit bi-hero-visual__orbit--outer" />
              <div className="bi-hero-visual__orbit bi-hero-visual__orbit--inner" />
              <div className="bi-hero-visual__frame">
                <img src={MRI_ART} alt="Illustrative brain MRI-style artwork, not a patient scan or model output" />
                <div className="bi-hero-visual__scanline" />
                <span className="bi-hero-visual__tag"><i /> ILLUSTRATIVE SCAN ART</span>
                <span className="bi-hero-visual__corner bi-hero-visual__corner--tl" />
                <span className="bi-hero-visual__corner bi-hero-visual__corner--br" />
              </div>
              <div className="bi-hero-visual__coordinate">MRI / 224<br />RGB / 05 CLS</div>
              <div className="bi-hero-visual__float"><Sparkles size={14} /><span><strong>Five classes</strong><small>One research model</small></span></div>
            </div>
            <div className="bi-hero__bottomline"><span><i className="bi-pulse-dot" /> EFFICIENTNETB0 · NOTEBOOK EVALUATION</span><span>EFFICIENTNETB0 · LOCAL CHECKPOINT <i className="bi-live-dot" /></span></div>
          </section>

          <section className="bi-stat-strip" aria-label="Notebook summary metrics">
            <article className="bi-stat"><span>TEST ACCURACY</span><strong>98.48<span>%</span></strong><small>held-out test split</small></article>
            <article className="bi-stat"><span>TEST IMAGES</span><strong>{notebookFacts.testImages.toLocaleString()}</strong><small>separate from training</small></article>
            <article className="bi-stat"><span>MODEL BACKBONE</span><strong className="bi-stat__text">EfficientNet<span>B0</span></strong><small>ImageNet pretrained</small></article>
            <article className="bi-stat"><span>OUTPUT CLASSES</span><strong>05</strong><small>from the notebook labels</small></article>
            <div className="bi-stat-strip__note"><span className="bi-stat-strip__note-icon"><ShieldCheck size={16} /></span><p>Test-set result, not clinical validation.<br /><a href="#model" onClick={(event) => { event.preventDefault(); navigateTo("model"); }}>See evaluation context <ArrowUpRight size={12} /></a></p></div>
          </section>

          <section className="bi-section" id="analysis">
            <div className="bi-section-heading">
              <div><div className="bi-eyebrow"><span className="bi-eyebrow__line" /> INTERACTIVE WORKSPACE</div><h2>Explore the scan flow</h2><p>Upload an MRI image and run the trained BrainInsight v2 checkpoint locally.</p></div>
              <div className="bi-step-chip"><span>01</span> UPLOAD <i /> <span>02</span> REVIEW</div>
            </div>
            <ScanWorkspace />
          </section>

          <section className="bi-section" id="model">
            <div className="bi-section-heading bi-section-heading--model">
              <div><div className="bi-eyebrow"><span className="bi-eyebrow__line" /> MODEL INTELLIGENCE</div><h2>Performance, with the fine print</h2><p>All metrics below are copied from the supplied retraining notebook’s evaluation outputs.</p></div>
              <div className="bi-evaluation-stamp"><span>TESTED ON</span><strong>{notebookFacts.testImages.toLocaleString()}</strong><small>held-out examples</small></div>
            </div>
            <ModelInsights />
          </section>

          <section className="bi-section bi-section--learn" id="learn">
            <div className="bi-section-heading">
              <div><div className="bi-eyebrow"><span className="bi-eyebrow__line" /> FIELD NOTES</div><h2>Know the categories</h2><p>Short educational context for labels in the dataset. These are not scan interpretations.</p></div>
              <span className="bi-library-count"><Brain size={15} /> 05 LABELS IN THE NOTEBOOK</span>
            </div>
            <DiseaseLibrary />
          </section>

          <footer className="bi-footer">
            <Brand compact />
            <p>Built from the BrainInsight v2 evaluation notebook · local inference enabled.</p>
            <button type="button" onClick={downloadEvaluationReport}><Download size={14} /> Download evaluation PDF</button>
          </footer>
        </main>
      </div>
    </div>
  );
}
