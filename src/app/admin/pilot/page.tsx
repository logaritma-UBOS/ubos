import { getPilotDashboardData } from "@/actions/adminPilot"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminPilotPage() {
  try {
    const data = await getPilotDashboardData()
    const { metrics, funnel, recentEvents, recentErrors, recentFeedbacks } = data

    return (
      <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Internal Pilot Operations</h1>
        
        {/* Core Metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><p className="text-sm text-gray-500">Active Tenants</p><p className="text-2xl font-bold">{metrics.activeTenants}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-gray-500">Transactions</p><p className="text-2xl font-bold">{metrics.transactions}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-gray-500">Errors</p><p className="text-2xl font-bold text-red-600">{metrics.errors}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-gray-500">Feedback</p><p className="text-2xl font-bold text-amber-600">{metrics.feedback}</p></CardContent></Card>
        </section>

        {/* Funnel */}
        <section>
          <h2 className="text-lg font-bold mb-3">Onboarding & Usage Funnel</h2>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-center"><span className="text-sm">Dashboard Viewed</span><span className="font-bold">{funnel.dashboardViewed}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">Product Created</span><span className="font-bold">{funnel.productCreated}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">HPP Created</span><span className="font-bold">{funnel.hppCreated}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">POS Transaction</span><span className="font-bold">{funnel.posTransaction}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">Business Insight Viewed</span><span className="font-bold">{funnel.insightViewed}</span></div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feedbacks */}
          <section>
            <h2 className="text-lg font-bold mb-3">Recent Feedback</h2>
            <div className="space-y-3">
              {recentFeedbacks.length === 0 ? <p className="text-sm text-gray-500">No feedback yet.</p> : null}
              {recentFeedbacks.map(f => (
                <Card key={f.id}>
                  <CardContent className="pt-4 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <Badge variant={f.category === "Bug" ? "danger" : "info"}>{f.category}</Badge>
                      <span className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold">{f.business.name}</p>
                    <p className="text-sm text-gray-700">{f.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Errors */}
          <section>
            <h2 className="text-lg font-bold mb-3">Recent Errors</h2>
            <div className="space-y-3">
              {recentErrors.length === 0 ? <p className="text-sm text-gray-500">No errors recorded.</p> : null}
              {recentErrors.map(e => (
                <Card key={e.id}>
                  <CardContent className="pt-4 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <Badge variant="danger">{e.errorType}</Badge>
                      <span className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold">{e.business?.name || "Unknown Tenant"}</p>
                    <p className="text-sm text-gray-700 font-mono text-xs">{e.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Hanya tim internal yang memiliki akses ke halaman operasional.</p>
          <Link href="/" className="text-emerald-600 underline">Kembali ke Beranda</Link>
        </div>
      )
    }
    throw error
  }
}
