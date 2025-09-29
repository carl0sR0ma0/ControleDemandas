import { DemandDetail } from "@/components/demand-detail"

interface DemandDetailPageProps {
  params: {
    protocol: string
  }
}

export default function DemandDetailPage({ params }: DemandDetailPageProps) {
  return (
    <div className="p-6">
      <DemandDetail protocol={params.protocol} />
    </div>
  )
}
