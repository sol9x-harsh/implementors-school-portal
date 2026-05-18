/**
 * Canonical Cohort IDs for targeting students.
 * Format: school:<class_level>:<stream_id>
 */

export const SCHOOL_COHORTS = [
  { id: '11', label: 'Class 11' },
  { id: '12', label: 'Class 12' },
];

export const ACADEMIC_STREAMS = [
  'Science (PCM)',
  'Science (PCB)',
  'Science (PCMB)',
  'Commerce (With Maths)',
  'Commerce (Without Maths)',
  'Humanities',
];

export const COHORT_OPTIONS = [
  { value: 'all', label: 'All Students' },
  { value: 'school:9', label: 'Class 9 (All)' },
  { value: 'school:10', label: 'Class 10 (All)' },
  { value: 'school:11', label: 'Class 11 (All)' },
  { value: 'school:12', label: 'Class 12 (All)' },
  { value: 'school:12:pcm', label: 'Class 12 - Science (PCM)' },
  { value: 'school:12:pcb', label: 'Class 12 - Science (PCB)' },
  { value: 'school:12:pcmb', label: 'Class 12 - Science (PCMB)' },
  {
    value: 'school:12:commerce_math',
    label: 'Class 12 - Commerce (With Maths)',
  },
  {
    value: 'school:12:commerce_no_math',
    label: 'Class 12 - Commerce (Without Maths)',
  },
  { value: 'school:12:humanities', label: 'Class 12 - Humanities' },
];

/**
 * Generates a list of canonical cohort IDs for a student based on their class, stream, and institution.
 */
export function buildStudentCohortIds(
  classLevel?: string,
  stream?: string,
  institution?: string,
): string[] {
  const cohorts: string[] = ['all'];

  if (institution) {
    cohorts.push(`school:${institution}`);
  }

  if (!classLevel) return cohorts;

  const normalizedClass = classLevel.trim();
  cohorts.push(`school:${normalizedClass}`);

  if (!stream) return cohorts;

  const s = stream.toLowerCase().trim();

  // Science
  if (s.includes('pcm') && s.includes('b')) {
    cohorts.push(`school:${normalizedClass}:pcmb`);
  } else if (s.includes('pcm')) {
    cohorts.push(`school:${normalizedClass}:pcm`);
  } else if (s.includes('pcb')) {
    cohorts.push(`school:${normalizedClass}:pcb`);
  }

  // Commerce
  if (s.includes('commerce')) {
    if (s.includes('without') || s.includes('no')) {
      cohorts.push(`school:${normalizedClass}:commerce_no_math`);
    } else if (s.includes('with') || s.includes('math')) {
      cohorts.push(`school:${normalizedClass}:commerce_math`);
    }
  }

  // Humanities
  if (s.includes('humanities') || s.includes('arts')) {
    cohorts.push(`school:${normalizedClass}:humanities`);
  }

  return cohorts;
}
