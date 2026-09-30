export default function DashboardLoading() {
  return (
    <div className="w-full h-full p-4 lg:p-8 max-w-7xl mx-auto space-y-6 flex flex-col animate-pulse">
      <div className="hidden lg:block mb-2 space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="lg:hidden mb-2">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Widget Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
        <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
        <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="h-64 bg-gray-200 rounded-2xl w-full mt-6"></div>
      <div className="h-48 bg-gray-200 rounded-2xl w-full mt-4"></div>
    </div>
  );
}
