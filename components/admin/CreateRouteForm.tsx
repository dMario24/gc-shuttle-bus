'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createRoute } from '@/app/admin/operations/routes/actions';
import { useEffect, useRef } from 'react';

const initialState = {
  message: null,
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
    >
      {pending ? '생성 중...' : '새 노선 생성'}
    </button>
  );
}

export default function CreateRouteForm() {
  const [state, formAction] = useFormState(createRoute, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 p-4 border rounded-lg bg-gray-50 mb-6">
      <h2 className="text-lg font-semibold">새 노선 추가</h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">노선명</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {state.errors?.name && <p className="text-sm text-red-500 mt-1">{state.errors.name}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        {state.errors?.description && <p className="text-sm text-red-500 mt-1">{state.errors.description}</p>}
      </div>
      <SubmitButton />
      {state.errors?._form && <p className="text-sm text-red-500 mt-2">{state.errors._form}</p>}
      {state.message && <p className="text-sm text-green-500 mt-2">{state.message}</p>}
    </form>
  );
}
