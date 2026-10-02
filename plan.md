# BrainInsight — implementation and design plan

## Product scope and technical approach

Create a complete, responsive React interface for the MRI-classification project, using the supplied Colab notebook as the source of truth. The initialized project is a React 19, TypeScript, Vite and Tailwind static web app with its managed server and database disabled; keep this deliverable static and client-side. Do not add a backend or invent a live prediction integration.

The notebook describes an EfficientNetB0 classifier trained on 224 × 224 RGB images in five label classes (`alzheimer`, `multiple_sclerosis`, `normal`, `stroke`, `tumor`), with a stratified 70/15/15 split. It reports 12,267 total dataset images (8,586 train / 1,840 validation / 1,841 test), final test accuracy 98.4791%, test loss 0.0440, and class-level precision/recall/F1 on the 1,841-image test set. Its model checkpoint path is in Colab Drive, but no `.keras` checkpoint was uploaded. Therefore, the website must distinguish notebook test-set performance from an individual live scan: accept and preview supported image files locally, but clearly state that this build has no connected inference weights and cannot produce a real prediction. Never show a fabricated per-scan diagnosis or confidence. Keep result slots, loading/error/unavailable/retry/replace states designed for later model integration. The PDF is a notebook-evaluation summary and must explicitly say that no individual scan result was generated.

Implement one dashboard route (`/`) with accessible in-page navigation and sections for overview, scan analysis, model performance, methodology, and disease education. Support drag-and-drop plus file picker for the training-compatible image formats (`.jpg`, `.jpeg`, `.png`, `.bmp`, `.webp`); validate type/size, preview the selected image with a revocable object URL, provide errors and replace/retry controls, and keep processing browser-local in this preview. Include an explicit note that DICOM is not supported by the notebook image pipeline. Download a real PDF using a browser-side PDF library; it can summarize notebook-derived metrics, methodology and source-linked disease references without upload or server state.

## Confirmed visual direction: Clinical Aurora

- **Design movement:** cinematic clinical research interface with restrained sci-fi atmosphere; prioritize scientific clarity over hospital-themed ornament.
- **Core principles:** (1) evidence before spectacle, (2) clear status and provenance, (3) progressive disclosure of technical detail, (4) keyboard-accessible, responsive interactions.
- **Color philosophy:** anchor on the selected graphite navy `#111827`, with layered midnight surfaces; the selected cyan `#22D3EE` is the recognizable analysis signal, violet is a secondary depth accent, and cool high-contrast neutrals carry reading and metrics. Use amber/red only for attention/error states, never to imply disease severity.
- **Layout paradigm:** compact left navigation rail and wide, asymmetric work surface; foreground the current workflow and scan preview, with evaluation and education as scrollable research panels rather than a uniform centered card grid.
- **Signature elements:** a thin cyan scan halo, fine imaging-grid dividers, and translucent layered panels with subtle violet edge light. The MRI artwork is explicitly labeled illustrative and must never look like the current user's inference result.
- **Interaction philosophy:** calm, reversible actions; keep image-locality and missing-model status visible; provide direct upload, replace, retry and report actions; distinguish model facts from user scan states.
- **Animation:** restrained 180–320 ms fades/slide transitions, subtle idle halo and upload progress only; no flashing or alarm-like animation; honor `prefers-reduced-motion` and preserve focus after state changes.
- **Typography system:** Manrope for headings and body, with a compact system monospace for identifiers, percentages and status metadata; use clear size/weight hierarchy and comfortable line height.
- **Brand essence:** a transparent MRI-classification research companion that makes notebook evidence understandable without claiming to diagnose; **precise, curious, grounded**.
- **Brand voice:** concise, curious and evidence-aware. Example lines: “Read the signal. Keep the context.” “A model output is a starting point—not a diagnosis.”
- **Wordmark & logo:** a bespoke, compact brain/scan-ring mark paired with the BrainInsight wordmark; keep it as a simple vector/SVG symbol that remains legible in the sidebar and small favicon sizes.
- **Signature brand color:** cyan `#22D3EE`, used for navigation focus, scan framing and primary actions rather than every decorative surface.

## Project structure

- `client/src/pages/Home.tsx` — single dashboard shell, section navigation, overview and interaction-state composition.
- `client/src/components/brainInsight/` — focused UI modules for the scan uploader/viewer, model-status/result panel, evaluation dashboard and disease-reference cards.
- `client/src/lib/brainInsightData.ts` — typed notebook-derived labels, split sizes, training facts, test metrics, exact confusion matrix and sourced educational copy; maintain source links with the copy.
- `client/src/lib/createPdfReport.ts` — browser-side PDF generation for the notebook evaluation summary; no individual output unless a future model integration supplies one.
- `client/src/index.css` — Clinical Aurora theme, responsive layout, accessible contrast/focus states, motion rules and reduced-motion handling.
- `client/public/manus-routes.json` — route manifest containing the single `/` page before dev-server startup.
- `client/index.html` — title, description and Manrope font declaration.
- `app.config.ts` — literal durable HTTPS `logoUrl` for the project branding metadata before checkpointing.

## Material limits

- The notebook and its outputs are available, but the training images, existing UI source, `.keras` checkpoint and any attention/Grad-CAM output are not. Do not claim to modify the unavailable original code, do not run inference, and do not display an actual per-scan class/confidence until a real model artifact and inference path are provided.
- Present test-set metrics as reported notebook results, not as clinical validation or guaranteed performance on new scans. Keep the test split provenance and the non-diagnostic limitation visible near performance and result areas.
- No website publication is requested; deliver a working preview and do not publish publicly.


## Verified disease-card references

The accessible educational summaries will cite these independently verified sources: the U.S. National Institute on Aging, [How Is Alzheimer's Disease Diagnosed?](https://www.nia.nih.gov/health/alzheimers-symptoms-and-diagnosis/how-alzheimers-disease-diagnosed); the U.S. National Institute of Neurological Disorders and Stroke, [Multiple Sclerosis (MS)](https://www.ninds.nih.gov/health-information/disorders/multiple-sclerosis-ms); MedlinePlus, [Stroke](https://medlineplus.gov/stroke.html); and the U.S. National Cancer Institute, [Adult Central Nervous System Tumors Treatment (PDQ®)–Patient Version](https://www.cancer.gov/types/brain/patient/adult-brain-treatment-pdq). The `normal` reference card is explained strictly as a label found in the user-supplied notebook’s dataset, not a diagnosis; it does not claim a normal result rules out disease.
