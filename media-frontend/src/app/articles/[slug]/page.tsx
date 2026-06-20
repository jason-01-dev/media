import { getArticleBySlug, getArticles } from "@/lib/strapi";
import { strapiImageUrl } from "@/lib/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedArticlesSidebar from "@/components/RelatedArticlesSidebar";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaLinkedin } from 'react-icons/fa';
import "@/app/articles/article.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articlesData = await getArticles();
  const articles = articlesData?.data || [];
  
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const articleData = await getArticleBySlug(slug);
  const article = articleData?.data?.[0];

  if (!article) {
    return {
      title: "Article non trouvé",
      description: "L'article que vous recherchez n'existe pas.",
    };
  }

  const imageUrl = article.cover ? strapiImageUrl(article.cover) : null;

  return {
    title: article.title,
    description: article.description,
    keywords: article.category?.name ? [article.category.name] : [],
    authors: article.author ? [{ name: article.author.name }] : [],
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `/articles/${article.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1920, height: 1008 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Readonly<Props>) {
  const { slug } = await params;
  const articleData = await getArticleBySlug(slug);
  const article = articleData?.data?.[0];

  if (!article) {
    notFound();
  }

  const allArticles = await getArticles({ pagination: { page: 1, pageSize: 20 } });
  // Try to get related articles by category, fallback to all articles if none found
  let relatedArticles = (allArticles?.data || [])
    .filter((a: any) => a.id !== article.id && a.category?.id === article.category?.id)
    .slice(0, 4);
  
  // If no related articles, get top articles from backend
  if (relatedArticles.length === 0) {
    relatedArticles = (allArticles?.data || [])
      .filter((a: any) => a.id !== article.id)
      .slice(0, 4);
  }
  const moreArticles = (allArticles?.data || [])
    .filter((a: any) => a.id !== article.id)
    .slice(0, 6);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const articleUrl = `${siteUrl}/articles/${article.slug}`;

  return (
    <div style={{ background: '#fff' }}>
      <main className="article-container">
        {/* Breadcrumb above hero */}
        <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
          <Breadcrumbs 
            items={[
              { label: 'Articles', href: '/articles' },
              { label: article.category?.name || 'Catégorie', href: article.category?.slug ? `/articles?category=${article.category.slug}` : '/articles' },
              { label: article.title, href: '' }
            ]}
          />
        </div>

        {/* Hero Image with Title */}
        {article.cover && (
          <section className="article-hero">
            <Image
              src={strapiImageUrl(article.cover) || ''}
              alt={article.cover?.alternativeText || article.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="article-hero-overlay">
              {article.category && (
                <span className="article-category-badge">
                  {article.category.name}
                </span>
              )}
              <h1 className="article-hero-title">{article.title}</h1>
            </div>
          </section>
        )}

        <div className="article-wrapper">
          {/* Main Content */}
          <div className="article-main">
          <div className="article-header">
            <div className="article-author-info">
              {article.author?.avatar && (
                <Image
                  src={strapiImageUrl(article.author.avatar) || ''}
                  alt={article.author.name || 'Auteur'}
                  width={48}
                  height={48}
                  className="article-author-avatar"
                />
              )}
              <div className="author-text">
                <h4>
                  {article.author?.name || "Auteur inconnu"}
                </h4>
                <p>
                  {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="article-meta">
              <span className="reading-time">
                Lecture: ~{Math.ceil(article.description.split(' ').length / 200)} min
              </span>
              {/* Social Share */}
              <div className="article-social">
                <a
                  className="social-btn"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Partager sur Facebook"
                  title="Facebook"
                >
                  <FaFacebookF className="social-icon" />
                </a>
                <a
                  className="social-btn"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Partager sur X"
                  title="X (Twitter)"
                >
                  <FaTwitter className="social-icon" />
                </a>
                <a
                  className="social-btn"
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Partager sur WhatsApp"
                  title="WhatsApp"
                >
                  <FaWhatsapp className="social-icon" />
                </a>
                <a
                  className="social-btn"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Partager sur LinkedIn"
                  title="LinkedIn"
                >
                  <FaLinkedin className="social-icon" />
                </a>
              </div>
            </div>
          </div>

        {/* Article Content */}
        <article className="article-content">
          {/* Introduction paragraph */}
          <p>{article.description}</p>
          
          {/* Render body field from Strapi (Markdown converted to HTML) */}
          {article.body && (
            <div 
              dangerouslySetInnerHTML={{ __html: marked.parse(article.body) }}
            />
          )}
          
          {/* Render blocks if available */}
          {article.blocks && article.blocks.length > 0 && (
            article.blocks.map((block: any, index: number) => {
              const key = block.id ?? `${block.__component}-${index}`;
              if (block.__component === "shared.rich-text" && block.body) {
                return (
                  <div 
                    key={key}
                    dangerouslySetInnerHTML={{ __html: block.body }}
                  />
                );
              }
              if (block.__component === "shared.quote") {
                return (
                  <blockquote 
                    key={key}
                  >
                    "{block.quote}" — <strong>{block.title || "Source"}</strong>
                  </blockquote>
                );
              }
              return null;
            })
          )}
        </article>

            {/* More Articles */}
            {moreArticles.length > 0 && (
              <section className="articles-section">
                <h3>Voir d'autres articles</h3>
                <div className="articles-grid-3">
                  {moreArticles.map((other: any) => (
                    <Link key={other.id} href={`/articles/${other.slug}`} className="article-card-small">
                      {other.cover && (
                        <Image
                          src={strapiImageUrl(other.cover) || ''}
                          alt={other.cover?.alternativeText || other.title}
                          width={300}
                          height={140}
                        />
                      )}
                      <div className="article-card-small-body">
                        <h4>{other.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="articles-section">
                <h3>Articles connexes</h3>
                <div className="articles-grid-3">
                  {relatedArticles.map((relArticle: any) => (
                    <Link key={relArticle.id} href={`/articles/${relArticle.slug}`} className="article-card-small">
                      {relArticle.cover && (
                        <Image
                          src={strapiImageUrl(relArticle.cover) || ''}
                          alt={relArticle.cover?.alternativeText || relArticle.title}
                          width={300}
                          height={140}
                        />
                      )}
                      <div className="article-card-small-body">
                        <h4>{relArticle.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - À Lire Aussi */}
          <aside className="article-sidebar">
            <RelatedArticlesSidebar articles={relatedArticles} currentArticleId={article.id} limit={4} />
          </aside>
        </div>
      </main>
    </div>
  );
}
