'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { approveEmployee } from '../actions';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface ApproveButtonProps {
  userId: string;
}

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

export function ApproveButton({ userId }: ApproveButtonProps) {
  const approveEmployeeWithId = approveEmployee.bind(null, userId);
  const [state, formAction] = useFormState(approveEmployeeWithId, { error: undefined });

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.error === null) {
        toast.success("직원을 승인했습니다.");
    }
  }, [state]);

  return (
    <form action={formAction}>
      <SubmitButton />
    </form>
  );
}
