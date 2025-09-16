'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const userUpdateSchema = z.object({
  role: z.enum(['employee', 'company_admin', 'operations_admin']),
  company_id: z.string().uuid().nullable(),
  is_approved: z.boolean(),
});

export async function updateUser(userId: string, formData: FormData) {
  const supabase = createClient();

  const companyId = formData.get('company_id');

  const parsed = userUpdateSchema.safeParse({
    role: formData.get('role'),
    company_id: companyId === 'null' || companyId === '' ? null : companyId,
    is_approved: formData.get('is_approved') === 'true',
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    return { error: '잘못된 데이터 형식입니다.' };
  }

  // An admin cannot un-approve themselves or change their own role.
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (currentUser?.id === userId) {
      if(parsed.data.role !== 'operations_admin' || !parsed.data.is_approved){
          return { error: '자신의 역할이나 승인 상태를 변경할 수 없습니다.' };
      }
  }

  const { error } = await supabase
    .from('gsb_users')
    .update(parsed.data)
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/operations/users');
  return { error: null };
}
