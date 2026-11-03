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
    <div className={`mx-auto w-full max-w-page px-4 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
