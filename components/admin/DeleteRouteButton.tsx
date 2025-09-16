'use client';

import { deleteRoute } from '@/app/admin/operations/routes/actions';
import { useTransition } from 'react';

export default function DeleteRouteButton({ routeId, routeName }: { routeId: string; routeName: string; }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirm(`정말로 "${routeName}" 노선을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      startTransition(async () => {
        const result = await deleteRoute(routeId);
        if (result?.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-red-600 hover:text-red-900 disabled:text-gray-400"
    >
      {isPending ? '삭제 중...' : '삭제'}
    </button>
  );
}
