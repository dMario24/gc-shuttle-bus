'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(1, '기업 이름은 필수입니다.'),
});

export async function createCompany(formData: FormData) {
  const supabase = createClient();
  const parsed = companySchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('gsb_companies')
    .insert({ name: parsed.data.name });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/admin/operations/companies');
  redirect('/admin/operations/companies');
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = createClient();
  const parsed = companySchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('gsb_companies')
    .update({ name: parsed.data.name })
    .eq('id', id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/admin/operations/companies');
  revalidatePath(`/admin/operations/companies/${id}/edit`);
  redirect('/admin/operations/companies');
}

export async function deleteCompany(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('gsb_companies')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/admin/operations/companies');
  return { error: null };
}
