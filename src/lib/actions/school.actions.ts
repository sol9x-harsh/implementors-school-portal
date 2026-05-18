'use server';

import dbConnect from '@/lib/db/mongodb';
import School from '@/lib/models/School';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from './admin.actions';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function createSchool(formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const contactNumber = formData.get('contactNumber') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const website = formData.get('website') as string;

  if (!name) {
    return { success: false, error: 'School name is required.' };
  }

  try {
    await School.create({
      name,
      address,
      contactNumber,
      contactEmail,
      website,
    });

    revalidatePath('/admin/schools');
    return { success: true };
  } catch (error: any) {
    if (error.code === 11000) {
      return {
        success: false,
        error: 'A school with this name already exists.',
      };
    }
    return { success: false, error: 'Failed to create school.' };
  }
}

export async function getSchools() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  await dbConnect();
  try {
    const schools = await School.find().sort({ name: 1 });
    return JSON.parse(JSON.stringify(schools));
  } catch (error) {
    return [];
  }
}

export async function updateSchool(id: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const contactNumber = formData.get('contactNumber') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const website = formData.get('website') as string;

  try {
    await School.findByIdAndUpdate(id, {
      name,
      address,
      contactNumber,
      contactEmail,
      website,
    });

    revalidatePath('/admin/schools');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update school.' };
  }
}

export async function deleteSchool(id: string) {
  await requireAdmin();
  await dbConnect();

  try {
    await School.findByIdAndDelete(id);
    revalidatePath('/admin/schools');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete school.' };
  }
}
