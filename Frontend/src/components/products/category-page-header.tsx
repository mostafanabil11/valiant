export function CategoryPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string | null;
}) {
  return (
    <section className="border-b border-border bg-background py-8 text-center md:py-10">
      {/* headline-sm on phones, not headline-md: the wordmark in the header is
          26px, and a 32px category title made "Men" louder than the brand it
          sits under. Desktop already had the hierarchy right — 60px wordmark
          against a 40px title — so only the narrow case changes. */}
      <h1 className="font-heading text-headline-sm font-bold tracking-[0.02em] text-foreground md:text-display-lg-mobile">
        {title}
      </h1>
      <div className="mx-auto mt-4 h-px w-12 bg-foreground" />
      {description && (
        <p className="mx-auto mt-6 max-w-md px-margin-mobile text-body-md text-muted-foreground">
          {description}
        </p>
      )}
    </section>
  );
}
