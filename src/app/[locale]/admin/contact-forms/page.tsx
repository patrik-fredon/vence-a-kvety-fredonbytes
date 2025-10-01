import { redirect } from "next/navigation";
import { ContactFormsTable } from "@/components/admin/ContactFormsTable";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

interface ContactFormsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function ContactFormsPage({ params, searchParams }: ContactFormsPageProps) {
  const { locale } = await params;
  const { page = "1", status = "all", search = "" } = await searchParams;

  // Check authentication and admin role
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Check if user is admin (this would need to be implemented based on your user system)
  // For now, we'll assume any authenticated user can access this

  const supabase = createServerClient();

  // Build query
  let query = supabase
    .from("contact_forms")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (status !== "all") {
    query = query.eq("status", status as "new" | "read" | "replied" | "archived");
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
  }

  // Pagination
  const pageSize = 20;
  const offset = (Number.parseInt(page) - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  const { data: contactForms, error, count } = await query;

  if (error) {
    console.error("Error fetching contact forms:", error);
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-elegant text-3xl font-semibold text-primary-800 mb-2">
            Správa kontaktních formulářů
          </h1>
          <p className="text-teal-800">Přehled a správa zpráv od zákazníků</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.09M15 13h2m-2 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-800">Celkem zpráv</p>
                <p className="text-2xl font-semibold text-neutral-900">{count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-900 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-800">Nové</p>
                <p className="text-2xl font-semibold text-neutral-900">
                  {contactForms?.filter((form) => form.status === "new").length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-800">Zodpovězené</p>
                <p className="text-2xl font-semibold text-neutral-900">
                  {contactForms?.filter((form) => form.status === "replied").length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-800">Archivované</p>
                <p className="text-2xl font-semibold text-neutral-900">
                  {contactForms?.filter((form) => form.status === "archived").length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Forms Table */}
        <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow-soft">
          <ContactFormsTable
            contactForms={contactForms || []}
            currentPage={Number.parseInt(page)}
            totalPages={totalPages}
            currentStatus={status}
            currentSearch={search}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
