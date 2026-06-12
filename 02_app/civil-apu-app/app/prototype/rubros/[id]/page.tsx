import PrototypeRubroDetailPage from '@/src/components/prototype/PrototypeRubroDetailPage'

export default async function PrototypeRubroDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <PrototypeRubroDetailPage id={id} />
}
