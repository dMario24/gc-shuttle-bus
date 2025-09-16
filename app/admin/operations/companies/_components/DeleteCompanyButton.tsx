'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { deleteCompany } from '../actions';

interface DeleteCompanyButtonProps {
  companyId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // This is not the ideal way, as it couples the button to the form's logic,
    // but it's a simple way to get a confirmation dialog.
    if (!confirm('정말로 이 기업을 삭제하시겠습니까? 연결된 사용자의 소속 정보가 null로 변경될 수 있습니다.')) {
      e.preventDefault();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={pending}
      className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
    >
      {pending ? '삭제 중...' : '삭제'}
    </button>
  );
}

export function DeleteCompanyButton({ companyId }: DeleteCompanyButtonProps) {
  // The action is bound with the companyId.
  const deleteCompanyWithId = deleteCompany.bind(null, companyId);
  const [state, formAction] = useFormState(deleteCompanyWithId, { error: null });

  return (
    <form action={formAction}>
      <SubmitButton />
      {state?.error?._form && (
        <p className="mt-1 text-sm text-red-500">{state.error._form[0]}</p>
      )}
    </form>
  );
}
