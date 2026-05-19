/**
 * Cohort Targeting System
 *
 * URN Format: `<domain>:<institution_id>:<level>:<program>`
 *
 * - domain:         'school' | 'college'
 * - institution_id: A specific institution slug, or 'all' for any institution.
 * - level:          A class/year string ('9', '10', '11', '12', 'yr1', …), or 'all'.
 * - program:        A program code (see ProgramCode), or 'all'.
 *
 * Special top-level value: the literal string 'all' means "every student globally".
 *
 * Examples:
 *   'all'                         → all students
 *   'school:all:all:all'          → all school students
 *   'school:all:12:all'           → all Class 12 school students
 *   'school:all:12:sci-pcm'       → Class 12, Science (PCM), any school
 *   'school:sunrise-academy:12:sci-pcm' → Class 12 PCM at Sunrise Academy
 *
 * MIGRATION NOTE: Existing MongoDB documents that store the old format
 * ('school:12', 'school:12:pcm', etc.) in `targetAudience` fields will
 * not match the new URN tags. Run a one-time migration to re-write those
 * stored values before deploying this change to production.
 */

// ─── DOMAIN TYPES ────────────────────────────────────────────────────────────

export type CohortDomain = 'school' | 'college';

export type SchoolLevel = '9' | '10' | '11' | '12';

/**
 * Canonical program codes using the `[domain]-[specialization]` convention.
 * 'all' is the wildcard meaning "any program at this level".
 */
export type ProgramCode =
  | 'all'
  | 'sci-pcm'
  | 'sci-pcb'
  | 'sci-pcmb'
  | 'com-math'
  | 'com-gen'
  | 'hum-core';

export interface ParsedCohortUrn {
  domain: CohortDomain;
  institutionId: string;
  level: string;
  program: ProgramCode;
}

export interface CohortOption {
  value: string;
  label: string;
}

// ─── PROGRAM DEFINITIONS ─────────────────────────────────────────────────────

/**
 * Maps every program code to its human-readable label and the exact string
 * stored in `Student.stream` in MongoDB. `dbStream: null` means "no stream
 * filter" — match any stream at that level.
 *
 * IMPORTANT: `dbStream` values must exactly match what the admin UI writes
 * into the Student document. Do not change these without auditing the DB.
 */
export const PROGRAMS: Record<ProgramCode, { label: string; dbStream: string | null }> = {
  'all':      { label: 'All Programs',              dbStream: null },
  'sci-pcm':  { label: 'Science (PCM)',              dbStream: 'Science (PCM)' },
  'sci-pcb':  { label: 'Science (PCB)',              dbStream: 'Science (PCB)' },
  'sci-pcmb': { label: 'Science (PCMB)',             dbStream: 'Science (PCMB)' },
  'com-math': { label: 'Commerce (With Maths)',      dbStream: 'Commerce (With Maths)' },
  'com-gen':  { label: 'Commerce (Without Maths)',   dbStream: 'Commerce (Without Maths)' },
  'hum-core': { label: 'Humanities',                 dbStream: 'Humanities' },
};

/**
 * Ordered list of program codes for the student profile / creation form.
 * Excludes the 'all' wildcard since it is not a real academic stream.
 */
export const ACADEMIC_STREAM_CODES: ProgramCode[] = [
  'sci-pcm',
  'sci-pcb',
  'sci-pcmb',
  'com-math',
  'com-gen',
  'hum-core',
];

/**
 * Human-readable stream labels for form dropdowns (preserves the existing
 * ACADEMIC_STREAMS export shape so UI components need no changes).
 */
export const ACADEMIC_STREAMS: string[] = ACADEMIC_STREAM_CODES.map(
  (code) => PROGRAMS[code].label,
);

// ─── SCHOOL LEVEL CONFIG ──────────────────────────────────────────────────────

interface LevelConfig {
  label: string;
  /** Ordered program codes available at this level. Always starts with 'all'. */
  programs: ProgramCode[];
}

