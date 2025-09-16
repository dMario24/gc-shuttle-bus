'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { approveEmployee, type ApproveState } from '../../actions';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface ApproveButtonProps {
  employeeId: string;
  companyId: string;
}

const initialState: ApproveState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
    >
      {pending ? '승인 중...' : '승인'}
    </button>
  );
}

export function ApproveButton({ employeeId, companyId }: ApproveButtonProps) {
  const [state, formAction] = useFormState(approveEmployee, initialState);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.message) {
        toast.success(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="companyId" value={companyId} />
      <SubmitButton />
    </form>
  );
}
