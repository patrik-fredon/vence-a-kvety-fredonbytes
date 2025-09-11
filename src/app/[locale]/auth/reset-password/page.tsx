import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <ResetPasswordForm />
    </div>
  );
}

export const metadata = {
  title: "Nové heslo | Pohřební věnce",
  description: "Nastavte si nové heslo",
};
