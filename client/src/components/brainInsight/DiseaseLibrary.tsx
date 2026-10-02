import { ArrowUpRight, BookOpenCheck, BrainCircuit } from "lucide-react";
import { diseaseInsights } from "@/lib/brainInsightData";

export default function DiseaseLibrary() {
  return (
    <div className="bi-disease-grid">
      {diseaseInsights.map((item, index) => (
        <article className="bi-disease-card" key={item.id}>
          <div className="bi-disease-card__top">
            <span className="bi-disease-card__index">0{index + 1}</span>
            <span className="bi-disease-card__icon"><BrainCircuit size={18} strokeWidth={1.7} /></span>
          </div>
          <h3>{item.title}</h3>
          <p className="bi-disease-card__summary">{item.summary}</p>
          <div className="bi-disease-card__context">
            <span className="bi-disease-card__context-label"><BookOpenCheck size={13} /> MRI CONTEXT</span>
            <p>{item.mriContext}</p>
          </div>
          {item.sourceUrl ? (
            <a className="bi-source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
              <span>{item.sourceTitle}</span><ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ) : (
            <div className="bi-source-link bi-source-link--plain"><span>{item.sourceTitle}</span></div>
          )}
        </article>
      ))}
      <aside className="bi-library-note">
        <span className="bi-library-note__mark">i</span>
        <p>These summaries are general education, not medical advice. A model’s class label—even “normal”—cannot confirm or rule out a condition. Always rely on qualified medical professionals for care decisions.</p>
      </aside>
    </div>
  );
}
