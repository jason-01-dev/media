import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        <li>
          <Link href="/" className="breadcrumb-link">Accueil</Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index === items.length - 1 ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <Link href={item.href} className="breadcrumb-link">{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
