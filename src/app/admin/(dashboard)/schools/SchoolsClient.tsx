'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Plus, School as SchoolIcon, Edit, Trash2, Globe, MapPin, 
  Phone, Mail, Loader2, Search, ChevronRight, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { createSchool, updateSchool, deleteSchool } from '@/lib/actions/school.actions';

interface SchoolItem {
  _id: string;
  name: string;
  address?: string;
  contactNumber?: string;
  contactEmail?: string;
  website?: string;
}

export default function SchoolsClient({ initialSchools }: { initialSchools: SchoolItem[] }) {
  const [schools, setSchools] = useState<SchoolItem[]>(initialSchools);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setAddress('');
    setContactNumber('');
    setContactEmail('');
    setWebsite('');
    setEditingId(null);
  };

  const handleEdit = (school: SchoolItem) => {
    setEditingId(school._id);
    setName(school.name);
    setAddress(school.address || '');
    setContactNumber(school.contactNumber || '');
    setContactEmail(school.contactEmail || '');
    setWebsite(school.website || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      const res = await deleteSchool(id);
      if (res.success) {
        toast.success('School deleted');
        setSchools(prev => prev.filter(s => s._id !== id));
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set('name', name);
    formData.set('address', address);
    formData.set('contactNumber', contactNumber);
    formData.set('contactEmail', contactEmail);
    formData.set('website', website);

    try {
      if (editingId) {
        const res = await updateSchool(editingId, formData);
        if (res.success) {
          toast.success('School updated');
          setSchools(prev => prev.map(s => s._id === editingId ? { ...s, name, address, contactNumber, contactEmail, website } : s));
          setIsModalOpen(false);
          resetForm();
        } else {
          toast.error(res.error || 'Failed to update');
        }
      } else {
        const res = await createSchool(formData);
        if (res.success) {
          toast.success('School created');
          window.location.reload(); // Refresh to get the new ID
        } else {
          toast.error(res.error || 'Failed to create');
        }
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='admin-shell space-y-8'>
      <AdminPageHeader
        section='Management'
        title='School Management'
        subtitle='Create and manage schools to assign students and organize academic cohorts.'
        icon={SchoolIcon}
        actions={
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}
            className='h-9 px-4 rounded-xl bg-purple-primary hover:bg-purple-primary/90 text-white font-bold gap-2 btn-shimmer shadow-purple-sm'>
            <Plus className='w-4 h-4' /> Add School
          </Button>
        }
      />

      {/* Search Bar */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-muted-foreground' />
        <Input
          placeholder='Search schools by name...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10 h-11 rounded-2xl border-purple-border/30 bg-white/50 backdrop-blur-sm focus:bg-white transition-all shadow-sm'
        />
      </div>

      {/* Schools Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AnimatePresence mode='popLayout'>
          {filteredSchools.map((school, idx) => (
            <motion.div
              key={school._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className='group bg-white rounded-[2rem] border border-purple-border/30 shadow-purple-xs hover:shadow-purple-md transition-all duration-300 p-6 flex flex-col'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='w-12 h-12 rounded-2xl bg-purple-primary/10 flex items-center justify-center text-purple-primary shrink-0'>
                  <SchoolIcon className='w-6 h-6' />
                </div>
                <div className='flex gap-1'>
                  <Button variant='ghost' size='icon' onClick={() => handleEdit(school)}
                    className='w-8 h-8 rounded-lg text-purple-muted-foreground hover:text-purple-primary hover:bg-purple-primary/10'>
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button variant='ghost' size='icon' onClick={() => handleDelete(school._id)}
                    className='w-8 h-8 rounded-lg text-purple-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              <h3 className='text-lg font-heading font-black text-purple-foreground leading-tight mb-4 group-hover:text-purple-primary transition-colors'>
                {school.name}
              </h3>

              <div className='space-y-2.5 mt-auto'>
                {school.address && (
                  <div className='flex items-center gap-2 text-xs font-medium text-purple-muted-foreground'>
                    <MapPin className='w-3.5 h-3.5 shrink-0 opacity-60' />
                    <span className='truncate'>{school.address}</span>
                  </div>
                )}
                {school.contactNumber && (
                  <div className='flex items-center gap-2 text-xs font-medium text-purple-muted-foreground'>
                    <Phone className='w-3.5 h-3.5 shrink-0 opacity-60' />
                    <span>{school.contactNumber}</span>
                  </div>
                )}
                {school.contactEmail && (
                  <div className='flex items-center gap-2 text-xs font-medium text-purple-muted-foreground'>
                    <Mail className='w-3.5 h-3.5 shrink-0 opacity-60' />
                    <span className='truncate'>{school.contactEmail}</span>
                  </div>
                )}
                {school.website && (
                  <div className='flex items-center gap-2 text-xs font-medium text-purple-primary/80'>
                    <Globe className='w-3.5 h-3.5 shrink-0' />
                    <a href={school.website} target='_blank' rel='noopener noreferrer' className='hover:underline truncate'>
                      {school.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSchools.length === 0 && (
          <div className='col-span-full py-20 flex flex-col items-center gap-4 text-purple-muted-foreground'>
            <div className='w-20 h-20 rounded-[2.5rem] bg-purple-secondary/40 flex items-center justify-center'>
              <SchoolIcon className='w-10 h-10 opacity-20' />
            </div>
            <p className='font-bold uppercase tracking-widest text-sm'>No schools found</p>
            <Button variant='outline' onClick={() => { resetForm(); setIsModalOpen(true); }}
              className='rounded-xl border-purple-border/50 text-[11px] font-black uppercase tracking-widest px-6 h-9'>
              Add Your First School
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-md rounded-[2.5rem] border-purple-border/30 shadow-purple-lg p-0 overflow-hidden'>
          <div className='h-2 bg-purple-gradient' />
          <DialogHeader className='px-8 pt-8'>
            <DialogTitle className='text-2xl font-heading font-black text-purple-foreground flex items-center gap-3'>
              {editingId ? <Edit className='w-6 h-6 text-purple-primary' /> : <Plus className='w-6 h-6 text-purple-primary' />}
              {editingId ? 'Edit School' : 'Register New School'}
            </DialogTitle>
            <DialogDescription className='text-purple-muted-foreground font-medium'>
              Define the school profile to enable student assignments and filtered reporting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='px-8 py-6 space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='schoolName' className='text-[10px] font-black uppercase tracking-widest text-purple-foreground/70 ml-1'>
                School Name <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='schoolName'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. SOL9X Global Academy'
                required
                className='h-12 rounded-2xl border-purple-border/30 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary text-sm font-semibold'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address' className='text-[10px] font-black uppercase tracking-widest text-purple-foreground/70 ml-1'>
                Address
              </Label>
              <Input
                id='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='e.g. 123 Education St, New Delhi'
                className='h-12 rounded-2xl border-purple-border/30 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary text-sm font-medium'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='contactPhone' className='text-[10px] font-black uppercase tracking-widest text-purple-foreground/70 ml-1'>
                  Contact Phone
                </Label>
                <Input
                  id='contactPhone'
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder='+91 98765 43210'
                  className='h-12 rounded-2xl border-purple-border/30 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary text-sm font-medium'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='contactEmail' className='text-[10px] font-black uppercase tracking-widest text-purple-foreground/70 ml-1'>
                  Contact Email
                </Label>
                <Input
                  id='contactEmail'
                  type='email'
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder='admin@school.com'
                  className='h-12 rounded-2xl border-purple-border/30 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary text-sm font-medium'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='website' className='text-[10px] font-black uppercase tracking-widest text-purple-foreground/70 ml-1'>
                Website URL
              </Label>
              <Input
                id='website'
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder='https://www.school.com'
                className='h-12 rounded-2xl border-purple-border/30 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary text-sm font-medium'
              />
            </div>

            <DialogFooter className='pt-4 pb-2'>
              <Button type='button' variant='ghost' onClick={() => setIsModalOpen(false)}
                className='h-12 rounded-2xl font-bold text-purple-muted-foreground hover:text-purple-foreground'>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting || !name}
                className='h-12 flex-1 rounded-2xl bg-purple-gradient text-white font-heading font-black text-sm uppercase tracking-widest shadow-purple-md btn-shimmer'>
                {isSubmitting ? <Loader2 className='w-4 h-4 animate-spin' /> : (editingId ? 'Update Profile' : 'Register School')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title='Delete school?'
        description='This will permanently remove the school and all associated records. This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
