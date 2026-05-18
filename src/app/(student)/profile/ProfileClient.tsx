'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ProfileEditForm from '@/components/student/ProfileEditForm';
import { updateStudentProfile } from '@/lib/actions/student.actions';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Building,
  Target,
  Globe,
  Calendar,
  Briefcase,
  School,
  Edit,
  X,
  Sparkles,
  Users,
  Trophy,
  MapPin,
  Award,
  Activity,
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

function InfoCard({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon: any;
  label: string;
  value?: string | null;
  variant?: 'default' | 'compact';
}) {
  if (!value) return null;

  if (variant === 'compact') {
    return (
      <div className='flex items-center gap-3 p-3 rounded-xl bg-student-muted/30 border border-student-border/10 hover:bg-student-muted/40 transition-colors group'>
        <div className='w-9 h-9 rounded-lg bg-student-primary/10 flex items-center justify-center shrink-0 group-hover:bg-student-primary/15 transition-colors'>
          <Icon className='w-4 h-4 text-student-primary' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-[10px] font-black text-student-muted-foreground uppercase tracking-[0.15em] leading-none mb-0.5'>
            {label}
          </p>
          <p className='text-[13px] font-semibold text-student-foreground truncate'>
            {value}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-start gap-4 p-4 rounded-xl bg-white border border-student-border/15 shadow-sm hover:shadow-md hover:border-student-border/25 transition-all group'>
      <div className='w-10 h-10 rounded-xl bg-student-primary/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-student-primary/12 transition-colors'>
        <Icon className='w-4.5 h-4.5 text-student-primary' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[9px] font-black text-student-muted-foreground uppercase tracking-[0.2em] mb-1'>
          {label}
        </p>
        <p className='text-[14px] font-semibold text-student-foreground leading-snug'>
          {value}
        </p>
      </div>
    </div>
  );
}

function TagCloud({ items, label }: { items?: string[]; label: string }) {
  if (!items || items.length === 0) return null;

  return (
    <div className='p-4 rounded-xl bg-white border border-student-border/15 shadow-sm'>
      <p className='text-[10px] font-black text-student-muted-foreground uppercase tracking-[0.2em] mb-3'>
        {label}
      </p>
      <div className='flex flex-wrap gap-2'>
        {items.map((item, i) => (
          <span
            key={i}
            className='px-3 py-1.5 rounded-full bg-student-primary/10 text-[11px] font-bold text-student-primary border border-student-primary/15 hover:bg-student-primary/15 transition-colors'
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
  delay = 0,
  badge,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  delay?: number;
  badge?: string | number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
      className='space-y-4'
    >
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-xl bg-student-gradient flex items-center justify-center shadow-student-sm'>
          <Icon className='w-5 h-5 text-white' />
        </div>
        <div className='flex-1'>
          <h3 className='font-heading font-black text-lg text-student-foreground tracking-tight'>
            {title}
          </h3>
          {badge && (
            <p className='text-[10px] text-student-muted-foreground font-medium mt-0.5'>
              {badge}
            </p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export default function ProfileClient({ profile }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateStudentProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced quick stats with activity data
  const activityStats = [
    {
      icon: Activity,
      label: 'Activities',
      value: profile.eventsRegistered.toString(),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Award,
      label: 'Achievements',
      value: profile.hasGrades ? 'View' : 'None',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: School,
      label: 'Institution',
      value: profile.institution || 'N/A',
      color: 'text-student-primary',
      bg: 'bg-student-primary/10',
    },
    {
      icon: GraduationCap,
      label: 'Class',
      value: profile.classLevel ? `Class ${profile.classLevel}` : 'N/A',
      color: 'text-student-primary',
      bg: 'bg-student-primary/10',
    },
  ];

  return (
    <div className='min-h-screen bg-student-background'>
      <div className='p-4 lg:p-8 max-w-7xl mx-auto'>
        {/* ── Enhanced Hero Section ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8'
        >
          <div className='relative overflow-hidden rounded-3xl bg-white border border-student-border/20 shadow-student-lg'>
            {/* Enhanced gradient header */}
            <div className='h-32 bg-student-gradient relative'>
              <div className='absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/10' />
              <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                <div className='flex items-center gap-2 text-white'>
                  <Sparkles className='w-5 h-5' />
                  <span className='text-sm font-bold tracking-wide'>
                    Student Profile
                  </span>
                </div>
              </div>
              {/* Decorative elements */}
              <div className='absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl' />
              <div className='absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl' />
            </div>

            {/* Profile content */}
            <div className='px-6 lg:px-8 pb-8'>
              <div className='flex flex-col lg:flex-row lg:items-end gap-6 -mt-16 mb-6'>
                {/* Enhanced avatar */}
                <div className='relative shrink-0'>
                  <div className='w-28 h-28 rounded-2xl bg-student-gradient flex items-center justify-center border-4 border-white shadow-student-lg'>
                    <span className='text-white font-heading font-black text-4xl'>
                      {initials}
                    </span>
                  </div>
                  <div className='absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center'>
                    <div className='w-2 h-2 rounded-full bg-white' />
                  </div>
                </div>

                {/* Profile info */}
                <div className='flex-1 min-w-0 lg:mr-4 pb-2'>
                  <h1 className='text-2xl lg:text-3xl font-heading font-black text-student-foreground tracking-tight leading-tight mb-2 wrap-break-word'>
                    {profile.name}
                  </h1>
                  <p className='text-[14px] lg:text-[15px] text-student-muted-foreground font-medium mb-3 break-all'>
                    {profile.email}
                  </p>
                  <div className='flex flex-wrap items-center gap-3'>
                    {profile.stream && (
                      <span className='px-3 py-1 rounded-full bg-student-primary/10 text-[11px] font-bold text-student-primary border border-student-primary/20 flex items-center gap-1.5'>
                        <Target className='w-3 h-3' />
                        {profile.stream}
                      </span>
                    )}
                    {profile.createdAt && (
                      <span className='px-3 py-1 rounded-full bg-student-muted/50 text-[11px] font-bold text-student-muted-foreground border border-student-border/20 flex items-center gap-1.5'>
                        <Calendar className='w-3 h-3' />
                        Since {new Date(profile.createdAt).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced edit button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-3 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shrink-0 ${
                    isEditing
                      ? 'bg-student-danger/10 text-student-danger border border-student-danger/20 hover:bg-student-danger/15'
                      : 'bg-student-gradient text-white shadow-student hover:shadow-student-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <X className='w-4 h-4' /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit className='w-4 h-4' /> Edit Profile
                    </>
                  )}
                </button>
              </div>

              {/* Activity stats bar */}
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                {activityStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className='flex items-center gap-3 p-3 rounded-xl bg-student-muted/30 border border-student-border/10 hover:bg-student-muted/40 transition-colors'
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[8px] font-black text-student-muted-foreground uppercase tracking-[0.15em] leading-none'>
                          {stat.label}
                        </p>
                        <p className='text-[12px] font-bold text-student-foreground truncate'>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Enhanced Profile Sections ─────────────────────────── */}
        {isEditing ? (
          <ProfileEditForm
            profile={profile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Content - 2 columns */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Personal Information */}
              <SectionCard icon={User} title='Personal Information' delay={0.1}>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <InfoCard
                    icon={User}
                    label='Full Name'
                    value={profile.name}
                  />
                  <InfoCard icon={Mail} label='Email' value={profile.email} />
                  <InfoCard
                    icon={Phone}
                    label='Mobile'
                    value={profile.mobileNo}
                  />
                  <InfoCard
                    icon={Building}
                    label='Institution'
                    value={profile.institution}
                  />
                  <InfoCard
                    icon={Globe}
                    label='LinkedIn'
                    value={profile.linkedInId}
                  />
                  <InfoCard
                    icon={Calendar}
                    label='Member Since'
                    value={
                      profile.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            },
                          )
                        : undefined
                    }
                  />
                </div>
              </SectionCard>

              {/* Academic Details */}
              <SectionCard
                icon={GraduationCap}
                title='Academic Details'
                delay={0.15}
                badge={
                  profile.classLevel ? `Class ${profile.classLevel}` : undefined
                }
              >
                <div className='space-y-3'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <InfoCard
                      icon={GraduationCap}
                      label='Student Type'
                      value={profile.studentType}
                    />
                    <InfoCard
                      icon={Target}
                      label='Stream'
                      value={profile.stream}
                    />
                  </div>
                  <TagCloud items={profile.subjects} label='Subjects' />
                </div>
              </SectionCard>

              {/* Parent Information */}
              {(profile.fatherName || profile.motherName) && (
                <SectionCard icon={Users} title='Parent / Guardian' delay={0.2}>
                  <div className='space-y-4'>
                    {profile.fatherName && (
                      <div className='p-4 rounded-xl bg-student-muted/20 border border-student-border/10'>
                        <p className='text-[10px] font-black text-student-muted-foreground uppercase tracking-[0.2em] mb-3'>
                          Father's Information
                        </p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                          <InfoCard
                            icon={User}
                            label='Name'
                            value={profile.fatherName}
                            variant='compact'
                          />
                          <InfoCard
                            icon={Briefcase}
                            label='Occupation'
                            value={profile.fatherOccupation}
                            variant='compact'
                          />
                          <InfoCard
                            icon={Phone}
                            label='Mobile'
                            value={profile.fatherMobile}
                            variant='compact'
                          />
                          <InfoCard
                            icon={Mail}
                            label='Email'
                            value={profile.fatherEmail}
                            variant='compact'
                          />
                        </div>
                      </div>
                    )}
                    {profile.motherName && (
                      <div className='p-4 rounded-xl bg-student-muted/20 border border-student-border/10'>
                        <p className='text-[10px] font-black text-student-muted-foreground uppercase tracking-[0.2em] mb-3'>
                          Mother's Information
                        </p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                          <InfoCard
                            icon={User}
                            label='Name'
                            value={profile.motherName}
                            variant='compact'
                          />
                          <InfoCard
                            icon={Briefcase}
                            label='Occupation'
                            value={profile.motherOccupation}
                            variant='compact'
                          />
                          <InfoCard
                            icon={Phone}
                            label='Mobile'
                            value={profile.motherMobile}
                            variant='compact'
                          />
                          <InfoCard
                            icon={Mail}
                            label='Email'
                            value={profile.motherEmail}
                            variant='compact'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Sidebar - 1 column */}
            <div className='space-y-6'>
              {/* Targets & Aspirations */}
              {(profile.targetedExams?.length ||
                profile.targetedInstitutions?.length ||
                profile.targetedCountries?.length ||
                profile.targetedCourses?.length) && (
                <SectionCard icon={Trophy} title='Targets & Goals' delay={0.25}>
                  <div className='space-y-3'>
                    <TagCloud
                      items={profile.targetedExams}
                      label='Targeted Exams'
                    />
                    <TagCloud
                      items={profile.targetedInstitutions}
                      label='Institutions'
                    />
                    <TagCloud
                      items={profile.targetedCountries}
                      label='Countries'
                    />
                    <TagCloud items={profile.targetedCourses} label='Courses' />
                    <TagCloud
                      items={profile.otherTargets}
                      label='Other Goals'
                    />
                  </div>
                </SectionCard>
              )}

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='p-4 rounded-xl bg-student-gradient text-white'
              >
                <h3 className='font-heading font-black text-lg mb-3'>
                  Quick Actions
                </h3>
                <div className='space-y-2'>
                  <button className='w-full px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[13px] font-bold transition-colors flex items-center justify-center gap-2'>
                    <Award className='w-4 h-4' />
                    View Academic Progress
                  </button>
                  <button className='w-full px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[13px] font-bold transition-colors flex items-center justify-center gap-2'>
                    <Activity className='w-4 h-4' />
                    Browse Activities
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
