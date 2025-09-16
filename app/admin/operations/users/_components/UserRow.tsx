'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateUser, type UserState } from '../actions';
import { useEffect, useId } from 'react';
import toast from 'react-hot-toast';

// We need to define the types explicitly because they are coming from a server component
type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'employee' | 'company_admin' | 'operations_admin';
  is_approved: boolean;
  company_id: string | null;
  gsb_companies: { name: string }[] | null;
};

type Company = {
  id: string;
  name: string;
};

interface UserRowProps {
  user: User;
  companies: Company[];
}

const initialState: UserState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
    >
      {pending ? '저장중' : '저장'}
    </button>
  );
}

export function UserRow({ user, companies }: UserRowProps) {
  const formId = useId();
  const [state, formAction] = useFormState(updateUser, initialState);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.message) {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-3">{user.full_name || 'N/A'}</td>
      <td className="p-3">{user.email}</td>
      <td className="p-3">
        <select
          name="company_id"
          form={formId}
          defaultValue={user.company_id || 'null'}
          className="block w-full p-1 border border-gray-300 rounded-md"
        >
          <option value="null">-- 소속 없음 --</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <select
          name="role"
          form={formId}
          defaultValue={user.role}
          className="block w-full p-1 border border-gray-300 rounded-md"
        >
          <option value="employee">직원</option>
          <option value="company_admin">기업 관리자</option>
          <option value="operations_admin">운영 관리자</option>
        </select>
      </td>
      <td className="p-3">
        <select
          name="is_approved"
          form={formId}
          defaultValue={String(user.is_approved)}
          className={`block w-full p-1 border rounded-md ${user.is_approved ? 'border-green-300' : 'border-red-300'}`}
        >
          <option value="true">승인</option>
          <option value="false">미승인</option>
        </select>
      </td>
      <td className="p-3">
        <form id={formId} action={formAction}>
          <input type="hidden" name="userId" value={user.id} />
          <SubmitButton />
        </form>
      </td>
    </tr>
  );
}
