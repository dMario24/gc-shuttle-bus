import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  try {
    // Create a Supabase client with the service_role key
    const supabaseAdmin = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Find users eligible for a reward
    const { data: users, error: rpcError } = await supabaseAdmin.rpc(
      'find_consecutive_boarders',
      { p_consecutive_days: 5 }
    );

    if (rpcError) {
      throw new Error(`Error finding consecutive boarders: ${rpcError.message}`);
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users eligible for rewards today.' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Prepare rewards for eligible users
    const rewardsToInsert = users.map((user) => {
      const couponCode = `REWARD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Coupon expires in 30 days

      return {
        user_id: user.user_id,
        coupon_code: couponCode,
        expires_at: expiresAt.toISOString(),
      };
    });

    // 3. Insert rewards into the database
    const { error: insertError } = await supabaseAdmin
      .from('gsb_rewards')
      .insert(rewardsToInsert);

    if (insertError) {
      throw new Error(`Error inserting rewards: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ message: `Successfully issued ${rewardsToInsert.length} rewards.` }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
