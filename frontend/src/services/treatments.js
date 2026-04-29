export const TREATMENTS = {
  TRT_APPLE_SCAB_001: {
    name: 'Apple Scab Treatment',
    name_fr: 'Tavelure / Points Noirs',
    steps: [
      'Ramasser et détruire toutes les feuilles et fruits infectés au sol.',
      'Appliquer un fongicide (captane ou myclobutanil) toutes les 7 à 10 jours par temps humide.',
      'Tailler les arbres pour améliorer la circulation de l\'air.',
      'Appliquer un fongicide préventif au début du printemps avant le débourrement.',
    ],
    prevention: 'Planter des variétés résistantes à la tavelure. Ramasser les feuilles tombées chaque automne.',
    urgency: 'moderate',
  },
  TRT_APPLE_BLACK_ROT_001: {
    name: 'Black Rot Treatment',
    name_fr: 'Pourriture Noire',
    steps: [
      'Tailler toutes les branches infectées à 15 cm sous les symptômes visibles.',
      'Retirer immédiatement les fruits momifiés de l\'arbre et du sol.',
      'Appliquer un fongicide à base de cuivre après la taille et 2 semaines plus tard.',
      'Désinfecter les outils de taille avec de l\'alcool à 70% entre chaque coupe.',
    ],
    prevention: 'Éviter de laisser du bois mort sur l\'arbre. Assurer une bonne circulation de l\'air par une taille régulière.',
    urgency: 'high',
  },
  TRT_FLETRISSEMENT_001: {
    name: 'Wilting Treatment',
    name_fr: 'Flétrissement',
    steps: [
      'Vérifier l\'irrigation — arroser en profondeur mais pas en excès.',
      'Tailler les rameaux flétris jusqu\'au bois sain et désinfecter les outils.',
      'Appliquer un fongicide systémique si le flétrissement est d\'origine fongique.',
      'Amender le sol avec du compost pour améliorer le drainage.',
    ],
    prevention: 'Maintenir un arrosage régulier. Éviter les blessures aux racines lors des travaux du sol.',
    urgency: 'high',
  },
  TRT_MOISISSURE_001: {
    name: 'Mold Treatment',
    name_fr: 'Moisissure (Botrytis)',
    steps: [
      'Retirer et détruire tous les fruits et feuilles atteints de moisissure.',
      'Appliquer un fongicide à base de soufre ou de Botryticide homologué.',
      'Tailler pour améliorer la ventilation et réduire l\'humidité dans le feuillage.',
      'Éviter les arrosages sur le feuillage — arroser uniquement à la base.',
    ],
    prevention: 'Éviter l\'excès d\'azote. Récolter les fruits à maturité sans les laisser sur l\'arbre.',
    urgency: 'moderate',
  },
  TRT_MOMIFICATION_001: {
    name: 'Mummification Treatment',
    name_fr: 'Momification des Fruits',
    steps: [
      'Retirer TOUS les fruits momifiés accrochés à l\'arbre — ils sont source d\'infection.',
      'Ramasser et détruire les fruits momifiés au sol.',
      'Appliquer un fongicide à base de cuivre en fin d\'hiver avant le débourrement.',
      'Tailler les rameaux porteurs de fruits momifiés.',
    ],
    prevention: 'Récolter les fruits à temps. Ne jamais laisser de fruits sur l\'arbre en hiver.',
    urgency: 'high',
  },
  TRT_POURRITURE_AMERE_001: {
    name: 'Bitter Rot Treatment',
    name_fr: 'Pourriture Amère',
    steps: [
      'Retirer et détruire tous les fruits atteints immédiatement.',
      'Appliquer un fongicide (captane ou mancozèbe) dès les premiers symptômes.',
      'Tailler le bois mort qui héberge le champignon.',
      'Effectuer des traitements préventifs de juillet à la récolte.',
    ],
    prevention: 'Éviter les blessures sur les fruits. Maintenir une bonne hygiène au verger.',
    urgency: 'high',
  },
  TRT_POURRITURE_BRUNE_001: {
    name: 'Brown Rot Treatment',
    name_fr: 'Pourriture Brune',
    steps: [
      'Retirer tous les fruits pourris de l\'arbre et du sol sans délai.',
      'Appliquer un fongicide systémique (tébuconazole ou cyprodinyl).',
      'Tailler les rameaux infectés et désinfecter les outils.',
      'Répéter le traitement fongicide 10 jours plus tard si la pression est forte.',
    ],
    prevention: 'Éviter les blessures aux fruits (insectes, grêle). Assurer une bonne aération du verger.',
    urgency: 'high',
  },
  TRT_POURRITURE_MOLLE_001: {
    name: 'Soft Rot Treatment',
    name_fr: 'Pourriture Molle',
    steps: [
      'Retirer et éliminer immédiatement tous les fruits à pourriture molle.',
      'Réduire l\'humidité excessive — améliorer le drainage du sol.',
      'Appliquer un bactéricide à base de cuivre si d\'origine bactérienne.',
      'Éviter les blessures aux fruits lors de la récolte et du stockage.',
    ],
    prevention: 'Ne pas stocker des fruits blessés ou abîmés. Maintenir une hygiène stricte au verger.',
    urgency: 'moderate',
  },
};

export const CLASS_TO_TREATMENT = {
  'Fresh':            null,
  'Tavelure/Points':  'TRT_APPLE_SCAB_001',
  'Pourriture Noire': 'TRT_APPLE_BLACK_ROT_001',
  'Fletrissement':    'TRT_FLETRISSEMENT_001',
  'Moisissure':       'TRT_MOISISSURE_001',
  'Momification':     'TRT_MOMIFICATION_001',
  'Pourriture Amere': 'TRT_POURRITURE_AMERE_001',
  'Pourriture Brune': 'TRT_POURRITURE_BRUNE_001',
  'Pourriture molle': 'TRT_POURRITURE_MOLLE_001',
};

export const URGENCY_COLORS = {
  low:      { bg: '#dcfce7', text: '#166534', label: 'Urgence Faible' },
  moderate: { bg: '#fef9c3', text: '#854d0e', label: 'Urgence Modérée' },
  high:     { bg: '#fee2e2', text: '#991b1b', label: 'Urgence Élevée' },
};

export function getTreatment(treatmentId) {
  if (!treatmentId) return null;
  return TREATMENTS[treatmentId] || null;
}

export function getTreatmentByClass(className) {
  const id = CLASS_TO_TREATMENT[className];
  return id ? TREATMENTS[id] : null;
}