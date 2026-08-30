import AdminLayout from "@/components/admin/AdminLayout"

export default function Loading() {
  return (
    <AdminLayout activeMenu="">
      <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-full animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
          <div className="h-24 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-xl mt-6"></div>
        <div className="h-64 bg-slate-200 rounded-xl mt-6"></div>
      </div>
    </AdminLayout>
  )
}