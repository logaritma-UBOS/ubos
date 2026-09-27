export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function MethodologyPage() {
  const session = await auth();
  
  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session?.user?.email || "" }
  });

  if (!teamMember) redirect("/login");
  if (teamMember.role !== "METHODOLOGY" && teamMember.role !== "SUPER_ADMIN") redirect("/admin/pilot");

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Methodology (Tony)</h2>
        <p className="text-gray-500">Ruang kerja dan observasi metodologi.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Checklist Harian (Coming Soon)</h3>
        <p className="text-sm text-gray-600">Modul form checklist harian akan diintegrasikan di iterasi berikutnya.</p>
      </div>
    </div>
  );
}
