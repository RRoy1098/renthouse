import houseImages from '../../assets/assets.js';

const Home = () => {
  return (
    <section className="space-y-12">
      <div className="rounded-[32px] border border-border bg-surface/90 p-8 shadow-soft backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-accent-soft px-4 py-1 text-sm font-semibold text-accent">
              Discover easy rentals
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              Find your next home in minutes.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted">
              Browse verified properties, connect with trusted owners, and secure your ideal rental with smart search tools designed for tenants and landlords.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/listings" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
                Browse listings
              </a>
              <a href="/auth" className="inline-flex items-center justify-center rounded-full border border-border bg-transparent px-6 py-3 text-sm font-semibold text-text transition hover:border-primary hover:text-primary">
                Sign in or register
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {houseImages.slice(0, 4).map((src, index) => (
              <div key={index} className="overflow-hidden rounded-3xl bg-surface shadow-soft">
                <img src={src} alt={`Home preview ${index + 1}`} className="h-56 w-full object-cover transition duration-500 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Verified Homes', description: 'Mortgage-quality listings with owner verification and clear pricing.' },
          { title: 'Smart Search', description: 'Filter by location, rent range, amenities and house type.' },
          { title: 'Tenant Support', description: 'Secure booking and direct owner communication from one dashboard.' },
        ].map((item) => (
          <article key={item.title} className="rounded-[28px] border border-border bg-surface p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-primary">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Home;
