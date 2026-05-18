import {
  getStudentById,
  getStudentPortalStats,
} from '@/lib/actions/admin.actions';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Smartphone,
  School,
  GraduationCap,
  Calendar,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  BarChart3,
  BookOpen,
  Target,
  Hash,
  AlertCircle,
  Building2,
  Layers,
  Phone,
  AtSign,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ── Helpers ─────────────────────────────────────────────── */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  const isEmpty = !value || String(value).trim() === '';
  return (
    <div
      className={`flex items-start gap-3 py-2.5 border-b border-purple-border/10 last:border-0`}
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5
        ${isEmpty ? 'bg-purple-secondary/25' : 'bg-purple-primary/10'}`}
      >
        {isEmpty ? (
          <AlertCircle className='w-3 h-3 text-purple-muted-foreground/30' />
        ) : (
          <Icon className='w-3 h-3 text-purple-primary' />
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[9px] font-black text-purple-muted-foreground/60 uppercase tracking-widest mb-0.5'>
          {label}
        </p>
        {isEmpty ? (
          <p className='text-[12px] text-purple-muted-foreground/35 italic'>
            Not filled yet
          </p>
        ) : (
          <p className='text-[12px] font-semibold text-purple-foreground wrap-break-words'>
            {value}
          </p>
        )}
      </div>
      {isEmpty && (
        <span className='shrink-0 self-center text-[9px] font-black uppercase tracking-wider text-amber-600/80 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-full whitespace-nowrap'>
          Pending
        </span>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  accent,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className='bg-white rounded-2xl border border-purple-border/25 shadow-purple-xs overflow-hidden'>
      <div
        className={`flex items-center gap-2.5 px-5 py-3 border-b border-purple-border/15 ${accent ?? 'bg-purple-secondary/20'}`}
      >
        <div className='w-6 h-6 rounded-md bg-purple-primary/15 flex items-center justify-center'>
          <Icon className='w-3 h-3 text-purple-primary' />
        </div>
        <h2 className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.18em]'>
          {title}
        </h2>
      </div>
      <div className='px-5 py-1'>{children}</div>
    </div>
  );
}

function TagList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (!items || items.length === 0) {
    return (
      <p className='text-[11px] italic text-purple-muted-foreground/35 flex items-center gap-1.5 py-1'>
        <AlertCircle className='w-3 h-3' /> {emptyLabel}
      </p>
    );
  }
  return (
    <div className='flex flex-wrap gap-1.5 py-1'>
      {items.map((item) => (
        <span
          key={item}
          className='text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-secondary/50 text-purple-primary border border-purple-primary/15'
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const student = await getStudentById(resolvedParams.id);
  if (!student) notFound();

  const portalStats = await getStudentPortalStats(student.id);

  const initials = student.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Profile completion — all possible optional fields
  const optionalFields = [
    student.institution,
    student.fatherName,
    student.fatherOccupation,
    student.fatherMobile,
    student.fatherEmail,
    student.motherName,
    student.motherOccupation,
    student.motherMobile,
    student.motherEmail,
    student.classLevel,
    student.stream,
  ].filter((f) => f !== null);

  const filledCount = optionalFields.filter(
    (f) => f && String(f).trim(),
  ).length;
  const totalCount = optionalFields.length;
  const completionPct =
    totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;
  const completionColor =
    completionPct === 100
      ? 'oklch(0.50 0.17 145)'
      : completionPct >= 60
        ? 'var(--purple-primary)'
        : 'oklch(0.72 0.18 55)';

  return (
    <div className='p-6 lg:p-10 space-y-7 max-w-7xl mx-auto'>
      {/* ── Back + Hero Header ── */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-5'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/students'>
            <Button
              variant='ghost'
              className='rounded-full w-9 h-9 p-0 hover:bg-purple-secondary'
            >
              <ArrowLeft className='w-4 h-4 text-purple-primary' />
            </Button>
          </Link>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-2xl bg-purple-gradient shadow-purple-lg flex items-center justify-center text-xl font-heading font-black text-white shrink-0'>
              {initials}
            </div>
            <div>
              <h1 className='text-xl font-heading font-black text-purple-foreground tracking-tight'>
                {student.name}
              </h1>
              <div className='flex items-center gap-2 mt-1 flex-wrap'>
                <span className='inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-primary/10 text-purple-primary'>
                  <School className='w-2.5 h-2.5' />
                  Active Student
                </span>
                {student.uid && (
                  <span className='inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-primary text-white'>
                    UID: {student.uid}
                  </span>
                )}
                <span className='text-[10px] text-purple-muted-foreground font-bold'>
                  ID: {student.id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile completion bar */}
        <div className='flex items-center gap-4 bg-white border border-purple-border/25 rounded-2xl px-5 py-3.5 shadow-purple-xs min-w-[210px]'>
          <div className='flex-1'>
            <div className='flex items-center justify-between mb-1.5'>
              <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                Profile Completion
              </p>
              <span
                className='text-[11px] font-black'
                style={{ color: completionColor }}
              >
                {completionPct}%
              </span>
            </div>
            <div className='w-full h-1.5 rounded-full bg-purple-secondary/40 overflow-hidden'>
              <div
                className='h-full rounded-full transition-all duration-700'
                style={{
                  width: `${completionPct}%`,
                  background: completionColor,
                }}
              />
            </div>
            <p className='text-[10px] font-medium mt-1 text-purple-muted-foreground/50'>
              {filledCount} of {totalCount} fields filled
            </p>
          </div>
        </div>
      </div>

      {/* ── 3-Column Grid ── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        {/* ── Col 1: Identity, Contact, Parent, Professional ── */}
        <div className='space-y-4'>
          <SectionCard title='Identity & Contact' icon={User}>
            <DetailRow
              icon={Mail}
              label='Email Address'
              value={student.email}
            />
            <DetailRow
              icon={Smartphone}
              label='Mobile Number'
              value={student.mobileNo}
            />
            <DetailRow
              icon={School}
              label='Institution'
              value={student.institution}
            />
            <DetailRow icon={Hash} label='System ID' value={student.id} />
            <DetailRow
              icon={Calendar}
              label='Account Created'
              value={
                student.createdAt
                  ? new Date(student.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : null
              }
            />
          </SectionCard>

          <SectionCard title="Father's Details" icon={Briefcase}>
            <DetailRow
              icon={User}
              label="Father's Name"
              value={student.fatherName}
            />
            <DetailRow
              icon={Briefcase}
              label='Occupation'
              value={student.fatherOccupation}
            />
            <DetailRow
              icon={Phone}
              label='Mobile'
              value={student.fatherMobile}
            />
            <DetailRow
              icon={AtSign}
              label='Email'
              value={student.fatherEmail}
            />
          </SectionCard>

          <SectionCard title="Mother's Details" icon={Briefcase}>
            <DetailRow
              icon={User}
              label="Mother's Name"
              value={student.motherName}
            />
            <DetailRow
              icon={Briefcase}
              label='Occupation'
              value={student.motherOccupation}
            />
            <DetailRow
              icon={Phone}
              label='Mobile'
              value={student.motherMobile}
            />
            <DetailRow
              icon={AtSign}
              label='Email'
              value={student.motherEmail}
            />
          </SectionCard>
        </div>

        {/* ── Col 2: Academic ── */}
        <div className='space-y-4'>
          {/* Current Tier Highlight */}
          <div className='rounded-2xl bg-purple-gradient p-5 text-white shadow-purple-lg'>
            <p className='text-[9px] font-black uppercase tracking-widest text-white/50 mb-1'>
              Current Tier
            </p>
            <h3 className='text-xl font-heading font-black leading-tight'>
              {student.classLevel ? `Class ${student.classLevel}` : '—'}
            </h3>
            <p className='text-[11px] font-bold text-white/65 mt-1'>
              {student.stream || 'Stream not assigned'}
            </p>
          </div>

          <SectionCard title='Academic Details' icon={GraduationCap}>
            <DetailRow
              icon={BookOpen}
              label='Class / Level'
              value={student.classLevel}
            />
            <DetailRow icon={Layers} label='Stream' value={student.stream} />
            <DetailRow
              icon={Building2}
              label='Institution'
              value={student.institution}
            />
          </SectionCard>

          <SectionCard title='Targeted Exams' icon={Target}>
            <div className='py-2'>
              <TagList
                items={student.targetedExams ?? []}
                emptyLabel='No exams targeted yet'
              />
            </div>
          </SectionCard>

          <SectionCard title='Target Institutions' icon={Building2}>
            <div className='py-2'>
              <TagList
                items={student.targetedInstitutions ?? []}
                emptyLabel='No institutions targeted yet'
              />
            </div>
          </SectionCard>

          <SectionCard title='Target Countries' icon={MapPin}>
            <div className='py-2'>
              <TagList
                items={student.targetedCountries ?? []}
                emptyLabel='No countries targeted yet'
              />
            </div>
          </SectionCard>

          <SectionCard title='Target Courses' icon={GraduationCap}>
            <div className='py-2'>
              <TagList
                items={student.targetedCourses ?? []}
                emptyLabel='No courses targeted yet'
              />
            </div>
          </SectionCard>

          {student.otherTargets && (
            <SectionCard title='Other Targets' icon={Target}>
              <div className='py-2.5'>
                <p className='text-[12px] font-medium text-purple-foreground'>
                  {student.otherTargets}
                </p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Col 3: Portal Activity ── */}
        <div className='space-y-4'>
          <SectionCard title='Portal Activity' icon={ShieldCheck}>
            <div className='space-y-2.5 py-2'>
              {/* Events */}
              <div
                className={`flex items-center gap-3 p-3.5 rounded-xl border
                ${
                  portalStats.eventCount > 0
                    ? 'bg-purple-secondary/15 border-purple-border/30'
                    : 'bg-purple-secondary/15 border-purple-border/15'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                  ${portalStats.eventCount > 0 ? 'bg-purple-primary/15' : 'bg-purple-primary/10'}`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${portalStats.eventCount > 0 ? 'text-purple-primary' : 'text-purple-primary/40'}`}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[9px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                    Registered Events
                  </p>
                  <p
                    className={`text-[12px] font-bold mt-0.5
                    ${portalStats.eventCount > 0 ? 'text-purple-secondary-foreground' : 'text-purple-muted-foreground/40 italic'}`}
                  >
                    {portalStats.eventCount > 0
                      ? `${portalStats.eventCount} event${portalStats.eventCount !== 1 ? 's' : ''} registered`
                      : 'No events registered yet'}
                  </p>
                </div>
                {portalStats.eventCount > 0 && (
                  <span className='text-[11px] font-black text-purple-primary bg-purple-secondary/15 border border-purple-border/30 rounded-full px-2 py-0.5'>
                    {portalStats.eventCount}
                  </span>
                )}
              </div>

              {/* Forms */}
              <div
                className={`flex items-center gap-3 p-3.5 rounded-xl border
                ${
                  portalStats.formCount > 0
                    ? 'bg-amber-50 border-amber-200/50'
                    : 'bg-purple-secondary/15 border-purple-border/15'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                  ${portalStats.formCount > 0 ? 'bg-amber-500/15' : 'bg-purple-primary/10'}`}
                >
                  <Clock3
                    className={`w-3.5 h-3.5 ${portalStats.formCount > 0 ? 'text-amber-600' : 'text-purple-primary/40'}`}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[9px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                    Form Submissions
                  </p>
                  <p
                    className={`text-[12px] font-bold mt-0.5
                    ${portalStats.formCount > 0 ? 'text-amber-700' : 'text-purple-muted-foreground/40 italic'}`}
                  >
                    {portalStats.formCount > 0
                      ? `${portalStats.formCount} submission${portalStats.formCount !== 1 ? 's' : ''} made`
                      : 'No submissions yet'}
                  </p>
                </div>
                {portalStats.formCount > 0 && (
                  <span className='text-[11px] font-black text-amber-700 bg-amber-100 border border-amber-200/50 rounded-full px-2 py-0.5'>
                    {portalStats.formCount}
                  </span>
                )}
              </div>

              {/* Grades */}
              <div
                className={`flex items-center gap-3 p-3.5 rounded-xl border
                ${
                  portalStats.hasGrades
                    ? 'bg-purple-secondary/30 border-purple-border/25'
                    : 'bg-purple-secondary/15 border-purple-border/15'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                  ${portalStats.hasGrades ? 'bg-purple-primary/15' : 'bg-purple-primary/10'}`}
                >
                  <BarChart3
                    className={`w-3.5 h-3.5 ${portalStats.hasGrades ? 'text-purple-primary' : 'text-purple-primary/40'}`}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[9px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                    Internal Grades
                  </p>
                  <p
                    className={`text-[12px] font-bold mt-0.5
                    ${portalStats.hasGrades ? 'text-purple-foreground' : 'text-purple-muted-foreground/40 italic'}`}
                  >
                    {portalStats.hasGrades
                      ? 'Grade record indexed'
                      : 'Indexing required'}
                  </p>
                </div>
                {portalStats.hasGrades && (
                  <CheckCircle2 className='w-4 h-4 text-purple-primary shrink-0' />
                )}
              </div>
            </div>
          </SectionCard>

          {/* Subjects */}
          {student.subjects && student.subjects.length > 0 && (
            <SectionCard title='Subjects' icon={BookOpen}>
              <div className='py-2'>
                <TagList
                  items={student.subjects}
                  emptyLabel='No subjects listed'
                />
              </div>
            </SectionCard>
          )}

          {/* Quick stats bar */}
          <div className='bg-white rounded-2xl border border-purple-border/25 shadow-purple-xs overflow-hidden'>
            <div className='bg-purple-secondary/20 px-5 py-3 border-b border-purple-border/15'>
              <p className='text-[10px] font-black text-purple-foreground uppercase tracking-[0.18em]'>
                Quick Summary
              </p>
            </div>
            <div className='divide-y divide-purple-border/10'>
              {[
                { label: 'Events', value: portalStats.eventCount },
                { label: 'Forms', value: portalStats.formCount },
                {
                  label: 'Grades',
                  value: portalStats.hasGrades ? 'Yes' : 'No',
                },
                { label: 'Profile', value: `${completionPct}%` },
              ].map((row) => (
                <div
                  key={row.label}
                  className='flex items-center justify-between px-5 py-2.5'
                >
                  <span className='text-[11px] font-medium text-purple-muted-foreground'>
                    {row.label}
                  </span>
                  <span className='text-[12px] font-black text-purple-foreground tabular-nums'>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
