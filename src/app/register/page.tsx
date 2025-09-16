import { RegistrationForm } from '@/components/register/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Register New Card</h1>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}
