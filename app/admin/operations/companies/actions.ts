'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(1, '기업 이름은 필수입니다.'),
});

// useFormState는 (prevState, formData) 두 개의 인자를 전달합니다.
// prevState는 이 액션에서 사용하지 않지만, 시그니처를 맞춰주어야 합니다.
export async function createCompany(prevState: any, formData: FormData) {
  const supabase = createClient();
  const parsed = companySchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    // Zod 에러를 useFormState가 사용할 수 있는 형태로 변환합니다.
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

// bind를 통해 id가 첫 번째 인자로 전달되므로, prevState와 formData를 그 뒤에 받습니다.
export async function updateCompany(id: string, prevState: any, formData: FormData) {
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
