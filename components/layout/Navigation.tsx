import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import SignOutButton from '../auth/SignOutButton';

type NavigationProps = {
  user: User | null;
  role: string | null;
  displayName: string | null;
};

export default function Navigation({ user, role, displayName }: NavigationProps) {
  return (
    <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          GSB
        </Link>
        <Link href="/routes" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
          노선 보기
        </Link>
        {role === 'employee' && (
          <>
            <Link href="/my-reservations" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
              내 예약
            </Link>
            <Link href="/my-rewards" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
              내 쿠폰
            </Link>
          </>
        )}
        {role === 'company_admin' && (
          <Link href="/admin/company" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
            기업 관리
          </Link>
        )}
        {role === 'operations_admin' && (
          <Link href="/admin/operations" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
            운영 관리
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-700">안녕하세요, {displayName}님</span>
            <SignOutButton />
          </>
        ) : (
          <Link href="/auth" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
