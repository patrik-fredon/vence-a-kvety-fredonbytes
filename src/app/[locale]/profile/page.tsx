import { UserProfile } from "@/components/auth";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserProfile />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Můj profil | Pohřební věnce",
  description: "Spravujte svůj účet a nastavení",
};
