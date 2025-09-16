import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          GSB 셔틀 예약 시스템
        </h1>
        <AuthForm />
      </div>
    </div>
  );
}
