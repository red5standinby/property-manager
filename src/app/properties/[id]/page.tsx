import { seedData } from '@/src/lib/seed'
import PropertyDetailClient from './client'

export function generateStaticParams() {
  return seedData.properties.map(p => ({ id: p.id }))
}

export default function PropertyDetailPage() {
  return <PropertyDetailClient />
}
