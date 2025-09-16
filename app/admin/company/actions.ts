'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function verifyCompanyAdmin(companyId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("인증이 필요합니다.");

    const { data: adminProfile } = await supabase
        .from('gsb_users')
        .select('role, company_id')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'company_admin' || adminProfile?.company_id !== companyId) {
        throw new Error("권한이 없습니다.");
    }
}

export async function approveEmployee(employeeId: string, companyId: string) {
    if (!employeeId || !companyId) return { error: "필요한 정보가 누락되었습니다." };

    try {
        await verifyCompanyAdmin(companyId);
    } catch(e: any) {
        return { error: e.message };
    }

    const supabase = createClient();
    const { error } = await supabase
        .from('gsb_users')
        .update({ is_approved: true })
        .eq('id', employeeId)
        .eq('company_id', companyId); // Double check ownership

    if (error) {
        console.error("Approve Employee Error:", error);
        return { error: "직원 승인에 실패했습니다." };
    }

    revalidatePath('/admin/company');
    return { message: "직원을 승인했습니다." };
}
