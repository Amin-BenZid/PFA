/**
 * Local treatment database — maps treatment IDs to full descriptions.
 * Used to enrich the AI response with actionable advice for farmers.
 */
export const TREATMENTS = {
  TRT_APPLE_SCAB_001: {
    name: 'Apple Scab Treatment',
    name_fr: 'Traitement Tavelure du Pommier',
    steps: [
      'Remove and destroy all infected leaves and fruit from the ground.',
      'Apply a fungicide spray (captan or myclobutanil) every 7–10 days during wet weather.',
      'Prune trees to improve air circulation and reduce moisture.',
      'Apply preventive fungicide spray in early spring before bud break.',
    ],
    prevention: 'Plant scab-resistant apple varieties. Rake and remove fallen leaves each autumn.',
    urgency: 'moderate',
  },
  TRT_APPLE_BLACK_ROT_001: {
    name: 'Black Rot Treatment',
    name_fr: 'Traitement Pourriture Noire',
    steps: [
      'Prune all infected branches 15cm below visible symptoms.',
      'Remove mummified fruits from the tree and the ground immediately.',
      'Apply copper-based fungicide after pruning and again 2 weeks later.',
      'Disinfect pruning tools with 70% alcohol between cuts.',
    ],
    prevention: 'Avoid leaving dead wood on the tree. Ensure good air circulation through regular pruning.',
    urgency: 'high',
  },
  TRT_CEDAR_APPLE_RUST_001: {
    name: 'Cedar Apple Rust Treatment',
    name_fr: 'Traitement Rouille du Pommier',
    steps: [
      'Apply myclobutanil or propiconazole fungicide at the first sign of orange spots.',
      'Remove nearby juniper or cedar trees if possible — they host the fungus.',
      'Repeat fungicide application every 10 days during spring.',
      'Rake and dispose of fallen leaves.',
    ],
    prevention: 'Plant rust-resistant apple varieties. Keep distance between apple and cedar trees.',
    urgency: 'moderate',
  },
  TRT_POWDERY_MILDEW_001: {
    name: 'Powdery Mildew Treatment',
    name_fr: "Traitement Oïdium",
    steps: [
      'Apply sulfur-based or potassium bicarbonate fungicide immediately.',
      'Prune and destroy infected shoot tips.',
      'Avoid overhead irrigation — water at the base instead.',
      'Increase air circulation through thinning.',
    ],
    prevention: 'Avoid excess nitrogen fertilization. Plant resistant varieties.',
    urgency: 'moderate',
  },
  TRT_FROG_EYE_LEAF_SPOT_001: {
    name: 'Frog Eye Leaf Spot Treatment',
    name_fr: "Traitement Tache Œil de Grenouille",
    steps: [
      'Remove and destroy affected leaves promptly.',
      'Apply captan fungicide as a preventive spray.',
      'Ensure adequate tree nutrition — phosphorus and potassium deficiency worsens the disease.',
      'Avoid wetting the foliage when irrigating.',
    ],
    prevention: 'Maintain balanced fertilization. Clean up fallen leaves in autumn.',
    urgency: 'low',
  },
  TRT_ROTTEN_FRUIT_001: {
    name: 'Rotten Fruit Management',
    name_fr: 'Gestion des Pommes Pourries',
    steps: [
      'Remove all rotten fruit from the tree and ground immediately.',
      'Do not compost infected fruit — bag and dispose.',
      'Inspect remaining fruit and harvest any showing early signs of rot.',
      'Apply a post-harvest fungicide if rot is widespread.',
    ],
    prevention: 'Harvest fruit on time. Avoid mechanical damage during harvesting. Store in cool, dry conditions.',
    urgency: 'high',
  },
};

export const URGENCY_COLORS = {
  low:      { bg: '#dcfce7', text: '#166534', label: 'Low Urgency' },
  moderate: { bg: '#fef9c3', text: '#854d0e', label: 'Moderate Urgency' },
  high:     { bg: '#fee2e2', text: '#991b1b', label: 'High Urgency' },
};

export function getTreatment(treatmentId) {
  if (!treatmentId) return null;
  return TREATMENTS[treatmentId] || null;
}
