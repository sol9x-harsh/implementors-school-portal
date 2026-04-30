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
    <div className='flex items-start gap-4 py-4 border-b border-purple-border/10 last:border-b-0'>
      <div className='w-9 h-9 rounded-xl bg-purple-primary/8 flex items-center justify-center shrink-0 mt-0.5'>
        <Icon className='w-4 h-4 text-purple-primary/60' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-[0.2em] mb-1'>
          {label}
        </p>
        <p className='text-sm font-semibold text-purple-foreground wrap-break-words'>
          {value}
        </p>
      </div>
    </div>
  );
}

function TagList({ items, label }: { items?: string[]; label: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className='py-4 border-b border-purple-border/10 last:border-b-0'>
      <p className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-[0.2em] mb-3'>
        {label}
      </p>
      <div className='flex flex-wrap gap-2'>
        {items.map((item, i) => (
          <span
            key={i}
            className='px-3 py-1.5 rounded-full bg-purple-primary/8 text-[11px] font-bold text-purple-primary border border-purple-primary/10'
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
    <div className='p-8 lg:p-12 space-y-10 max-w-5xl mx-auto pb-20'>
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-4'
      >
        <div className='flex items-center gap-2'>
          <span className='text-[10px] font-black text-purple-primary uppercase tracking-widest'>
            Dashboard
          </span>
          <ChevronRight className='w-3 h-3 text-purple-muted-foreground/50' />
          <span className='text-[10px] font-black text-purple-muted-foreground uppercase tracking-widest'>
            Profile
          </span>
        </div>
      </motion.div>

      {/* ── Profile Hero ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className='relative overflow-hidden rounded-5xl bg-purple-gradient shadow-purple-lg p-10'>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

          <div className='relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8'>
            <div className='w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-xl'>
              <span className='text-white font-heading font-black text-3xl'>
                {initials}
              </span>
            </div>
            <div className='flex-1 space-y-2'>
              <h1 className='text-3xl md:text-4xl font-heading font-black text-white leading-tight'>
                {profile.name}
              </h1>
              <p className='text-white/70 text-sm font-medium'>
                {profile.email}
              </p>
              <div className='flex flex-wrap items-center gap-3 mt-3'>
                {profile.studentType && (
                  <span className='px-3 py-1 rounded-full bg-white/20 text-[10px] font-black text-white uppercase tracking-widest border border-white/10'>
                    {profile.studentType}
                  </span>
                )}
                {profile.classLevel && (
                  <span className='px-3 py-1 rounded-full bg-white/20 text-[10px] font-black text-white uppercase tracking-widest border border-white/10'>
                    Class {profile.classLevel}
                  </span>
                )}
                {profile.stream && (
                  <span className='px-3 py-1 rounded-full bg-white/20 text-[10px] font-black text-white uppercase tracking-widest border border-white/10'>
                    {profile.stream}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Identity footer */}
          <div className='relative z-10 flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-white/15'>
            {profile.institution && (
              <div className='flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10'>
                <School className='w-3.5 h-3.5 text-white/70 shrink-0' />
                <span className='text-[11px] font-bold text-white/80'>
                  {profile.institution}
                </span>
              </div>
            )}
            {profile.mobileNo && (
              <div className='flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10'>
                <Phone className='w-3.5 h-3.5 text-white/70 shrink-0' />
                <span className='text-[11px] font-bold text-white/80'>
                  {profile.mobileNo}
                </span>
              </div>
            )}
            {profile.createdAt && (
              <div className='flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10'>
                <Calendar className='w-3.5 h-3.5 text-white/70 shrink-0' />
                <span className='text-[11px] font-bold text-white/80'>
                  Member since{' '}
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Profile Sections ─────────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className='bg-white rounded-5xl border border-purple-border/30 shadow-purple p-8'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-purple-border/20'>
              <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                <User className='w-5 h-5 text-purple-primary' />
              </div>
              <h2 className='font-heading font-black text-purple-foreground'>
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
          <div className='bg-white rounded-5xl border border-purple-border/30 shadow-purple p-8'>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-purple-border/20'>
              <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                <GraduationCap className='w-5 h-5 text-purple-primary' />
              </div>
              <h2 className='font-heading font-black text-purple-foreground'>
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
            <div className='bg-white rounded-5xl border border-purple-border/30 shadow-purple p-8'>
              <div className='flex items-center gap-3 mb-6 pb-4 border-b border-purple-border/20'>
                <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                  <User className='w-5 h-5 text-purple-primary' />
                </div>
                <h2 className='font-heading font-black text-purple-foreground'>
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
            <div className='bg-white rounded-5xl border border-purple-border/30 shadow-purple p-8'>
              <div className='flex items-center gap-3 mb-6 pb-4 border-b border-purple-border/20'>
                <div className='w-10 h-10 rounded-2xl bg-purple-primary/10 flex items-center justify-center'>
                  <Target className='w-5 h-5 text-purple-primary' />
                </div>
                <h2 className='font-heading font-black text-purple-foreground'>
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
