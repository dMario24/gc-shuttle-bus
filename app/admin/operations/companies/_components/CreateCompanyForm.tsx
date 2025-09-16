'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCompany, type CompanyState } from '../actions';
import { CompanyForm } from './CompanyForm';

const initialState: CompanyState = {};

export function CreateCompanyForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(createCompany, initialState);

  useEffect(() => {
    if (state.message) {
      // On successful creation, redirect to the main companies page
      // Or you can just reset the form if you want to stay on the page
      router.push('/admin/operations/companies');
    }
  }, [state, router]);

  return (
    <CompanyForm
      action={formAction as (formData: FormData) => void}
      state={state}
    />
  );
}
