const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface/80 py-8 text-sm text-muted">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} RentHouse. Designed for effortless rentals and trusted home search.</p>
      </div>
    </footer>
  );
};

export default Footer;
