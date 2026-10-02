import { Activity, BarChart3, Database, Layers3, ShieldAlert } from "lucide-react";
import { confusionMatrix, methodologySteps, modelClasses, notebookFacts } from "@/lib/brainInsightData";

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export default function ModelInsights() {
  const maxCell = Math.max(...confusionMatrix.flat());
  return (
    <>
      <div className="bi-metric-grid">
        <article className="bi-metric-card bi-metric-card--accent">
          <div className="bi-metric-card__top"><span>TEST ACCURACY</span><Activity size={16} /></div>
          <strong>{percent(notebookFacts.testAccuracy)}</strong>
          <small>Notebook report · {notebookFacts.testImages.toLocaleString()} held-out images</small>
          <div className="bi-metric-card__spark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="bi-metric-card">
          <div className="bi-metric-card__top"><span>TEST LOSS</span><BarChart3 size={16} /></div>
          <strong>{notebookFacts.testLoss.toFixed(4)}</strong>
          <small>Lower is better · from model.evaluate()</small>
        </article>
        <article className="bi-metric-card">
          <div className="bi-metric-card__top"><span>MACRO F1</span><Layers3 size={16} /></div>
          <strong>{percent(notebookFacts.macroF1)}</strong>
          <small>Mean F1 across the five labels</small>
        </article>
        <article className="bi-metric-card">
          <div className="bi-metric-card__top"><span>DATASET</span><Database size={16} /></div>
          <strong>{notebookFacts.datasetImages.toLocaleString()}</strong>
          <small>Images in the notebook dataset</small>
        </article>
      </div>

      <div className="bi-performance-grid">
        <section className="bi-panel bi-performance-card" aria-labelledby="class-performance-title">
          <div className="bi-panel-heading bi-panel-heading--row">
            <div>
              <div className="bi-eyebrow"><span className="bi-eyebrow__line" /> CLASS-LEVEL METRICS</div>
              <h3 id="class-performance-title">F1 by category</h3>
              <p>Notebook classification report · held-out test set</p>
            </div>
            <span className="bi-mini-tag">F1 SCORE</span>
          </div>
          <div className="bi-f1-list">
            {modelClasses.map((item) => (
              <div className="bi-f1-row" key={item.id}>
                <div className="bi-f1-row__label"><span className="bi-probability-dot" style={{ background: item.color }} /><span>{item.shortName}</span><small>n={item.count}</small></div>
                <div className="bi-f1-row__track" aria-label={`${item.shortName} F1 ${percent(item.f1)}`}><i style={{ width: `${item.f1 * 100}%`, background: `linear-gradient(90deg, ${item.color}88, ${item.color})` }} /></div>
                <strong>{percent(item.f1)}</strong>
              </div>
            ))}
          </div>
          <div className="bi-metric-legend"><span><i className="bi-legend-dot" /> F1 combines precision and recall</span><span>Support counts from test split</span></div>
        </section>

        <section className="bi-panel bi-confusion-card" aria-labelledby="confusion-title">
          <div className="bi-panel-heading bi-panel-heading--row">
            <div>
              <div className="bi-eyebrow"><span className="bi-eyebrow__line" /> PREDICTION PATTERN</div>
              <h3 id="confusion-title">Confusion matrix</h3>
              <p>Rows = true · columns = predicted</p>
            </div>
            <span className="bi-mini-tag">1,841 TEST</span>
          </div>
          <div className="bi-confusion-wrap">
            <table className="bi-confusion-table">
              <caption className="bi-visually-hidden">Notebook test set confusion matrix, with rows as true class and columns as predicted class</caption>
              <thead>
                <tr><th scope="col"><span className="bi-visually-hidden">True class / predicted class</span></th>{modelClasses.map((item) => <th scope="col" key={item.id}>{item.shortName}</th>)}</tr>
              </thead>
              <tbody>
                {confusionMatrix.map((row, rowIndex) => (
                  <tr key={modelClasses[rowIndex].id}>
                    <th scope="row">{modelClasses[rowIndex].shortName}</th>
                    {row.map((value, columnIndex) => {
                      const correct = rowIndex === columnIndex;
                      const strength = value === 0 ? 0 : 0.12 + (value / maxCell) * 0.78;
                      return (
                        <td key={`${rowIndex}-${columnIndex}`}>
                          <span
                            className={correct ? "is-correct" : value ? "is-miss" : ""}
                            style={{ backgroundColor: value ? correct ? `rgba(34, 211, 238, ${strength})` : `rgba(255, 184, 106, ${Math.min(0.52, strength + 0.12)})` : undefined }}
                            aria-label={`${modelClasses[rowIndex].shortName} true, ${modelClasses[columnIndex].shortName} predicted: ${value}`}
                          >{value}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bi-matrix-legend"><span><i className="bi-legend-dot bi-legend-dot--cyan" /> Correct</span><span><i className="bi-legend-dot bi-legend-dot--amber" /> Misclassified</span></div>
        </section>
      </div>

      <section className="bi-panel bi-class-table" aria-labelledby="detail-metrics-title">
        <div className="bi-panel-heading bi-panel-heading--row">
          <div>
            <div className="bi-eyebrow"><span className="bi-eyebrow__line" /> TEST REPORT</div>
            <h3 id="detail-metrics-title">The detail behind the headline</h3>
            <p>Every class, including the smaller categories.</p>
          </div>
          <span className="bi-mini-tag">PRECISION · RECALL · F1</span>
        </div>
        <div className="bi-table-scroll">
          <table className="bi-metrics-table">
            <caption className="bi-visually-hidden">Per-class precision, recall, F1 and support from the notebook’s held-out test split</caption>
            <thead><tr><th scope="col">CLASS</th><th scope="col">PRECISION</th><th scope="col">RECALL</th><th scope="col">F1-SCORE</th><th scope="col">SUPPORT</th></tr></thead>
            <tbody>{modelClasses.map((item) => (
              <tr key={item.id}>
                <th scope="row"><span className="bi-class-label"><i style={{ background: item.color }} />{item.name}</span></th>
                <td>{item.precision.toFixed(4)}</td>
                <td>{item.recall.toFixed(4)}</td>
                <td className="bi-table-strong">{item.f1.toFixed(4)}</td>
                <td className="bi-table-muted">{item.count.toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <div className="bi-method-heading">
        <div>
          <div className="bi-eyebrow"><span className="bi-eyebrow__line" /> HOW IT WAS BUILT</div>
          <h3>From image to evaluation</h3>
        </div>
        <span className="bi-method-caption">DETAILS FROM THE COLAB NOTEBOOK</span>
      </div>
      <div className="bi-method-grid">
        {methodologySteps.map((step) => (
          <article className="bi-method-card" key={step.number}>
            <span className="bi-method-card__number">{step.number}</span>
            <h4>{step.title}</h4>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>
      <div className="bi-method-note"><ShieldAlert size={16} /><span>Strong notebook metrics do not establish clinical performance on new sites, scanners, populations or individual scans. The checkpoint and attention maps were not included in the upload.</span></div>
    </>
  );
}
