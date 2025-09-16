'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCompany, type CompanyState } from '../../actions';
import { CompanyForm } from '../../_components/CompanyForm';

interface EditCompanyClientPageProps {
  company: {
    id: string;
    name: string;
  };
}

const initialState: CompanyState = {};

export default function EditCompanyClientPage({ company }: EditCompanyClientPageProps) {
  const router = useRouter();
  const updateCompanyWithId = updateCompany.bind(null, company.id);
  const [state, formAction] = useFormState(updateCompanyWithId, initialState);

  useEffect(() => {
    if (state.message) {
      router.push('/admin/operations/companies');
    }
  }, [state, router]);

  return (
    <CompanyForm
      action={formAction as (formData: FormData) => void}
      state={state}
      initialData={{ name: company.name }}
    />
  );
}
