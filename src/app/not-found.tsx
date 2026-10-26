import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-ivory">
      <div className="w-20 h-20 rounded-full bg-rose-light/50 flex items-center justify-center mb-6">
        <span className="font-accent text-dusty-rose text-3xl">404</span>
      </div>
      <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-2">
        We couldn&apos;t find that creation.
      </h1>
      <p className="text-taupe max-w-md mb-8">
        The page you are looking for might have been moved, renamed, or doesn&apos;t exist.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
        <Link href="/shop" className="btn-secondary">
          Explore Shop
        </Link>
      </div>
    </div>
  );
}
