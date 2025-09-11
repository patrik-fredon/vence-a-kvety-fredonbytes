import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  );
}

export const metadata = {
  title: "Registrace | Pohřební věnce",
  description: "Vytvořte si nový účet",
};
