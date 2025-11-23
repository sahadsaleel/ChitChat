import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside
      className="h-full w-20 lg:w-72 border-r border-[#e0e7ed] 
    flex flex-col transition-all duration-200 bg-[#f8fafb]"
    >
      {/* Header */}
      <div className="border-b border-[#e0e7ed] w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-[#2c5f7f]" />
          <span className="font-medium hidden lg:block text-[#1e3a52]">Contacts</span>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="size-12 rounded-full bg-gradient-to-r from-[#d4e4ed] to-[#e8f0f5] animate-pulse" />
            </div>
            {/* User info skeleton - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="h-4 w-32 mb-2 bg-gradient-to-r from-[#d4e4ed] to-[#e8f0f5] rounded animate-pulse" />
              <div className="h-3 w-16 bg-gradient-to-r from-[#d4e4ed] to-[#e8f0f5] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;