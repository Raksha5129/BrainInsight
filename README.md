# BrainInsight — VS Code quick start

BrainInsight is a React research dashboard for exploring a five-class brain MRI classifier. This build includes the interface, notebook evaluation results, educational category notes, and a local image preview. **It does not run MRI inference** because the `.keras` model checkpoint and an inference API were not included.

## Requirements

- **Visual Studio Code**
- **Node.js 22 LTS** (22.12 or newer recommended; Node 20.19 or newer also works with Vite 7)
- **pnpm 10.18.0**

Install the pinned package manager if necessary:

```bash
npm install --global pnpm@10.18.0
```

Alternatively, if Corepack is available with your Node.js installation:

```bash
corepack enable
corepack prepare pnpm@10.18.0 --activate
```

## Open and run

1. Download and extract the BrainInsight project ZIP.
2. In VS Code, choose **File → Open Folder…** and select the extracted folder that contains `package.json`.
3. Open **Terminal → New Terminal** and confirm the tools:

   ```bash
   node --version
   pnpm --version
   ```

4. Install dependencies, then start the static development site:

   ```bash
   pnpm install --frozen-lockfile
   pnpm dev:static
   ```

5. Open **http://localhost:3000** in your browser. Keep the terminal running while you use the site; press **Ctrl+C** to stop it.

No `.env` file, database, or backend service is required for this UI preview. The development command is cross-platform and uses port `3000` by default; if `PORT` is set in your environment, Vite uses that port instead.

## Useful commands

```bash
pnpm check          # TypeScript checks
pnpm build:static   # Create a production static build in dist/public
```

## What the MRI controls do in this build

- The uploader accepts JPG/JPEG, PNG, BMP, or WEBP images up to 20 MB.
- A chosen file is previewed locally in the browser; it is **not uploaded** by this app.
- DICOM files are not supported by the notebook’s 224 × 224 RGB image pipeline.
- The “Check model” control confirms that inference weights are unavailable. **No per-scan prediction or confidence is generated.**
- The 98.48% accuracy and other metrics shown on the dashboard are from the notebook’s held-out test set; they are not a result for a new image or clinical validation.

To add real inference later, provide the trained `BrainInsight_Final_v2.keras` checkpoint and implement a secure inference service that performs the notebook’s preprocessing and returns the five-class probabilities. Keep patient scans and model files out of the public frontend asset folder.
