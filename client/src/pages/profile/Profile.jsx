import { useAuth } from '../../context/AuthContext.jsx';

const Profile = () => {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-[32px] border border-border bg-surface p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-primary">Your profile</h1>
        <p className="mt-3 text-sm leading-7 text-muted">Manage your rental preferences, saved listings, and account information.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold text-primary">Account details</h2>
            <div className="mt-5 space-y-4 text-sm text-muted">
              <div>
                <p className="font-semibold text-text">Name</p>
                <p>{user?.name || 'Tenant'}</p>
              </div>
              <div>
                <p className="font-semibold text-text">Email</p>
                <p>{user?.email || 'Not available'}</p>
              </div>
              <div>
                <p className="font-semibold text-text">Phone</p>
                <p>{user?.phone || 'Not available'}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold text-primary">Saved searches</h2>
            <p className="mt-4 text-sm leading-7 text-muted">Keep your preferred city, budget, and home type ready for quick results.</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="rounded-3xl border border-border bg-surface px-4 py-3">Mumbai · ₹15,000-25,000 · Fully furnished</li>
              <li className="rounded-3xl border border-border bg-surface px-4 py-3">Bangalore · ₹25,000-35,000 · 2 BHK</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
