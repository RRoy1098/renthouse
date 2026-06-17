import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="rounded-[32px] border border-border bg-surface p-12 text-center shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Page not found</p>
      <h1 className="mt-6 text-4xl font-semibold text-primary">404 — Oops!</h1>
      <p className="mt-4 max-w-xl mx-auto text-sm leading-7 text-muted">The page you’re looking for does not exist or has moved. Head back to the homepage to continue browsing.</p>
      <Link to="/" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
        Go back home
      </Link>
    </section>
  );
};

export default NotFound;
