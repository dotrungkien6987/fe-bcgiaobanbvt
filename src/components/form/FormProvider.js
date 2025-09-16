import { FormProvider as RHFormProvider } from "react-hook-form";

function FormProvider({ children, onSubmit, methods }) {
  return (
    <RHFormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate>
        {children}
      </form>
    </RHFormProvider>
  );
}

export default FormProvider;
