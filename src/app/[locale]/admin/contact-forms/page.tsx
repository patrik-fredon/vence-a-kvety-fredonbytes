import { redirect } from "next/navigation";
import { ContactFormsTable } from "@/components/admin/ContactFormsTable";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";

interface ContactFormsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

export default async function ContactFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page = "1", status = "all", search = "" } = await searchParams;

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("contact_forms")
    .select("*", { count: "exact" });

  // Apply filters
  if (status !== "all") {
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
          acc[form.status] = (acc[form.status] || 0) + 1;
          return acc;
        },
        { new: 0, in_progress: 0, resolved: 0, closed: 0 }
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
              <div className="p-3 rounded-full bg-teal-100 text-teal-900 mr-4">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-label="In progress contact forms"
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
                <p className="text-sm font-medium text-gray-500 truncate">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.in_progress || 0}</p>
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
                  aria-label="Resolved contact forms"
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
                <p className="text-sm font-medium text-gray-500 truncate">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.resolved || 0}</p>
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
                  aria-label="Closed contact forms"
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
                <p className="text-sm font-medium text-gray-500 truncate">Closed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.closed || 0}</p>
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
        />
      </div>
    </div>
  );
}</p>
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
