'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type CompanyState = {
  error?: {
    name?: string[];
    _form?: string[];
  };
  message?: string;
};

const companySchema = z.object({
  name: z.string().min(1, '기업 이름은 필수입니다.'),
});

export async function createCompany(prevState: CompanyState, formData: FormData): Promise<CompanyState> {
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
  // On success, redirect is handled by the form component
  return { message: '기업이 성공적으로 생성되었습니다.' };
}

export async function updateCompany(id: string, prevState: CompanyState, formData: FormData): Promise<CompanyState> {
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
  return { message: '기업 정보가 성공적으로 업데이트되었습니다.' };
}

export async function deleteCompany(id: string, prevState: any) {
  const supabase = createClient();

  const { error } = await supabase
    .from('gsb_companies')
    .delete()
    .eq('id', id);

  if (error) {
    // useFormState를 위해 에러 객체를 반환합니다.
    return { error: { _form: [error.message] } };
  }

  revalidatePath('/admin/operations/companies');
  // 성공 시에는 redirect를 하지 않고, revalidate만으로 UI가 업데이트되도록 합니다.
  // 성공 메시지는 클라이언트 컴포넌트에서 state를 보고 처리할 수 있습니다.
  return { error: null };
}
