'use client';

import { Card, CardContent } from '@/components/ui/card';
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
import {
  PlusCircle,
  GripVertical,
  Trash2,
  FileText,
  Type,
  Hash,
  Upload,
  ChevronRight,
  Sparkles,
  Rss,
  Layers,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useTransition } from 'react';
import { createDataRequest } from '@/lib/actions/admin.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const fieldTypes = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'file', label: 'File Upload', icon: Upload },
];

interface Field {
  id: number;
  label: string;
  type: string;
}

const defaultFields: Field[] = [
  { id: 1, label: 'JEE Mains Percentile', type: 'number' },
  { id: 2, label: 'Official Scorecard (PDF)', type: 'file' },
];

let nextId = 3;

export default function DynamicFormsPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Field[]>(defaultFields);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetAudience, setTargetAudience] = useState('class12');
  const [isPending, startTransition] = useTransition();

  const addField = () => {
    setFields((prev) => [...prev, { id: nextId++, label: '', type: 'text' }]);
  };

  const removeField = (id: number) =>
    setFields((prev) => prev.filter((f) => f.id !== id));
  const updateField = (id: number, key: keyof Field, val: string) =>
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)),
    );

  const handleBroadcast = () => {
    if (!title || !deadline || fields.length === 0) {
      toast.error(
        'Please fill in all required fields and add at least one schema field.',
      );
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('deadline', deadline);
        formData.append('targetAudience', targetAudience);

        // Convert fields array to schema object
        const schemaJson: Record<string, any> = {};
        fields.forEach((f) => {
          schemaJson[f.label] = { type: f.type, required: true };
        });

        await createDataRequest(formData, schemaJson);
        toast.success('Campaign broadcasted successfully!');

        // Reset form
        setTitle('');
        setDeadline('');
        setFields([]);
      } catch (error: any) {
        toast.error('Failed to broadcast campaign: ' + error.message);
      }
    });
  };

  return (
    <div className='admin-shell space-y-6'>
      <AdminPageHeader
        section='Tools'
        title='Dynamic Form Builder'
        subtitle='Create custom data collection portals and requests without writing a single line of code.'
        icon={Layers}
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* ── Main Builder ───────────────────────────────── */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className='admin-card overflow-hidden'>
              <div className='px-5 py-4 border-b border-purple-border/30 flex items-center gap-3'>
                <div className='w-8 h-8 rounded-lg bg-purple-primary/10 flex items-center justify-center'>
                  <FileText className='w-4 h-4 text-purple-primary' />
                </div>
                <h2 className='font-heading font-bold text-[14px] text-purple-foreground'>
                  Global Configuration
                </h2>
              </div>
              <CardContent className='p-5 space-y-4'>
                <div className='space-y-1.5'>
                  <Label
                    htmlFor='form-title'
                    className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'
                  >
                    Request Campaign Title
                  </Label>
                  <Input
                    id='form-title'
                    placeholder='e.g. Upload JEE Mains Scorecard'
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    className='h-10 rounded-lg border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-medium'
                  />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='deadline'
                      className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'
                    >
                      Submission Deadline
                    </Label>
                    <Input
                      id='deadline'
                      type='date'
                      value={deadline}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
                      className='h-10 rounded-lg border-purple-border/40 bg-purple-secondary/20 focus:bg-white focus:border-purple-primary transition-all text-sm font-medium'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label className='text-[10px] font-black text-purple-foreground/75 uppercase tracking-widest'>
                      Target Student Cohort
                    </Label>
                    <Select
                      value={targetAudience}
                      onValueChange={(v: string | null) => setTargetAudience(v || 'class12')}
                    >
                      <SelectTrigger className='h-10 rounded-lg border-purple-border/40 bg-purple-secondary/20 focus:border-purple-primary transition-all text-sm font-medium'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-purple-border/30 shadow-purple-md'>
                        <SelectItem value='class12'>Class 12 (All)</SelectItem>
                        <SelectItem value='class12pcm'>Class 12 (PCM)</SelectItem>
                        <SelectItem value='class11'>Class 11 (All)</SelectItem>
                        <SelectItem value='all'>All Registered Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <Card className='admin-card overflow-hidden'>
              <div className='px-5 py-4 border-b border-purple-border/20 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-purple-primary/10 flex items-center justify-center'>
                    <Sparkles className='w-4 h-4 text-purple-primary' />
                  </div>
                  <h2 className='font-heading font-bold text-[14px] text-purple-foreground'>
                    Schema Definitions
                  </h2>
                  <span className='text-[10px] bg-purple-secondary px-2.5 py-0.5 rounded-full font-black text-purple-primary'>
                    {fields.length}
                  </span>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={addField}
                  className='rounded-lg border-purple-primary/30 text-purple-primary hover:bg-purple-primary hover:text-white transition-all duration-200 gap-1.5 text-[11px] font-bold h-8 px-3'
                >
                  <PlusCircle className='w-3.5 h-3.5' /> Add Field
                </Button>
              </div>
              <CardContent className='p-5 space-y-3'>
                {fields.map((field, i) => {
                  const TypeIcon =
                    fieldTypes.find((ft) => ft.value === field.type)?.icon ??
                    Type;
                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className='flex items-center gap-3 p-3.5 bg-purple-secondary/15 rounded-xl border border-purple-border/20
                        hover:border-purple-primary/30 hover:bg-white hover:shadow-purple-xs transition-all duration-150 group'
                    >
                      <GripVertical className='w-4 h-4 text-purple-muted-foreground/30 cursor-grab shrink-0' />
                      <div className='w-8 h-8 rounded-lg bg-white border border-purple-border/30 flex items-center justify-center shrink-0 shadow-sm'>
                        <TypeIcon className='w-4 h-4 text-purple-primary' />
                      </div>
                      <div className='flex-1 grid grid-cols-2 gap-3'>
                        <Input
                          value={field.label}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(field.id, 'label', e.target.value)}
                          placeholder='Field label'
                          className='h-9 rounded-lg border-purple-border/30 bg-white text-sm font-medium focus:border-purple-primary transition-all'
                        />
                        <Select
                          value={field.type}
                          onValueChange={(val: string | null) => updateField(field.id, 'type', val || 'text')}
                        >
                          <SelectTrigger className='h-9 rounded-lg border-purple-border/30 bg-white text-sm font-medium focus:border-purple-primary'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className='rounded-xl border-purple-border/30'>
                            {fieldTypes.map((ft) => (
                              <SelectItem key={ft.value} value={ft.value}>
                                {ft.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => removeField(field.id)}
                        className='w-8 h-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 opacity-60 group-hover:opacity-100 transition-all'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </motion.div>
                  );
                })}

                {fields.length === 0 && (
                  <div className='text-center py-14 text-purple-muted-foreground bg-purple-secondary/10 rounded-3xl border-2 border-dashed border-purple-border/25'>
                    <div className='flex justify-center gap-1 mb-4 opacity-20'>
                      {[32, 48, 36, 52, 28].map((h, i) => (
                        <div key={i} className='w-4 rounded-sm bg-purple-primary' style={{ height: h }} />
                      ))}
                    </div>
                    <p className='text-[11px] font-black uppercase tracking-widest opacity-60'>Schema is Empty</p>
                    <p className='text-xs font-medium mt-1.5 opacity-40'>Click &quot;Append Field&quot; above to begin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Publish Sidebar ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.22 }}
          className='space-y-6'
        >
          <div className='sticky top-16 space-y-4'>
            {/* Publish Card */}
            <div className='rounded-xl overflow-hidden shadow-purple-md bg-purple-gradient relative'>
              <div className='p-6 relative z-10'>
                <div className='w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20'>
                  <Rss className='w-4 h-4 text-white' />
                </div>
                <h3 className='font-heading font-black text-white text-base mb-1.5'>
                  Finalize & Deploy
                </h3>
                <p className='text-white/70 text-[12px] font-medium leading-relaxed mb-5'>
                  Deploying this configuration will instantly notify the targeted student body.
                </p>
                <Button
                  onClick={handleBroadcast}
                  disabled={isPending}
                  className='w-full h-10 rounded-xl bg-white text-purple-primary font-bold text-sm hover:bg-purple-secondary active:scale-95 border-none transition-all shadow-lg'
                >
                  {isPending ? <><Loader2 className='w-4 h-4 animate-spin mr-2 inline' /> Broadcasting...</> : 'Broadcast Campaign'}
                </Button>
              </div>
            </div>

            {/* Status card */}
            <div className='admin-card p-5 space-y-4'>
              <p className='text-[11px] font-black text-purple-muted-foreground uppercase tracking-[0.2em]'>
                Deployment Readiness
              </p>
              <div className='space-y-3'>
                {[
                  { label: 'Schema configured', ok: fields.length > 0 },
                  { label: 'Campaign Identity set', ok: !!title },
                  { label: 'Timeline established', ok: !!deadline },
                ].map((item) => (
                  <div key={item.label} className='flex items-center gap-3 transition-all'>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${item.ok ? 'bg-purple-primary shadow-purple-xs' : 'bg-purple-secondary border border-purple-border/30'}`}
                    >
                      {item.ok && (
                        <svg className='w-3 h-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-[12px] font-bold transition-colors ${item.ok ? 'text-purple-foreground' : 'text-purple-muted-foreground/40'}`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className='pt-4 border-t border-purple-border/30'>
                <p className='text-[10px] text-purple-muted-foreground font-medium leading-relaxed italic'>
                  Ensure all configuration parameters are finalized before
                  broadcasting the deployment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
