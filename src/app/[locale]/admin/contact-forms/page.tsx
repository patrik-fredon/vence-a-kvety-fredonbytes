import { ContactFormsTable } from "@/components/admin/ContactFormsTable";
import { createServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<{
  page?: string | string[];
  status?: string | string[];
  search?: string | string[];
}>;

interface ContactFormsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}

export default async function ContactFormsPage({
  params,
  searchParams,
}: ContactFormsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Ensure we have string values, not arrays
  const page = Array.isArray(resolvedSearchParams.page) 
    ? resolvedSearchParams.page[0] || "1" 
    : resolvedSearchParams.page || "1";
  const status = Array.isArray(resolvedSearchParams.status) 
    ? resolvedSearchParams.status[0] || "all" 
    : resolvedSearchParams.status || "all";
  const search = Array.isArray(resolvedSearchParams.search) 
    ? resolvedSearchParams.search[0] || "" 
    : resolvedSearchParams.search || "";

  const supabase = await createServerClient();

  // Build query
  let query = supabase
    .from("contact_forms")
    .select("*", { count: "exact" });

  // Apply filters
  if (status !== "all" && (status === "new" || status === "read" || status === "replied" || status === "archived")) {
    query = query.eq("status", status);
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
          const status = form.status as "new" | "read" | "replied" | "archived";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { new: 0, read: 0, replied: 0, archived: 0 } as Record<"new" | "read" | "replied" | "archived", number>
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
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
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
                <p className="text-sm font-medium text-gray-500 truncate">New</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.new || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">Read</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.read || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">Replied</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.replied || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">Archived</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.archived || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Forms Table */}
      <div className="bg-white shadow rounded-lg">
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
