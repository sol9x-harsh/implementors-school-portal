import { getStudentById, getStudentPortalStats } from '@/lib/actions/admin.actions';
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
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const student = await getStudentById(resolvedParams.id);

  if (!student) {
    notFound();
  }

  const portalStats = await getStudentPortalStats(student.id);

  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className='p-8 lg:p-12 space-y-10 max-w-7xl mx-auto'>
      {/* Header / Back Navigation */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div className='flex items-center gap-6'>
          <Link href='/admin/students'>
            <Button
              variant='ghost'
              className='rounded-full w-12 h-12 p-0 hover:bg-purple-secondary'
            >
              <ArrowLeft className='w-5 h-5 text-purple-primary' />
            </Button>
          </Link>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 rounded-2xl bg-purple-gradient shadow-purple-lg flex items-center justify-center text-2xl font-heading font-black text-white'>
              {initials}
            </div>
            <div>
              <h1 className='text-3xl font-heading font-black text-purple-foreground tracking-tight'>
                {student.name}
              </h1>
              <div className='flex items-center gap-2 mt-1'>
                <Badge
                  variant='outline'
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest
                  ${student.studentType === 'SCHOOL' ? 'bg-purple-primary/10 text-purple-primary' : 'bg-purple-foreground/10 text-purple-foreground'}`}
                >
                  {student.studentType}
                </Badge>
                <span className='text-[11px] text-purple-muted-foreground font-bold'>
                  UID: {student.id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div title="Edit Profile is available in a future update">
            <Button
              disabled
              className='rounded-xl bg-purple-primary/40 text-white font-bold text-xs uppercase tracking-widest px-6 h-11 border-none cursor-not-allowed opacity-60'
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Section 1: Personal Details */}
        <div className='space-y-6'>
          <h2 className='text-[11px] font-black text-purple-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2'>
            <User className='w-3.5 h-3.5' /> Identity & Contact
          </h2>
          <div className='bg-white rounded-4xl p-8 border border-purple-border/30 shadow-purple space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-xl bg-purple-secondary/50 flex items-center justify-center shrink-0'>
                  <Mail className='w-4 h-4 text-purple-primary' />
                </div>
                <div>
                  <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest mb-0.5'>
                    Email Address
                  </p>
                  <p className='text-sm font-bold text-purple-foreground'>
                    {student.email}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-xl bg-purple-secondary/50 flex items-center justify-center shrink-0'>
                  <Smartphone className='w-4 h-4 text-purple-primary' />
                </div>
                <div>
                  <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest mb-0.5'>
                    Mobile Number
                  </p>
                  <p className='text-sm font-bold text-purple-foreground'>
                    {student.mobileNo}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-xl bg-purple-secondary/50 flex items-center justify-center shrink-0'>
                  <School className='w-4 h-4 text-purple-primary' />
                </div>
                <div>
                  <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest mb-0.5'>
                    Current Institution
                  </p>
                  <p className='text-sm font-bold text-purple-foreground'>
                    {student.institution || '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className='pt-6 border-t border-purple-border/10 space-y-4'>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-xl bg-purple-secondary/50 flex items-center justify-center shrink-0'>
                  <Briefcase className='w-4 h-4 text-purple-primary' />
                </div>
                <div>
                  <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest mb-0.5'>
                    Parental Context
                  </p>
                  <p className='text-sm font-bold text-purple-foreground'>
                    {student.fatherName} (Father)
                  </p>
                  <p className='text-xs font-medium text-purple-muted-foreground'>
                    {student.motherName} (Mother)
                  </p>
                </div>
              </div>
              {student.linkedInId && (
                <a
                  href={`https://linkedin.com/in/${student.linkedInId}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-4 text-purple-primary hover:underline'
                >
                  <LinkIcon className='w-4 h-4' />
                  <span className='text-xs font-bold tracking-tight'>
                    View Professional Portfolio
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Academic & Targets */}
        <div className='space-y-6'>
          <h2 className='text-[11px] font-black text-purple-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2'>
            <GraduationCap className='w-3.5 h-3.5' /> Academic Trajectory
          </h2>
          <div className='bg-white rounded-4xl p-8 border border-purple-border/30 shadow-purple space-y-8'>
            <div className='bg-purple-secondary/30 rounded-3xl p-6 border border-purple-border/10'>
              <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest mb-2'>
                Current Tier
              </p>
              <h3 className='text-xl font-heading font-black text-purple-foreground'>
                {student.studentType === 'SCHOOL'
                  ? student.classLevel
                  : student.course}
              </h3>
              <p className='text-[11px] font-bold text-purple-primary uppercase tracking-widest mt-1'>
                {student.studentType === 'SCHOOL'
                  ? student.stream
                  : `${student.college} · Year ${student.year}`}
              </p>
            </div>

            <div className='space-y-6'>
              <div>
                <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest mb-4'>
                  Targeted Milestones
                </p>
                <div className='flex flex-wrap gap-2'>
                  {(student.targetedExams || []).map((ex: string) => (
                    <Badge
                      key={ex}
                      variant='secondary'
                      className='bg-purple-secondary/50 text-purple-primary border-none font-bold text-[10px] px-3'
                    >
                      {ex}
                    </Badge>
                  ))}
                  {(student.targetedCountries || []).map((c: string) => (
                    <Badge
                      key={c}
                      variant='secondary'
                      className='bg-purple-foreground/10 text-purple-foreground border-none font-bold text-[10px] px-3 flex gap-1 items-center'
                    >
                      <MapPin className='w-3 h-3' /> {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Portal Activity */}
        <div className='space-y-6'>
          <h2 className='text-[11px] font-black text-purple-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2'>
            <ShieldCheck className='w-3.5 h-3.5' /> Portal Activity
          </h2>
          <div className='space-y-4'>
            <div className={`bg-white rounded-3xl p-6 border border-purple-border/30 shadow-purple-sm flex items-center gap-4 ${portalStats.eventCount === 0 ? 'opacity-60' : ''}`}>
              <div className='w-10 h-10 rounded-xl bg-purple-primary/10 flex items-center justify-center'>
                <CheckCircle2 className='w-5 h-5 text-purple-primary' />
              </div>
              <div>
                <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                  Registered Events
                </p>
                <p className='text-sm font-bold text-purple-foreground'>
                  {portalStats.eventCount > 0
                    ? `${portalStats.eventCount} event${portalStats.eventCount !== 1 ? 's' : ''} registered`
                    : '— No events registered yet —'}
                </p>
              </div>
            </div>
            <div className={`bg-white rounded-3xl p-6 border border-purple-border/30 shadow-purple-sm flex items-center gap-4 ${portalStats.formCount === 0 ? 'opacity-60' : ''}`}>
              <div className='w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center'>
                <Clock3 className='w-5 h-5 text-amber-600' />
              </div>
              <div>
                <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                  Form Submissions
                </p>
                <p className='text-sm font-bold text-purple-foreground'>
                  {portalStats.formCount > 0
                    ? `${portalStats.formCount} submission${portalStats.formCount !== 1 ? 's' : ''} made`
                    : '— No submissions yet —'}
                </p>
              </div>
            </div>
            <div className={`bg-white rounded-3xl p-6 border border-purple-border/30 shadow-purple-sm flex items-center gap-4 ${!portalStats.hasGrades ? 'opacity-60' : ''}`}>
              <div className='w-10 h-10 rounded-xl bg-purple-foreground/10 flex items-center justify-center'>
                <BarChart3 className='w-5 h-5 text-purple-foreground' />
              </div>
              <div>
                <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest'>
                  Internal Grades
                </p>
                <p className='text-sm font-bold text-purple-foreground'>
                  {portalStats.hasGrades ? 'Grade record indexed' : '— Indexing required —'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
