import { Link } from 'react-router-dom';

export function SectionHeading({
  label,
  title,
  link,
  to,
}: {
  label?: string;
  title: string;
  link?: string;
  to?: string;
}) {
  return (
    <div className="section-heading" data-reveal>
      <div>
        {label && <span className="section-label">{label}</span>}
        <h2>{title}</h2>
      </div>
      {link && to && (
        <Link className="text-link" to={to}>
          {link}
        </Link>
      )}
    </div>
  );
}
