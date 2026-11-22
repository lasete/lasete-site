export function PageIntro({
  label,
  title,
  description,
  ambient = false,
}: {
  ambient?: boolean;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <header
      className="page-intro shell"
      data-matrix={ambient ? 'intro' : undefined}
    >
      <span className="section-label">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
