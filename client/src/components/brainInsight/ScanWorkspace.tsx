import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowUpRight, Check, ChevronRight, CircleHelp, CloudOff, Download, FileImage, ImagePlus, LoaderCircle, LockKeyhole, RefreshCw, ScanLine, ShieldCheck, Upload, X } from "lucide-react";
import { modelClasses } from "@/lib/brainInsightData";
import { downloadScanReport } from "@/lib/createPdfReport";

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "bmp", "webp"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

type AnalysisState = "idle" | "checking" | "success" | "unavailable";

type PredictionResult = {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
};

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeProbabilityKey(value: string) {
  return value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "");
}

function getProbability(result: PredictionResult | null, item: (typeof modelClasses)[number]) {
  if (!result?.probabilities) return null;
  const candidates = [item.shortName, item.name, item.id, item.id.replace("_", " ")];
  const entries = Object.entries(result.probabilities);
  for (const candidate of candidates) {
    const match = entries.find(([key]) => normalizeProbabilityKey(key) === normalizeProbabilityKey(candidate));
    if (match) {
      const numeric = typeof match[1] === "number" ? match[1] : Number(match[1]);
      return Number.isFinite(numeric) ? numeric : null;
    }
  }
  return null;
}

export default function ScanWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, [previewUrl]);

  const validateAndSet = (candidate?: File) => {
    if (!candidate) return;
    const extension = candidate.name.split(".").pop()?.toLowerCase() ?? "";
    const imageLike = candidate.type.startsWith("image/") || ACCEPTED_EXTENSIONS.includes(extension);
    if (!imageLike || !ACCEPTED_EXTENSIONS.includes(extension)) {
      setError("This preview accepts JPG, JPEG, PNG, BMP or WEBP image files. DICOM files are not supported by the notebook pipeline.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setError("Choose an image smaller than 20 MB for this browser preview.");
      return;
    }
    setError("");
    setFile(candidate);
    setResult(null);
    setAnalysisState("idle");
  };

  const handleAnalyze = async () => {
    if (!file) {
      inputRef.current?.click();
      return;
    }

    setError("");
    setResult(null);
    setAnalysisState("checking");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const apiBase = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
      const response = await fetch(`${apiBase}/api/predict`, { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Inference request failed.");
      setResult(payload);
      setAnalysisState("success");
    } catch (err) {
      setAnalysisState("unavailable");
      setError(err instanceof Error ? err.message : "Could not connect to the local inference service.");
    }
  };

  const handleDownloadReport = async () => {
    if (!file || !result) return;
    setError("");
    setIsReportGenerating(true);
    try {
      await downloadScanReport(file, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the scan report.");
    } finally {
      setIsReportGenerating(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    setResult(null);
    setAnalysisState("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="bi-analysis-layout">
      <section className="bi-panel bi-scan-panel" aria-labelledby="scan-heading">
        <div className="bi-panel-heading">
          <div>
            <div className="bi-eyebrow"><span className="bi-eyebrow__line" /> SCAN WORKSPACE</div>
            <h3 id="scan-heading">Bring a scan into focus</h3>
            <p>Upload an MRI image to the local BrainInsight inference service. The image is processed on your machine.</p>
          </div>
          <span className="bi-panel-index">01 / 02</span>
        </div>

        <input
          ref={inputRef}
          className="bi-visually-hidden"
          type="file"
          accept=".jpg,.jpeg,.png,.bmp,.webp,image/jpeg,image/png,image/bmp,image/webp"
          onChange={(event) => validateAndSet(event.target.files?.[0])}
          aria-label="Choose a brain MRI image"
        />

        {!file ? (
          <button
            type="button"
            className={`bi-dropzone${dragging ? " is-dragging" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); validateAndSet(event.dataTransfer.files?.[0]); }}
            aria-describedby="scan-format-note"
          >
            <span className="bi-dropzone__icon"><ImagePlus size={21} strokeWidth={1.7} /></span>
            <strong>Drop an image to preview</strong>
            <span className="bi-dropzone__sub">or browse your device</span>
            <span className="bi-dropzone__button"><Upload size={15} /> Choose MRI image</span>
            <small id="scan-format-note">JPG · PNG · BMP · WEBP <span>·</span> max 20 MB</small>
          </button>
        ) : (
          <div className="bi-image-viewer">
            <div className="bi-image-viewer__chrome">
              <span><span className="bi-live-dot" /> LOCAL IMAGE</span>
              <button type="button" className="bi-icon-button" onClick={clearFile} aria-label="Remove selected image"><X size={16} /></button>
            </div>
            <div className="bi-image-viewer__image">
              {previewUrl && <img src={previewUrl} alt={`Local preview of ${file.name}`} />}
              <span className="bi-image-viewer__corner bi-image-viewer__corner--tl" />
              <span className="bi-image-viewer__corner bi-image-viewer__corner--tr" />
              <span className="bi-image-viewer__corner bi-image-viewer__corner--bl" />
              <span className="bi-image-viewer__corner bi-image-viewer__corner--br" />
              <span className="bi-image-viewer__scale">224 × 224 INPUT TARGET</span>
            </div>
            <div className="bi-image-viewer__meta">
              <span className="bi-file-icon"><FileImage size={15} /></span>
              <span className="bi-file-name"><strong title={file.name}>{file.name}</strong><small>{formatSize(file.size)} · stays in this browser</small></span>
              <button type="button" className="bi-text-button" onClick={() => inputRef.current?.click()}>Replace</button>
            </div>
          </div>
        )}

        {error && <div className="bi-inline-error" role="alert"><AlertCircle size={16} /> {error}</div>}

        <div className="bi-scan-panel__footer">
          <div className="bi-privacy-note"><LockKeyhole size={14} /><span>Local preview only · no upload or inference</span></div>
          <button type="button" className="bi-button bi-button--primary" onClick={handleAnalyze}>
            {analysisState === "checking" ? <><LoaderCircle className="bi-spin" size={16} /> Checking…</> : <>Analyze MRI <ChevronRight size={16} /></>}
          </button>
        </div>
        <div className="bi-format-footnote"><CircleHelp size={13} /> EfficientNetB0 expects a 2D RGB image resized to 224 × 224. DICOM is not supported.</div>
      </section>

      <section className="bi-panel bi-result-panel" aria-labelledby="result-heading">
        <div className="bi-panel-heading">
          <div>
            <div className="bi-eyebrow"><span className="bi-eyebrow__line" /> MODEL OUTPUT</div>
            <h3 id="result-heading">Classification result</h3>
            <p>BrainInsight v2 · EfficientNetB0</p>
          </div>
          <span className={`bi-result-lock${analysisState === "success" ? " bi-result-lock--ready" : ""}`}>
            {analysisState === "success" ? <><Check size={14} /> LIVE LOCAL</> : <><CloudOff size={14} /> READY</>}
          </span>
        </div>

        <div className={`bi-result-empty${analysisState === "checking" ? " is-checking" : ""}`} aria-live="polite">
          {analysisState === "checking" ? (
            <>
              <div className="bi-result-empty__orb"><LoaderCircle className="bi-spin" size={23} /></div>
              <strong>Analyzing MRI</strong>
              <span>Running the uploaded image through the local EfficientNetB0 checkpoint.</span>
              <div className="bi-check-progress"><i /></div>
            </>
          ) : analysisState === "unavailable" ? (
            <>
              <div className="bi-result-empty__orb bi-result-empty__orb--warn"><CloudOff size={21} /></div>
              <strong>Inference unavailable</strong>
              <span>Start the Python inference service and make sure the model is inside <code>backend/model/</code>.</span>
              <button type="button" className="bi-text-button bi-text-button--bright" onClick={handleAnalyze}><RefreshCw size={14} /> Try again</button>
            </>
          ) : result ? (
            <>
              <div className="bi-result-empty__orb"><Check size={22} /></div>
              <strong>{result.prediction}</strong>
              <span>Model confidence: <b>{(result.confidence * 100).toFixed(2)}%</b></span>
            </>
          ) : (
            <>
              <div className="bi-result-empty__orb"><ScanLine size={22} /></div>
              <strong>Ready for analysis</strong>
              <span>Upload an MRI image and run local inference. Your prediction will appear here.</span>
              {!file && <button type="button" className="bi-text-button bi-text-button--bright" onClick={() => inputRef.current?.click()}>Choose an image <ArrowUpRight size={14} /></button>}
            </>
          )}
        </div>

        <div className="bi-probability-list" aria-label="Prediction probabilities">
          {modelClasses.map((item) => {
            const safeValue = getProbability(result, item);
            return (
              <div className="bi-probability-row" key={item.id}>
                <span className="bi-probability-dot" style={{ background: item.color }} />
                <span className="bi-probability-name">{item.shortName}</span>
                <span className="bi-probability-track"><i style={{ width: `${safeValue ? safeValue * 100 : 0}%`, background: item.color }} /></span>
                <span className="bi-probability-value">{safeValue === null ? "—" : `${(safeValue * 100).toFixed(2)}%`}</span>
              </div>
            );
          })}
        </div>
        <div className="bi-result-disclaimer"><ShieldCheck size={15} /><span>Research interface only. The prediction is not a medical diagnosis.</span></div>
        {result && file && (
          <button type="button" className="bi-report-button" onClick={handleDownloadReport} disabled={isReportGenerating}>
            {isReportGenerating ? <LoaderCircle className="bi-spin" size={15} /> : <Download size={15} />}
            {isReportGenerating ? "Preparing report…" : "Download scan report"}
          </button>
        )}
        <div className="bi-result-footnote"><Check size={13} /> Model input: 224 × 224 RGB · local inference service</div>
      </section>

      <div className="bi-analysis-banner">
        <span className="bi-analysis-banner__icon"><ShieldCheck size={17} /></span>
        <p><strong>Research use only.</strong> The 98.48% shown elsewhere is notebook test-set accuracy, not a result for this image or a guarantee on new scans.</p>
      </div>
    </div>
  );
}
