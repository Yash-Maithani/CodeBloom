// Centers content at the site width with the page gutters from DESIGN.md
// section 5: 16px below 640px, 24px up to 1024px, 32px above.

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
