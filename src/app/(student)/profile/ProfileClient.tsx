'use client';

import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Building,
  Target,
  Globe,
  FileText,
  ChevronRight,
  Calendar,
  Briefcase,
  School,
} from 'lucide-react';

interface ProfileProps {
  profile: {
    id: string;
    name: string;
    email: string;
    mobileNo?: string;
    institution?: string;
    studentType?: string;
    classLevel?: string;
    stream?: string;
    college?: string;
    course?: string;
    year?: string;
    subjects?: string[];
    fatherName?: string;
    fatherOccupation?: string;
    fatherMobile?: string;
    fatherEmail?: string;
    motherName?: string;
    motherOccupation?: string;
    motherMobile?: string;
    motherEmail?: string;
    linkedInId?: string;
    targetedExams?: string[];
    targetedInstitutions?: string[];
    targetedCountries?: string[];
    targetedCourses?: string[];
    otherTargets?: string[];
    createdAt?: string;
    eventsRegistered: number;
    formsSubmitted: number;
    hasGrades: boolean;
  };
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className='flex items-start gap-4 py-4 border-b border-student-border/10 last:border-b-0'>
      <div className='w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5'>
        <Icon className='w-4 h-4 text-indigo-600' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[10px] font-black text-student-muted-foreground uppercase tracking-[0.2em] mb-1'>
          {label}
        </p>
        <p className='text-sm font-semibold text-student-foreground wrap-break-words'>
          {value}
        </p>
      </div>
    </div>
  );
}

function TagList({ items, label }: { items?: string[]; label: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className='py-4 border-b border-student-border/10 last:border-b-0'>
      <p className='text-[10px] font-black text-student-muted-foreground uppercase tracking-[0.2em] mb-3'>
        {label}
      </p>
      <div className='flex flex-wrap gap-2'>
        {items.map((item, i) => (
          <span
            key={i}
            className='px-3 py-1.5 rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700 border border-indigo-100'
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProfileClient({ profile }: ProfileProps) {
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className='p-4 lg:p-8 space-y-8 max-w-[1400px] mx-auto pb-24'>
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className='w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-sm shrink-0'>
          <span className='text-indigo-600 font-heading font-black text-3xl'>
            {initials}
          </span>
        </div>
        <div className='flex-1'>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 tracking-tight leading-tight">
            {profile.name}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {profile.email} {profile.studentType && `• ${profile.studentType}`} {profile.classLevel && `• Class ${profile.classLevel}`}
          </p>
          <div className='flex flex-wrap items-center gap-2 mt-3'>
            {profile.institution && (
              <span className='px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest border border-slate-200 flex items-center gap-1.5'>
                <School className='w-3 h-3 text-slate-400' /> {profile.institution}
              </span>
            )}
            {profile.stream && (
              <span className='px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest border border-slate-200 flex items-center gap-1.5'>
                <Target className='w-3 h-3 text-slate-400' /> {profile.stream}
              </span>
            )}
            {profile.createdAt && (
              <span className='px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-widest border border-slate-200 flex items-center gap-1.5'>
                <Calendar className='w-3 h-3 text-slate-400' /> Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile Sections ─────────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className='bento-card p-8'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
              <div className='w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-sm'>
                <User className='w-5 h-5 text-indigo-600' />
              </div>
              <h2 className='font-heading font-black text-student-foreground'>
                Personal Information
              </h2>
            </div>
            <div>
              <InfoRow icon={User} label='Full Name' value={profile.name} />
              <InfoRow
                icon={Mail}
                label='Email Address'
                value={profile.email}
              />
              <InfoRow
                icon={Phone}
                label='Mobile Number'
                value={profile.mobileNo}
              />
              <InfoRow
                icon={Building}
                label='Institution'
                value={profile.institution}
              />
              <InfoRow
                icon={Globe}
                label='LinkedIn'
                value={profile.linkedInId}
              />
              <InfoRow
                icon={Calendar}
                label='Member Since'
                value={
                  profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : undefined
                }
              />
            </div>
          </div>
        </motion.div>

        {/* Academic Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className='bento-card p-8'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
              <div className='w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-sm'>
                <GraduationCap className='w-5 h-5 text-indigo-600' />
              </div>
              <h2 className='font-heading font-black text-student-foreground'>
                Academic Details
              </h2>
            </div>
            <div>
              <InfoRow
                icon={GraduationCap}
                label='Student Type'
                value={profile.studentType}
              />
              <InfoRow
                icon={BookOpen}
                label='Class / Year'
                value={
                  profile.classLevel
                    ? `Class ${profile.classLevel}`
                    : profile.year
                      ? `Year ${profile.year}`
                      : undefined
                }
              />
              <InfoRow icon={Target} label='Stream' value={profile.stream} />
              <InfoRow
                icon={Building}
                label='College'
                value={profile.college}
              />
              <InfoRow icon={BookOpen} label='Course' value={profile.course} />
              <TagList items={profile.subjects} label='Subjects' />
            </div>
          </div>
        </motion.div>

        {/* Parent / Guardian Details */}
        {(profile.fatherName || profile.motherName) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className='bento-card p-8'>
              <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
                <div className='w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-sm'>
                  <User className='w-5 h-5 text-indigo-600' />
                </div>
                <h2 className='font-heading font-black text-student-foreground'>
                  Parent / Guardian
                </h2>
              </div>
              <div>
                {profile.fatherName && (
                  <>
                    <InfoRow
                      icon={User}
                      label="Father's Name"
                      value={profile.fatherName}
                    />
                    <InfoRow
                      icon={Briefcase}
                      label="Father's Occupation"
                      value={profile.fatherOccupation}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Father's Mobile"
                      value={profile.fatherMobile}
                    />
                    <InfoRow
                      icon={Mail}
                      label="Father's Email"
                      value={profile.fatherEmail}
                    />
                  </>
                )}
                {profile.motherName && (
                  <>
                    <InfoRow
                      icon={User}
                      label="Mother's Name"
                      value={profile.motherName}
                    />
                    <InfoRow
                      icon={Briefcase}
                      label="Mother's Occupation"
                      value={profile.motherOccupation}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Mother's Mobile"
                      value={profile.motherMobile}
                    />
                    <InfoRow
                      icon={Mail}
                      label="Mother's Email"
                      value={profile.motherEmail}
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Targets & Aspirations */}
        {(profile.targetedExams?.length ||
          profile.targetedInstitutions?.length ||
          profile.targetedCountries?.length ||
          profile.targetedCourses?.length) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className='bento-card p-8'>
              <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
                <div className='w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-sm'>
                  <Target className='w-5 h-5 text-indigo-600' />
                </div>
                <h2 className='font-heading font-black text-student-foreground'>
                  Targets & Aspirations
                </h2>
              </div>
              <div>
                <TagList items={profile.targetedExams} label='Targeted Exams' />
                <TagList
                  items={profile.targetedInstitutions}
                  label='Targeted Institutions'
                />
                <TagList
                  items={profile.targetedCountries}
                  label='Targeted Countries'
                />
                <TagList
                  items={profile.targetedCourses}
                  label='Targeted Courses'
                />
                <TagList items={profile.otherTargets} label='Other Targets' />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
