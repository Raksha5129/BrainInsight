 # 🧠 BrainInsight

### AI-Assisted Multiclass Brain MRI Analysis using EfficientNetB0

BrainInsight is an AI-assisted brain MRI analysis system designed to classify MRI images into five neurological categories using a deep learning model based on **EfficientNetB0**.

The project combines a modern React interface with a local Flask inference service, allowing users to upload an MRI scan, receive a model prediction, view class probabilities, and generate a downloadable scan report.

> **Research / Educational Use Only:** BrainInsight is a student research project and is not intended to provide medical diagnosis, treatment recommendations, or replace evaluation by qualified healthcare professionals.

---

## ✨ Features

* 🧠 **Multiclass MRI Classification**
* 🤖 EfficientNetB0-based deep learning model
* 📊 Probability distribution across all five classes
* 🖼️ MRI image preview
* ⚡ Local model inference using Flask
* 💻 Modern React + TypeScript interface
* 📄 Downloadable individual scan reports
* 📈 Model performance and insights dashboard
* 📚 Disease information library
* 🔒 Model runs locally rather than exposing the model through the frontend
* 📱 Responsive dark medical/research interface

---

## 🎯 Supported Classes

BrainInsight currently predicts five classes:

| Class              | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| Alzheimer          | MRI patterns associated with Alzheimer's classification dataset |
| Brain Tumor        | Brain MRI tumor classification                                  |
| Multiple Sclerosis | MRI classification associated with MS                           |
| Normal             | Normal/non-disease MRI images                                   |
| Stroke             | Stroke-related MRI classification                               |

---

## 🧠 Model

BrainInsight uses an **ImageNet-pretrained EfficientNetB0** backbone.

## 🏗️ System Architecture

BrainInsight uses a local client–server architecture where the React application communicates with a Flask inference API that loads the trained EfficientNetB0 model.

```mermaid
flowchart LR
    A["👤 User"] --> B["🖥️ React + TypeScript UI"]

    B -->|"Upload MRI"| C["⚙️ Flask Inference API"]

    C --> D["🖼️ Image Preprocessing"]
    D --> E["🧠 EfficientNetB0"]
    E --> F["📊 Softmax Prediction"]

    F -->|"Prediction + Probabilities"| C
    C --> B

    B --> G["📄 PDF Scan Report"]

    H["📦 BrainInsight_Final_v2.keras"] --> E

## 📊 Model Performance

The final model was evaluated on a held-out test set of **1,841 MRI images**.

| Metric            |     Result |
| ----------------- | ---------: |
| Test Accuracy     | **98.48%** |
| Test Loss         | **0.0440** |
| Macro F1-Score    | **98.00%** |
| Weighted F1-Score | **98.48%** |
| Test Images       |  **1,841** |

### Dataset

The final dataset contains **12,267 images**:

| Class              |     Images |
| ------------------ | ---------: |
| Alzheimer          |      4,500 |
| Brain Tumor        |      4,200 |
| Multiple Sclerosis |      1,411 |
| Normal             |      1,400 |
| Stroke             |        756 |
| **Total**          | **12,267** |

The dataset was organized and processed before model training, followed by a stratified train/validation/test split.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User / UI       │
                    │   React + TypeScript │
                    └──────────┬───────────┘
                               │
                               │ MRI Upload
                               ▼
                    ┌──────────────────────┐
                    │   Flask Backend      │
                    │   Local Inference    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   EfficientNetB0     │
                    │  BrainInsight Model  │
                    └──────────┬───────────┘
                               │
                               ▼
                 ┌─────────────────────────────┐
                 │ Prediction + Class          │
                 │ Probabilities               │
                 └─────────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     React UI         │
                    │ Results + Report     │
                    └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Lucide Icons
* Recharts
* jsPDF

### Backend

* Python
* Flask
* TensorFlow
* Keras
* NumPy
* Pillow

### Machine Learning

* EfficientNetB0
* Transfer Learning
* ImageNet pretrained weights
* Stratified dataset splitting
* Class-weighted training
* Softmax multiclass classification

---

## 📁 Project Structure

```text
BrainInsight/
│
├── backend/
│   ├── model/
│   │   ├── BrainInsight_Final_v2.keras
│   │   └── BrainInsight_v2_metadata.json
│   │
│   ├── app.py
│   ├── requirements.txt
│   └── run_windows.bat
│
├── client/
│   └── src/
│       ├── components/
│       │   └── brainInsight/
│       │       ├── Brand.tsx
│       │       ├── ScanWorkspace.tsx
│       │       ├── DiseaseLibrary.tsx
│       │       └── ModelInsights.tsx
│       │
│       └── lib/
│           ├── brainInsightData.ts
│           └── createPdfReport.ts
│
├── server/
├── shared/
├── package.json
├── package-lock.json
├──
```
