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
  const searchParamsResolved = await searchParams;
  const page = searchParamsResolved.page || "1";
  const status = searchParamsResolved.status || "all";
  const search = searchParamsResolved.search || "";

  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const supabase = await createServerClient();

  // Build query
  let query = supabase.from("contact_forms").select("*", { count: "exact" });

  // Apply filters
  if (status !== "all" && typeof status === "string") {
    query = query.eq("status", status as "new" | "read" | "replied" | "archived");
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`
    );
  }

  // Get total count for pagination
  const { count: totalCount } = await query;

  // Pagination
  const pageSize = 20;
  const offset = (Number.parseInt(page, 10) - 1) * pageSize;
  query = query.range(offset, offset + pageSize - 1);

  // Order by created_at desc
  query = query.order("created_at", { ascending: false });

  const { data: contactForms, error } = await query;

  if (error) {
    console.error("Error fetching contact forms:", error);
    return <div>Error loading contact forms</div>;
  }

  const totalPages = Math.ceil((totalCount || 0) / pageSize);

  // Get stats
  const { data: stats } = await supabase
    .from("contact_forms")
    .select("status")
    .then(({ data }) => {
      const statusCounts = data?.reduce(
        (acc, form) => {
          acc[form.status] = (acc[form.status] || 0) + 1;
          return acc;
        },
        { new: 0, read: 0, replied: 0, archived: 0 } as Record<string, number>
      );
      return { data: statusCounts };
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contact Forms</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-funeral-gold rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-blue-600 mr-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="New contact forms"
                role="img"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-800 truncate">New</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats?.["new"] || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-funeral-gold rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-900 mr-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Read contact forms"
                role="img"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-800 truncate">Read</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats?.["read"] || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-funeral-gold rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Replied contact forms"
                role="img"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-800 truncate">Replied</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats?.["replied"] || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-funeral-gold rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Archived contact forms"
                role="img"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-teal-800 truncate">Archived</p>
              <p className="text-2xl font-semibold text-neutral-900">{stats?.["archived"] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Forms Table */}
      <div className="bg-funeral-gold rounded-lg shadow-soft">
        <ContactFormsTable
          contactForms={contactForms || []}
          currentPage={Number.parseInt(page, 10)}
          totalPages={totalPages}
          currentStatus={status}
          currentSearch={search}
          locale={locale}
        />
      </div>
    </div>
  );
}
