import { seedData } from '@/src/lib/seed'
import PropertyDetailClient from './client'

export function generateStaticParams() {
  // If no seed data exists, export at least one placeholder param so the
  // dynamic route builds. The client component will show a "not found"
  // state for properties that don't exist.
  const props = seedData.properties
  if (props.length === 0) {
    return [{ id: '__placeholder' }]
  }
  return props.map(p => ({ id: p.id }))
}

export default function PropertyDetailPage() {
  return <PropertyDetailClient />
}
