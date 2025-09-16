'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approveEmployee(userId: string, prevState: any) {
  const supabase = createClient();

  // 1. Get current user and their company
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) {
    return { error: '로그인이 필요합니다.' };
  }

  const { data: adminProfile } = await supabase
    .from('gsb_users')
    .select('role, company_id')
    .eq('id', adminUser.id)
    .single();

  if (adminProfile?.role !== 'company_admin' || !adminProfile.company_id) {
    return { error: '권한이 없습니다.' };
  }

  // 2. Get the user to be approved
  const { data: employeeToApprove } = await supabase
    .from('gsb_users')
    .select('company_id')
    .eq('id', userId)
    .single();

  // 3. Check if the user belongs to the admin's company
  if (employeeToApprove?.company_id !== adminProfile.company_id) {
    return { error: '다른 회사의 직원을 승인할 수 없습니다.' };
  }

  // 4. Update the user
  const { error } = await supabase
    .from('gsb_users')
    .update({ is_approved: true })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/company/employees');
  return { error: null };
}