const SCHOOL_LEVEL_CONFIG: Record<SchoolLevel, LevelConfig> = {
  '9':  { label: 'Class 9',  programs: ['all'] },
  '10': { label: 'Class 10', programs: ['all'] },
  '11': { label: 'Class 11', programs: ['all', 'sci-pcm', 'sci-pcb', 'sci-pcmb', 'com-math', 'com-gen', 'hum-core'] },
  '12': { label: 'Class 12', programs: ['all', 'sci-pcm', 'sci-pcb', 'sci-pcmb', 'com-math', 'com-gen', 'hum-core'] },
};

/** Ordered school levels, used by UI pickers. */
export const SCHOOL_LEVELS: { id: SchoolLevel; label: string }[] = (
  Object.entries(SCHOOL_LEVEL_CONFIG) as [SchoolLevel, LevelConfig][]
).map(([id, cfg]) => ({ id, label: cfg.label }));

/**
 * Legacy alias — kept for `TestManagementClient` which only ever needs
 * Class 11 and 12. Prefer `SCHOOL_LEVELS` for new code.
 * @deprecated Use SCHOOL_LEVELS instead.
 */
export const SCHOOL_COHORTS = SCHOOL_LEVELS.filter(
  (l) => l.id === '11' || l.id === '12',
);

// ─── URN HELPERS ──────────────────────────────────────────────────────────────

/**
 * Parses a cohort URN string into its constituent parts.
 * Returns `null` for malformed input so callers can fail-fast.
 *
 * The special top-level value 'all' is expanded to a fully-qualified
 * wildcard object for uniform handling downstream.
 */
export function parseCohortUrn(urn: string): ParsedCohortUrn | null {
  if (urn === 'all') {
    return { domain: 'school', institutionId: 'all', level: 'all', program: 'all' };
  }

  const parts = urn.split(':');
  if (parts.length !== 4) return null;

  const [domain, institutionId, level, program] = parts;

  if (domain !== 'school' && domain !== 'college') return null;
  if (!institutionId || !level || !program) return null;
  if (!(program in PROGRAMS)) return null;

  return {
    domain: domain as CohortDomain,
    institutionId,
    level,
    program: program as ProgramCode,
  };
}

/**
 * Serialises a ParsedCohortUrn back to its canonical URN string.
 * The all-wildcard object round-trips to the literal string 'all'.
 */
export function formatCohortUrn(parsed: ParsedCohortUrn): string {
  if (
    parsed.institutionId === 'all' &&
    parsed.level === 'all' &&
    parsed.program === 'all'
  ) {
    return 'all';
  }
  return `${parsed.domain}:${parsed.institutionId}:${parsed.level}:${parsed.program}`;
}

// ─── STREAM NORMALISATION ─────────────────────────────────────────────────────

/**
 * Maps a raw `Student.stream` string (as stored in MongoDB) to the nearest
 * canonical ProgramCode. Returns 'all' when the stream is absent or unknown.
 *
 * This is the single source of truth for stream → program-code mapping, so
 * all callers (student.actions, admin.actions, etc.) converge on the same logic.
 */
export function streamToProgramCode(rawStream: string | undefined | null): ProgramCode {
  if (!rawStream) return 'all';

  const s = rawStream.toLowerCase().trim();

  // Science — check PCMB before PCM to avoid partial match
  if (s.includes('pcmb') || (s.includes('pcm') && s.includes('b'))) return 'sci-pcmb';
  if (s.includes('pcm')) return 'sci-pcm';
  if (s.includes('pcb')) return 'sci-pcb';

  // Commerce
  if (s.includes('commerce')) {
    if (s.includes('without') || s.includes('no')) return 'com-gen';
    // 'with maths', 'with math', or just 'commerce' defaults to with-maths
    return 'com-math';
  }

  // Humanities / Arts
  if (s.includes('humanities') || s.includes('arts')) return 'hum-core';

  return 'all';
}

// ─── STUDENT COHORT TAG BUILDER ───────────────────────────────────────────────

