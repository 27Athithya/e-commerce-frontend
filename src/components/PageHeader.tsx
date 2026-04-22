type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-12 sm:px-6 lg:px-10 lg:pb-14 lg:pt-20">
      <div className="flex items-center gap-3">
        <div className="h-px w-10 bg-gold" />
        <span className="text-[11px] uppercase tracking-[0.3em] text-gold">{eyebrow}</span>
      </div>
      <h1 className="mt-5 max-w-4xl font-serif text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.95] tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
