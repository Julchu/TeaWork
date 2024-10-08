import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/public">Return Home</Link>
    </div>
  );
}