import { redirect } from 'next/navigation'

// Public beta entry: land on the demo loader so first-time visitors see a
// populated portfolio instead of an empty app. Local/dev can still reach
// /dashboard directly.
export default function Page() {
  redirect('/demo')
}
