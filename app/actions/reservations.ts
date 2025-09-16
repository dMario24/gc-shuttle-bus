'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ReservationState = {
  error?: string;
  success?: boolean;
};

export async function createReservation(prevState: ReservationState, formData: FormData): Promise<ReservationState> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const scheduleId = formData.get('schedule_id');
  const reservationDate = formData.get('reservation_date');

  if (!scheduleId || !reservationDate) {
    return { error: '날짜와 시간을 선택해주세요.' };
  }

  const reservationDateStr = reservationDate as string;
  const scheduleIdStr = scheduleId as string;

  // 1. Check for existing reservation for the same user, schedule, and date
  const { data: existingReservation } = await supabase
    .from('gsb_reservations')
    .select('id')
    .eq('user_id', user.id)
    .eq('schedule_id', scheduleIdStr)
    .eq('reservation_date', reservationDateStr)
    .maybeSingle();

  if (existingReservation) {
    return { error: '이미 해당 날짜와 시간에 예약 내역이 존재합니다.' };
  }

  // 2. Check for available seats
  const { data: schedule } = await supabase
    .from('gsb_schedules')
    .select('total_seats')
    .eq('id', scheduleIdStr)
    .single();

  if (!schedule) {
    return { error: '유효하지 않은 스케줄입니다.' };
  }

  const { count: reservationCount, error: countError } = await supabase
    .from('gsb_reservations')
    .select('*', { count: 'exact', head: true })
    .eq('schedule_id', scheduleIdStr)
    .eq('reservation_date', reservationDateStr);

  if (reservationCount !== null && reservationCount >= schedule.total_seats) {
      return { error: '죄송합니다. 모든 좌석이 예약되었습니다.' };
  }

  // 3. Create the reservation
  const { error: insertError } = await supabase.from('gsb_reservations').insert({
    user_id: user.id,
    schedule_id: scheduleIdStr,
    reservation_date: reservationDateStr,
    status: 'confirmed',
    qr_code: crypto.randomUUID(), // Generate a unique QR code
  });

  if (insertError) {
    console.error('Reservation Insert Error:', insertError);
    return { error: '예약 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
  }

  // 4. Success: Revalidate paths
  revalidatePath('/my-reservations');
  revalidatePath('/routes');
  return { success: true };
}

export async function cancelReservation(reservationId: string) {
  if (!reservationId) {
    throw new Error('예약 ID가 필요합니다.');
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증이 필요합니다.');
  }

  // Cancel하기 전에 예약이 사용자의 것인지 확인
  const { data: reservation, error: fetchError } = await supabase
    .from('gsb_reservations')
    .select('id, user_id')
    .eq('id', reservationId)
    .single();

  if (fetchError || !reservation) {
    throw new Error('예약을 찾을 수 없습니다.');
  }

  if (reservation.user_id !== user.id) {
    throw new Error('이 예약을 취소할 권한이 없습니다.');
  }

  // 상태를 'cancelled'로 업데이트
  const { error: updateError } = await supabase
    .from('gsb_reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId);

  if (updateError) {
    console.error('Cancel Reservation Error:', updateError);
    throw new Error('예약 취소에 실패했습니다.');
  }

  // Revalidation은 이 액션을 호출하는 컴포넌트에서 처리
}