/**
 * Generates the complete set of cohort URN tags a student belongs to,
 * ordered from broadest to most specific. The `targetAudience` field on
 * Event / DataRequest documents is matched against this array with `$in`.
 *
 * Specificity ladder:
 *   1. 'all'                                      (global wildcard)
 *   2. '<domain>:all:all:all'                     (domain-wide)
 *   3. '<domain>:<inst>:all:all'                  (institution-wide)     [if inst known]
 *   4. '<domain>:all:<level>:all'                 (level, cross-institution)
 *   5. '<domain>:<inst>:<level>:all'              (level, institution-specific) [if inst known]
 *   6. '<domain>:all:<level>:<program>'           (program, cross-institution)
 *   7. '<domain>:<inst>:<level>:<program>'        (fully-qualified)      [if inst known]
 *
 * @param domain       The institution domain ('school' | 'college').
 * @param institutionId The institution's slug/id, or undefined/empty if unknown.
 * @param level        The class/year level string, or undefined if unknown.
 * @param program      The canonical ProgramCode, or undefined/'all' if unknown.
 */
export function buildStudentCohortIds(
  domain: CohortDomain,
  institutionId: string | undefined | null,
  level: string | undefined | null,
  program: ProgramCode | undefined | null,
): string[] {
  const tags: string[] = ['all'];

  const inst = institutionId?.trim() || 'all';
  const hasInst = inst !== 'all';

  // Tier 2: domain-wide
  tags.push(`${domain}:all:all:all`);

  // Tier 3: institution-wide
  if (hasInst) tags.push(`${domain}:${inst}:all:all`);

  const lvl = level?.trim();
  if (!lvl) return tags;

  // Tier 4: level, cross-institution
  tags.push(`${domain}:all:${lvl}:all`);

  // Tier 5: level + institution
  if (hasInst) tags.push(`${domain}:${inst}:${lvl}:all`);

  const prog = program && program !== 'all' ? program : null;
  if (!prog) return tags;

  // Tier 6: program, cross-institution
  tags.push(`${domain}:all:${lvl}:${prog}`);

  // Tier 7: fully-qualified
  if (hasInst) tags.push(`${domain}:${inst}:${lvl}:${prog}`);

  return tags;
}

// ─── ADMIN DROPDOWN BUILDER ───────────────────────────────────────────────────

/**
 * Dynamically generates the list of `{ value, label }` pairs for the admin
 * audience-targeting dropdown. Scoped to `domain` + `institutionId` so the
 * same function works for both global targeting and institution-specific views.
 *
 * @param domain        The domain to generate options for.
 * @param institutionId The institution slug, or 'all' for cross-institution targeting.
 */
export function getAdminTargetOptions(
  domain: CohortDomain = 'school',
  institutionId: string = 'all',
): CohortOption[] {
  const options: CohortOption[] = [
    { value: 'all', label: 'All Students' },
  ];

  if (domain === 'school') {
    const inst = institutionId.trim() || 'all';

    for (const [lvl, cfg] of Object.entries(SCHOOL_LEVEL_CONFIG) as [SchoolLevel, LevelConfig][]) {
      // Level-wide option (e.g. "Class 12 — All Programs")
      options.push({
        value: `school:${inst}:${lvl}:all`,
        label: `${cfg.label} — All Programs`,
      });

      // Per-program options for levels that have streams
      for (const prog of cfg.programs) {
        if (prog === 'all') continue;
        options.push({
          value: `school:${inst}:${lvl}:${prog}`,
          label: `${cfg.label} — ${PROGRAMS[prog].label}`,
        });
      }
    }
  }

  // College domain options would go here when implemented.

  return options;
}

/**
 * Legacy flat array of cohort options, retained so admin.actions.ts can call
 * getCohortOptionsWithCounts without touching the SmartEventsClient import.
 * Generated for domain='school', institutionId='all'.
 *
 * @deprecated Prefer getAdminTargetOptions() for new call sites.
 */
export const COHORT_OPTIONS: CohortOption[] = getAdminTargetOptions('school', 'all');
