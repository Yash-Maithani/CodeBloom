// Centers content at the page width with the page margins from DESIGN.md
// section 4: 16px below 768px, 24px up to 1024px, 40px from 1024px.

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-page px-4 md:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
