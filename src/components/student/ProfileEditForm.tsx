'use client';

import { useState } from 'react';
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
  Briefcase,
  School,
  Save,
  X,
  Lock,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ProfileEditFormProps {
  profile: any;
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CLASS_OPTIONS = ['9', '10', '11', '12'];
const STREAM_OPTIONS = [
  'PCM',
  'PCB',
  'PCMB',
  'Commerce (With Maths)',
  'Commerce (Without Maths)',
  'Humanities',
];

// Helper component for field labels with edit indicators
function FieldLabel({
  children,
  editable = true,
}: {
  children: React.ReactNode;
  editable?: boolean;
}) {
  return (
    <div className='flex items-center gap-2'>
      <Label className='text-sm font-medium text-student-foreground'>
        {children}
      </Label>
      {editable ? (
        <div className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-student-primary/10 border border-student-primary/20'>
          <Edit3 className='w-3 h-3 text-student-primary' />
          <span className='text-[9px] font-bold text-student-primary uppercase tracking-wider'>
            Can modify
          </span>
        </div>
      ) : (
        <div className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-student-muted/50 border border-student-border/20'>
          <Lock className='w-3 h-3 text-student-muted-foreground' />
          <span className='text-[9px] font-bold text-student-muted-foreground uppercase tracking-wider'>
            Cannot modify
          </span>
        </div>
      )}
    </div>
  );
}

export default function ProfileEditForm({
  profile,
  onSave,
  onCancel,
  isSubmitting,
}: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    institution: profile.institution || '',
    classLevel: profile.classLevel || '',
    stream: profile.stream || '',
    subjects: profile.subjects?.join(', ') || '',
    linkedInId: profile.linkedInId || '',
    fatherName: profile.fatherName || '',
    fatherOccupation: profile.fatherOccupation || '',
    fatherMobile: profile.fatherMobile || '',
    fatherEmail: profile.fatherEmail || '',
    motherName: profile.motherName || '',
    motherOccupation: profile.motherOccupation || '',
    motherMobile: profile.motherMobile || '',
    motherEmail: profile.motherEmail || '',
    targetedExams: profile.targetedExams?.join(', ') || '',
    targetedInstitutions: profile.targetedInstitutions?.join(', ') || '',
    targetedCountries: profile.targetedCountries?.join(', ') || '',
    targetedCourses: profile.targetedCourses?.join(', ') || '',
    otherTargets: profile.otherTargets?.join(', ') || '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });

    await onSave(submitFormData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* 1. Basic Information - Read Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className='bento-card p-6'>
          <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
            <div className='w-10 h-10 rounded-2xl bg-student-muted/20 flex items-center justify-center shadow-sm'>
              <User className='w-5 h-5 text-student-muted-foreground' />
            </div>
            <h2 className='font-heading font-black text-student-foreground'>
              Basic Information
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <FieldLabel editable={false}>Full Name</FieldLabel>
              <Input
                value={profile.name}
                disabled
                className='h-10 rounded-lg border-student-border/20 bg-student-muted/30 text-student-muted-foreground cursor-not-allowed'
              />
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={false}>Email Address</FieldLabel>
              <Input
                value={profile.email}
                disabled
                className='h-10 rounded-lg border-student-border/20 bg-student-muted/30 text-student-muted-foreground cursor-not-allowed'
              />
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={false}>Mobile Number</FieldLabel>
              <Input
                value={profile.mobileNo || 'Not provided'}
                disabled
                className='h-10 rounded-lg border-student-border/20 bg-student-muted/30 text-student-muted-foreground cursor-not-allowed'
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Academic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className='bento-card p-6'>
          <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
            <div className='w-10 h-10 rounded-2xl bg-student-primary/10 flex items-center justify-center shadow-sm'>
              <GraduationCap className='w-5 h-5 text-student-primary' />
            </div>
            <h2 className='font-heading font-black text-student-foreground'>
              Academic Information
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <FieldLabel editable={true}>Institution/School</FieldLabel>
              <Input
                id='institution'
                value={formData.institution}
                onChange={(e) =>
                  handleInputChange('institution', e.target.value)
                }
                placeholder='Enter your institution name'
                className='h-10 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={true}>Class Level</FieldLabel>
              <Select
                value={formData.classLevel}
                onValueChange={(value) =>
                  handleInputChange('classLevel', value)
                }
              >
                <SelectTrigger className='h-10 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'>
                  <SelectValue placeholder='Select class level' />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      Class {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={true}>Stream</FieldLabel>
              <Select
                value={formData.stream}
                onValueChange={(value) => handleInputChange('stream', value)}
              >
                <SelectTrigger className='h-10 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'>
                  <SelectValue placeholder='Select stream' />
                </SelectTrigger>
                <SelectContent>
                  {STREAM_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={true}>Subjects</FieldLabel>
              <Input
                id='subjects'
                value={formData.subjects}
                onChange={(e) => handleInputChange('subjects', e.target.value)}
                placeholder='Physics, Chemistry, Mathematics'
                className='h-10 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
              <p className='text-xs text-student-muted-foreground'>
                Separate multiple subjects with commas
              </p>
            </div>

            <div className='space-y-2 md:col-span-2'>
              <FieldLabel editable={true}>LinkedIn Profile</FieldLabel>
              <Input
                id='linkedInId'
                value={formData.linkedInId}
                onChange={(e) =>
                  handleInputChange('linkedInId', e.target.value)
                }
                placeholder='https://linkedin.com/in/yourprofile'
                className='h-10 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Parent Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className='bento-card p-6'>
          <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
            <div className='w-10 h-10 rounded-2xl bg-student-primary/10 flex items-center justify-center shadow-sm'>
              <User className='w-5 h-5 text-student-primary' />
            </div>
            <h2 className='font-heading font-black text-student-foreground'>
              Parent Information
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Father Details */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-student-foreground mb-3'>
                Father's Details
              </h3>
              <div className='space-y-3'>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Name</FieldLabel>
                  <Input
                    placeholder="Father's Name"
                    value={formData.fatherName}
                    onChange={(e) =>
                      handleInputChange('fatherName', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Occupation</FieldLabel>
                  <Input
                    placeholder="Father's Occupation"
                    value={formData.fatherOccupation}
                    onChange={(e) =>
                      handleInputChange('fatherOccupation', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Mobile</FieldLabel>
                  <Input
                    placeholder="Father's Mobile"
                    value={formData.fatherMobile}
                    onChange={(e) =>
                      handleInputChange('fatherMobile', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Email</FieldLabel>
                  <Input
                    type='email'
                    placeholder="Father's Email"
                    value={formData.fatherEmail}
                    onChange={(e) =>
                      handleInputChange('fatherEmail', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-student-foreground mb-3'>
                Mother's Details
              </h3>
              <div className='space-y-3'>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Name</FieldLabel>
                  <Input
                    placeholder="Mother's Name"
                    value={formData.motherName}
                    onChange={(e) =>
                      handleInputChange('motherName', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Occupation</FieldLabel>
                  <Input
                    placeholder="Mother's Occupation"
                    value={formData.motherOccupation}
                    onChange={(e) =>
                      handleInputChange('motherOccupation', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Mobile</FieldLabel>
                  <Input
                    placeholder="Mother's Mobile"
                    value={formData.motherMobile}
                    onChange={(e) =>
                      handleInputChange('motherMobile', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
                <div className='space-y-2'>
                  <FieldLabel editable={true}>Email</FieldLabel>
                  <Input
                    type='email'
                    placeholder="Mother's Email"
                    value={formData.motherEmail}
                    onChange={(e) =>
                      handleInputChange('motherEmail', e.target.value)
                    }
                    className='h-9 rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Career Goals & Aspirations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className='bento-card p-6'>
          <div className='flex items-center gap-3 mb-6 pb-4 border-b border-student-border/20'>
            <div className='w-10 h-10 rounded-2xl bg-student-primary/10 flex items-center justify-center shadow-sm'>
              <Target className='w-5 h-5 text-student-primary' />
            </div>
            <h2 className='font-heading font-black text-student-foreground'>
              Career Goals & Aspirations
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <FieldLabel editable={true}>Targeted Exams</FieldLabel>
              <Textarea
                id='targetedExams'
                value={formData.targetedExams}
                onChange={(e) =>
                  handleInputChange('targetedExams', e.target.value)
                }
                placeholder='JEE, NEET, CET, etc.'
                className='min-h-[80px] rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
              <p className='text-xs text-student-muted-foreground'>
                Separate multiple exams with commas
              </p>
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={true}>Targeted Courses</FieldLabel>
              <Textarea
                id='targetedCourses'
                value={formData.targetedCourses}
                onChange={(e) =>
                  handleInputChange('targetedCourses', e.target.value)
                }
                placeholder='Engineering, Medicine, Architecture, etc.'
                className='min-h-[80px] rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
              <p className='text-xs text-student-muted-foreground'>
                Separate multiple courses with commas
              </p>
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={true}>Targeted Institutions</FieldLabel>
              <Textarea
                id='targetedInstitutions'
                value={formData.targetedInstitutions}
                onChange={(e) =>
                  handleInputChange('targetedInstitutions', e.target.value)
                }
                placeholder='IITs, NITs, Medical Colleges, etc.'
                className='min-h-[80px] rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
              <p className='text-xs text-student-muted-foreground'>
                Separate multiple institutions with commas
              </p>
            </div>

            <div className='space-y-2'>
              <FieldLabel editable={true}>Targeted Countries</FieldLabel>
              <Textarea
                id='targetedCountries'
                value={formData.targetedCountries}
                onChange={(e) =>
                  handleInputChange('targetedCountries', e.target.value)
                }
                placeholder='USA, UK, Canada, Australia, etc.'
                className='min-h-[80px] rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
              <p className='text-xs text-student-muted-foreground'>
                Separate multiple countries with commas
              </p>
            </div>

            <div className='space-y-2 md:col-span-2'>
              <FieldLabel editable={true}>Other Goals</FieldLabel>
              <Textarea
                id='otherTargets'
                value={formData.otherTargets}
                onChange={(e) =>
                  handleInputChange('otherTargets', e.target.value)
                }
                placeholder='Any other goals or aspirations'
                className='min-h-[80px] rounded-lg border-student-primary/30 bg-white focus:border-student-primary focus:ring-2 focus:ring-student-primary/20'
              />
              <p className='text-xs text-student-muted-foreground'>
                Separate multiple goals with commas
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-3 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={isSubmitting}
          className='px-6 py-2 rounded-lg border-student-border/20 hover:bg-student-muted/50'
        >
          <X className='w-4 h-4 mr-2' />
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='px-6 py-2 rounded-lg bg-student-gradient text-white shadow-student hover:shadow-student-lg hover:-translate-y-0.5 transition-all'
        >
          {isSubmitting ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
              Saving...
            </>
          ) : (
            <>
              <Save className='w-4 h-4 mr-2' />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
