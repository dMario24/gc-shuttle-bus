'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const RouteSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: '노선명은 필수입니다.' }),
  description: z.string().optional(),
});

export async function createRoute(prevState: any, formData: FormData) {
  const validatedFields = RouteSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.from('gsb_routes').insert(validatedFields.data);

  if (error) {
    console.error('Create Route Error:', error);
    return { errors: { _form: '노선 생성에 실패했습니다.' } };
  }

  revalidatePath('/admin/operations/routes');
  return { message: '노선이 성공적으로 생성되었습니다.' };
}

export async function updateRoute(prevState: any, formData: FormData) {
  const validatedFields = RouteSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...routeData } = validatedFields.data;
  if (!id) {
      return { errors: { _form: 'ID가 필요합니다.' } };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('gsb_routes')
    .update(routeData)
    .eq('id', id);

  if (error) {
    console.error('Update Route Error:', error);
    return { errors: { _form: '노선 업데이트에 실패했습니다.' } };
  }

  revalidatePath('/admin/operations/routes');
  return { message: '노선이 성공적으로 업데이트되었습니다.' };
}

export async function deleteRoute(routeId: string) {
    if(!routeId) {
        return { error: 'ID가 필요합니다.' };
    }
  const supabase = createClient();
  const { error } = await supabase.from('gsb_routes').delete().eq('id', routeId);

  if (error) {
    console.error('Delete Route Error:', error);
    return { error: '노선 삭제에 실패했습니다. 이 노선을 사용하는 스케줄이 있는지 확인하세요.' };
  }

  revalidatePath('/admin/operations/routes');
  return { message: '노선이 성공적으로 삭제되었습니다.' };
}

// --- Schemas for Stops and Schedules ---
const StopSchema = z.object({
  route_id: z.string().uuid(),
  name: z.string().min(1, { message: '정류장 이름은 필수입니다.' }),
  stop_order: z.coerce.number().int().min(0, { message: '순서는 0 이상이어야 합니다.'}),
});

const ScheduleSchema = z.object({
    route_id: z.string().uuid(),
    departure_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'HH:MM 형식으로 입력해주세요.' }),
    total_seats: z.coerce.number().int().min(1, { message: '좌석 수는 1 이상이어야 합니다.'}),
});

// --- Stop Actions ---
export async function addStopToRoute(prevState: any, formData: FormData) {
    const validatedFields = StopSchema.safeParse({
        route_id: formData.get('route_id'),
        name: formData.get('name'),
        stop_order: formData.get('stop_order'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const supabase = createClient();
    const { error } = await supabase.from('gsb_stops').insert(validatedFields.data);

    if (error) {
        console.error('Add Stop Error:', error);
        return { errors: { _form: '정류장 추가에 실패했습니다.' } };
    }

    revalidatePath(`/admin/operations/routes/${formData.get('route_id')}/edit`);
    return { message: '정류장이 추가되었습니다.' };
}

export async function removeStopFromRoute(stopId: string, routeId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('gsb_stops').delete().eq('id', stopId);

    if (error) {
        console.error('Remove Stop Error:', error);
        return { error: '정류장 삭제에 실패했습니다.' };
    }
    revalidatePath(`/admin/operations/routes/${routeId}/edit`);
    return { message: '정류장이 삭제되었습니다.' };
}

// --- Schedule Actions ---
export async function addScheduleToRoute(prevState: any, formData: FormData) {
    const validatedFields = ScheduleSchema.safeParse({
        route_id: formData.get('route_id'),
        departure_time: formData.get('departure_time'),
        total_seats: formData.get('total_seats'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const supabase = createClient();
    const { error } = await supabase.from('gsb_schedules').insert(validatedFields.data);

    if (error) {
        console.error('Add Schedule Error:', error);
        return { errors: { _form: '스케줄 추가에 실패했습니다.' } };
    }

    revalidatePath(`/admin/operations/routes/${formData.get('route_id')}/edit`);
    return { message: '스케줄이 추가되었습니다.' };
}

export async function deleteSchedule(scheduleId: string, routeId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('gsb_schedules').delete().eq('id', scheduleId);

    if (error) {
        console.error('Delete Schedule Error:', error);
        return { error: '스케줄 삭제에 실패했습니다. 이 스케줄에 예약이 있는지 확인하세요.' };
    }

    revalidatePath(`/admin/operations/routes/${routeId}/edit`);
    return { message: '스케줄이 삭제되었습니다.' };
}
