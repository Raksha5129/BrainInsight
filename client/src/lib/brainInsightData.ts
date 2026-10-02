export type ModelClass = {
  id: string;
  name: string;
  shortName: string;
  count: number;
  precision: number;
  recall: number;
  f1: number;
  color: string;
};

export type DiseaseInsight = {
  id: string;
  title: string;
  summary: string;
  mriContext: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceNote?: string;
};

export const modelClasses: ModelClass[] = [
  { id: "alzheimer", name: "Alzheimer’s disease", shortName: "Alzheimer", count: 675, precision: 1, recall: 1, f1: 1, color: "#22d3ee" },
  { id: "multiple_sclerosis", name: "Multiple sclerosis", shortName: "MS", count: 212, precision: 0.9767, recall: 0.9906, f1: 0.9836, color: "#9b8cff" },
  { id: "normal", name: "Normal / healthy reference", shortName: "Normal", count: 210, precision: 0.9306, recall: 0.9571, f1: 0.9437, color: "#73e1b4" },
  { id: "stroke", name: "Stroke", shortName: "Stroke", count: 114, precision: 0.9828, recall: 1, f1: 0.9913, color: "#ffb86a" },
  { id: "tumor", name: "Brain tumor", shortName: "Tumor", count: 630, precision: 0.9903, recall: 0.973, f1: 0.9816, color: "#ff8bb3" },
];

// Rows are true labels; columns are predicted labels in the same order as modelClasses.
export const confusionMatrix = [
  [675, 0, 0, 0, 0],
  [0, 210, 1, 0, 1],
  [0, 3, 201, 1, 5],
  [0, 0, 0, 114, 0],
  [0, 2, 14, 1, 613],
];

export const notebookFacts = {
  modelName: "BrainInsight_Final_v2.keras",
  architecture: "EfficientNetB0",
  inputSize: "224 × 224 px",
  inputChannels: "3-channel RGB",
  datasetImages: 12_267,
  trainImages: 8_586,
  validationImages: 1_840,
  testImages: 1_841,
  testAccuracy: 0.984791,
  testLoss: 0.044,
  validationAccuracy: 0.9853,
  validationLoss: 0.04618,
  macroF1: 0.98,
  weightedF1: 0.9848,
  epochs: 10,
  split: "Stratified 70 / 15 / 15",
  optimizer: "Adam · learning rate 0.001",
  objective: "Sparse categorical cross-entropy",
  augmentation: "Horizontal flip · rotation · zoom (training split only)",
  checkpointAvailable: false,
  attentionMapsAvailable: false,
};

export const diseaseInsights: DiseaseInsight[] = [
  {
    id: "alzheimer",
    title: "Alzheimer’s disease",
    summary: "A brain disorder that gradually affects memory and thinking. It may also affect problem-solving, attention, language and everyday activities.",
    mriContext: "MRI can be one part of a broader clinical evaluation or help consider other causes; it is not a stand-alone diagnosis.",
    sourceTitle: "National Institute on Aging · How Is Alzheimer's Disease Diagnosed?",
    sourceUrl: "https://www.nia.nih.gov/health/alzheimers-symptoms-and-diagnosis/how-alzheimers-disease-diagnosed",
  },
  {
    id: "multiple_sclerosis",
    title: "Multiple sclerosis",
    summary: "A chronic disorder of the central nervous system. In MS, the immune system attacks myelin around nerve fibers; the resulting changes and course vary.",
    mriContext: "MRI of the brain or spinal cord may help clinicians look for lesions as part of a wider evaluation; no single test diagnoses MS.",
    sourceTitle: "NINDS · Multiple Sclerosis (MS)",
    sourceUrl: "https://www.ninds.nih.gov/health-information/disorders/multiple-sclerosis-ms",
  },
  {
    id: "normal",
    title: "Normal / healthy reference",
    summary: "This is a label used by the supplied notebook’s image dataset. It is not a disease name or a medical finding about an individual.",
    mriContext: "A dataset label does not establish that a scan is healthy and should not be used to rule out disease.",
    sourceTitle: "BrainInsight training notebook · dataset class label",
    sourceNote: "The wording “normal” comes from the notebook’s class folder name.",
  },
  {
    id: "stroke",
    title: "Stroke",
    summary: "A stroke occurs when blood flow to part of the brain is interrupted, depriving brain cells of oxygen. The main types are ischemic and hemorrhagic.",
    mriContext: "Brain imaging, including CT or MRI, may be part of a provider’s evaluation; this card does not describe a stand-alone test.",
    sourceTitle: "MedlinePlus · Stroke",
    sourceUrl: "https://medlineplus.gov/stroke.html",
  },
  {
    id: "tumor",
    title: "Brain tumor",
    summary: "A central nervous system tumor is an abnormal growth of cells in the brain or spinal cord. Tumors vary; some are benign and others malignant.",
    mriContext: "MRI provides detailed brain images and may be used during evaluation. An image or model label alone does not establish a diagnosis.",
    sourceTitle: "National Cancer Institute · Adult CNS Tumors (Patient Version)",
    sourceUrl: "https://www.cancer.gov/types/brain/patient/adult-brain-treatment-pdq",
  },
];

export const methodologySteps = [
  { number: "01", title: "Stratified split", detail: "70% train · 15% validation · 15% held-out test" },
  { number: "02", title: "Image preparation", detail: "224 × 224 RGB resize; training-only flip, rotation and zoom" },
  { number: "03", title: "Classifier", detail: "ImageNet-pretrained EfficientNetB0 with a five-class softmax head" },
  { number: "04", title: "Evaluation", detail: "Held-out test metrics and per-class report; 1,841 test images" },
];
