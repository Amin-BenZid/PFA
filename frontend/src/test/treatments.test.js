import { describe, it, expect } from 'vitest';
import { getTreatmentByClass, getTreatment, CLASS_TO_TREATMENT } from '../services/treatments';

describe('getTreatmentByClass', () => {
  it('returns null for Fresh (healthy apple)', () => {
    expect(getTreatmentByClass('Fresh')).toBeNull();
  });

  it('returns a treatment for Tavelure/Points', () => {
    const t = getTreatmentByClass('Tavelure/Points');
    expect(t).not.toBeNull();
    expect(t.name_fr).toBe('Tavelure / Points Noirs');
    expect(Array.isArray(t.steps)).toBe(true);
    expect(t.steps.length).toBeGreaterThan(0);
    expect(t.urgency).toBe('moderate');
  });

  it('returns a treatment for Pourriture Noire', () => {
    const t = getTreatmentByClass('Pourriture Noire');
    expect(t).not.toBeNull();
    expect(t.urgency).toBe('high');
  });

  it('returns null for unknown class', () => {
    expect(getTreatmentByClass('unknown_disease')).toBeNull();
  });
});

describe('getTreatment', () => {
  it('returns treatment by ID', () => {
    const t = getTreatment('TRT_APPLE_SCAB_001');
    expect(t).not.toBeNull();
    expect(t).toHaveProperty('steps');
    expect(t).toHaveProperty('prevention');
  });

  it('returns null for invalid ID', () => {
    expect(getTreatment('INVALID_ID')).toBeNull();
  });

  it('returns null if no ID provided', () => {
    expect(getTreatment(null)).toBeNull();
  });
});

describe('CLASS_TO_TREATMENT mapping', () => {
  it('has all 9 model classes', () => {
    const expectedClasses = [
      'Fresh', 'Tavelure/Points', 'Pourriture Noire',
      'Fletrissement', 'Moisissure', 'Momification',
      'Pourriture Amere', 'Pourriture Brune', 'Pourriture molle',
    ];
    expectedClasses.forEach(c => {
      expect(CLASS_TO_TREATMENT).toHaveProperty(c);
    });
  });
});