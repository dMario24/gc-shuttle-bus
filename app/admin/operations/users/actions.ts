'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type UserState = { error?: string; message?: string; };

const userUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['employee', 'company_admin', 'operations_admin']),
  company_id: z.string().uuid().nullable(),
  is_approved: z.boolean(),
});

export async function updateUser(prevState: UserState, formData: FormData): Promise<UserState> {
  const supabase = createClient();

  const companyId = formData.get('company_id');

  const parsed = userUpdateSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
    company_id: companyId === 'null' || companyId === '' ? null : companyId,
    is_approved: formData.get('is_approved') === 'true',
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    return { error: '잘못된 데이터 형식입니다.' };
  }

  const { userId, ...updateData } = parsed.data;

  // An admin cannot un-approve themselves or change their own role.
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (currentUser?.id === userId) {
      if(updateData.role !== 'operations_admin' || !updateData.is_approved){
          return { error: '자신의 역할이나 승인 상태를 변경할 수 없습니다.' };
      }
  }

  const { error } = await supabase
    .from('gsb_users')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/operations/users');
  return { message: '사용자 정보가 업데이트되었습니다.' };
}
