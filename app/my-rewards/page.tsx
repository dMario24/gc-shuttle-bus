import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

async function getMyRewards() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data, error } = await supabase
    .from('gsb_rewards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Get Rewards Error:", error);
    throw new Error('리워드 정보를 불러오는 데 실패했습니다.');
  }
  return data;
}

export default async function MyRewardsPage() {
  let rewards = [];
  let error = null;

  try {
    rewards = await getMyRewards();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">내 쿠폰함</h1>
      {error && <p className="text-red-500">{error}</p>}

      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map(reward => (
            <div key={reward.id} className={`p-6 rounded-lg shadow relative overflow-hidden ${reward.is_used ? 'bg-gray-100' : 'bg-white'}`}>
              {reward.is_used && <div className="absolute top-0 right-0 px-2 py-1 bg-gray-500 text-white text-xs font-bold">사용 완료</div>}
              <h2 className="text-lg font-bold text-indigo-600">5일 연속 탑승 리워드</h2>
              <p className="mt-2 text-2xl font-mono bg-gray-50 p-2 rounded text-center tracking-widest">{reward.coupon_code}</p>
              <div className="mt-4 text-sm text-gray-500 space-y-1">
                <p>발급일: {new Date(reward.created_at).toLocaleDateString()}</p>
                <p>만료일: {new Date(reward.expires_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && <p className="text-gray-500">아직 받은 쿠폰이 없습니다.</p>
      )}
    </div>
  );
}
