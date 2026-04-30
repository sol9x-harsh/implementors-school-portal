'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { submitDataRequest } from '@/lib/actions/student.actions';
import { toast } from 'sonner';

interface FormRendererClientProps {
  requestId: string;
  title: string;
  deadline?: Date;
  initialSchema: {
    fields: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  };
}

export default function FormRendererClient({
  requestId,
  title,
  deadline,
  initialSchema,
}: FormRendererClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await submitDataRequest(requestId, formData);
      if (result.success) {
        setIsSuccess(true);
        toast.success('Submission successful');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='p-8 flex items-center justify-center min-h-[60vh]'>
        <Card className='w-full max-w-md text-center py-12 rounded-[2.5rem] border-student-border/30 shadow-student-lg'>
          <CardContent>
            <div className='w-20 h-20 bg-student-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-student-md'>
              <CheckCircle className='w-10 h-10 text-white' />
            </div>
            <h2 className='text-2xl font-heading font-black text-student-foreground'>
              Submission Received
            </h2>
            <p className='text-student-muted-foreground mt-2 font-medium'>
              Your data has been sent for institutional verification.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-8 space-y-8 flex items-center justify-center min-h-[calc(100vh-120px)]'>
      <Card className='w-full max-w-2xl rounded-[2.5rem] border-student-border/30 shadow-student-lg overflow-hidden'>
        <CardHeader className='bg-student-secondary/20 p-10 border-b border-student-border/10'>
          <div className='h-1.5 w-full bg-student-gradient rounded-full mb-6' />
          <div className='flex items-center gap-3 mb-4'>
            <div className='px-3 py-1 rounded-full bg-student-gradient text-white text-[10px] font-black uppercase tracking-widest shadow-student-sm'>
              Active Request
            </div>
          </div>
          <CardTitle className='text-3xl font-heading font-black text-student-foreground'>
            {title}
          </CardTitle>
          {deadline && (
            <CardDescription className='text-student-primary font-bold uppercase tracking-widest text-xs mt-2'>
              Submission Deadline:{' '}
              {new Date(deadline).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className='p-10'>
          <form onSubmit={handleSubmit} className='space-y-8'>
            {initialSchema.fields.map((field) => (
              <div key={field.id} className='space-y-3'>
                <Label
                  htmlFor={field.id}
                  className='text-xs font-black text-student-foreground uppercase tracking-widest ml-1'
                >
                  {field.label}
                </Label>

                {field.type === 'text' && (
                  <Input
                    id={field.id}
                    name={field.id}
                    type='text'
                    required
                    className='h-12 rounded-2xl border-student-border/40 bg-student-secondary/10 focus:bg-white focus:border-student-primary transition-all font-semibold'
                  />
                )}

                {field.type === 'number' && (
                  <Input
                    id={field.id}
                    name={field.id}
                    type='number'
                    step='0.01'
                    required
                    className='h-12 rounded-2xl border-student-border/40 bg-student-secondary/10 focus:bg-white focus:border-student-primary transition-all font-semibold'
                  />
                )}

                {field.type === 'file' && (
                  <div className='border-2 border-dashed border-student-border/30 rounded-3xl p-10 text-center hover:bg-student-secondary/20 transition-all cursor-pointer relative group'>
                    <UploadCloud className='w-10 h-10 text-student-primary/40 mx-auto mb-3 group-hover:scale-110 transition-transform' />
                    <p className='text-sm font-bold text-student-foreground'>
                      Click or drag to upload document
                    </p>
                    <p className='text-[10px] text-student-muted-foreground uppercase font-black tracking-tighter mt-1'>
                      PDF, PNG, or JPG (Max 5MB)
                    </p>
                    <Input
                      id={field.id}
                      name={field.id}
                      type='file'
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                      required
                    />
                  </div>
                )}
              </div>
            ))}

            <div className='pt-6 border-t border-student-border/10'>
              <Button
                type='submit'
                className='w-full h-14 rounded-2xl bg-student-gradient text-white font-heading font-black text-sm shadow-student-lg hover:scale-[1.01] active:scale-95 transition-all'
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Processing Submission...'
                  : 'Transmit for Verification'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
