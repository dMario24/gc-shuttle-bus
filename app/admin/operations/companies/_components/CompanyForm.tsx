'use client';

import { useFormState, useFormStatus } from 'react-dom';

interface CompanyFormProps {
  action: (formData: FormData) => Promise<{ error: any }>;
  initialData?: { name: string };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
    >
      {pending ? '저장 중...' : '저장'}
    </button>
  );
}

export function CompanyForm({ action, initialData }: CompanyFormProps) {
  const [state, formAction] = useFormState(action, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          기업 이름
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialData?.name}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
        {state?.error?.name && <p className="mt-1 text-sm text-red-500">{state.error.name[0]}</p>}
      </div>

      {state?.error?._form && <p className="mt-1 text-sm text-red-500">{state.error._form[0]}</p>}

      <SubmitButton />
    </form>
  );
}
