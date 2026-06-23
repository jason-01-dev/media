import { getArticleBySlug, getArticles } from "@/lib/strapi";
import { strapiImageUrlPrefer } from "@/lib/image";
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
  
  return articles.map((article: any) => ({
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

  const imageUrl = article.cover
    ? strapiImageUrlPrefer(article.cover, ['large', 'medium', 'small', 'thumbnail'])
    : null;

  return {
    title: article.title,
    description: article.description || "",
    keywords: article.category?.name ? [article.category.name] : [],
    authors: article.author ? [{ name: article.author.name }] : [],
    openGraph: {
      title: article.title,
      description: article.description || "",
      type: "article",
      publishedTime: article.publishedAt,
      url: `/articles/${article.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1920, height: 1008 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description || "",
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

  const articleCoverUrl = article.cover
    ? strapiImageUrlPrefer(article.cover, ['large', 'medium', 'small', 'thumbnail'])
    : null;
  const authorAvatarUrl = article.author?.avatar
    ? strapiImageUrlPrefer(article.author.avatar, ['thumbnail', 'small'])
    : null;

  const allArticles = await getArticles({ pagination: { page: 1, pageSize: 20 } });
  
  // Articles de la même catégorie (Connexes)
  const relatedArticles = (allArticles?.data || [])
    .filter((a: any) => a.id !== article.id && a.category?.id === article.category?.id)
    .slice(0, 3);
  
  // Autres thématiques pour la fin de page (Exclut l'article courant et les connexes)
  const moreArticles = (allArticles?.data || [])
    .filter((a: any) => a.id !== article.id && !relatedArticles.some((r: any) => r.id === a.id))
    .slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const articleUrl = `${siteUrl}/articles/${article.slug}`;

  const wordCount = article.description ? article.description.split(' ').length : 0;
  const readingTime = Math.ceil(wordCount / 200) || 1;

  return (
    <div className="article-page-wrapper">
      {/* Zone Fil d'ariane clean */}
      <div className="breadcrumb-section">
        <div className="content-container">
          <Breadcrumbs 
            items={[
              { label: 'Articles', href: '/articles' },
              { label: article.category?.name || 'Catégorie', href: article.category?.slug ? `/articles?category=${article.category.slug}` : '/articles' },
              { label: article.title, href: '' }
            ]}
          />
        </div>
      </div>

      <main className="content-container main-layout">
        <div className="primary-content">
          
          {/* Titre & Méta en tête (Style Journal Épuré) */}
          <header className="article-main-header">
            {article.category && (
              <span className="category-tag-badge">
                {article.category.name}
              </span>
            )}
            <h1 className="main-article-title">{article.title}</h1>
            
            <div className="author-meta-bar">
              <div className="author-identity">
                {authorAvatarUrl && (
                  <Image
                    src={authorAvatarUrl}
                    alt={article.author?.name || 'Auteur'}
                    width={44}
                    height={44}
                    className="author-round-avatar"
                  />
                )}
                <div className="author-details">
                  <span className="author-name">{article.author?.name || "Auteur inconnu"}</span>
                  <span className="publish-date">
                    Publié le {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} à {new Date(article.publishedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }).split(' ').pop()}
                  </span>
                </div>
              </div>

              <div className="meta-utilities">
                <span className="time-badge">⏱️ {readingTime} min de lecture</span>
                <div className="share-buttons-group">
                  <a className="share-link fb" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebookF /></a>
                  <a className="share-link x" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" title="X"><FaTwitter /></a>
                  <a className="share-link wa" href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + articleUrl)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"><FaWhatsapp /></a>
                  <a className="share-link ln" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
                </div>
              </div>
            </div>
          </header>

          {/* Image Principale (Bannière Cinématique) */}
          {articleCoverUrl && (
            <section className="main-hero-showcase">
              <Image
                src={articleCoverUrl}
                alt={article.cover?.alternativeText || article.title}
                fill
                className="hero-cover-img"
                priority
              />
            </section>
          )}

          {/* Corps de l'article */}
          <article className="typography-body">
            {article.description && (
              <p className="article-lead-paragraph">
                {article.description}
              </p>
            )}
            
            {article.body && (
              <div className="markdown-compiled-content" dangerouslySetInnerHTML={{ __html: marked.parse(article.body) }} />
            )}
            
            {article.blocks && article.blocks.length > 0 && (
              <div className="additional-content-blocks">
                {article.blocks.map((block: any, index: number) => {
                  const key = block.id ?? `${block.__component}-${index}`;
                  if (block.__component === "shared.rich-text" && block.body) {
                    return <div key={key} className="rich-text-block" dangerouslySetInnerHTML={{ __html: block.body }} />;
                  }
                  if (block.__component === "shared.quote") {
                    return (
                      <blockquote key={key} className="styled-editorial-quote">
                        <p>« {block.quote} »</p>
                        {block.title && <cite>— {block.title}</cite>}
                      </blockquote>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </article>

          {/* Section Recommandations : Articles Connexes (Même catégorie) */}
          {relatedArticles.length > 0 && (
            <section className="editorial-suggestions-section">
              <div className="section-title-wrapper">
                <h3 className="section-title">Dans la même catégorie</h3>
              </div>
              <div className="suggestions-cards-grid">
                {relatedArticles.map((relArticle: any) => {
                  const relCoverUrl = relArticle.cover ? strapiImageUrlPrefer(relArticle.cover, ['medium', 'small']) : null;
                  return (
                    <Link key={relArticle.id} href={`/articles/${relArticle.slug}`} className="suggestion-item-card">
                      <div className="card-media-wrapper">
                        {relCoverUrl && <Image src={relCoverUrl} alt={relArticle.title} fill className="card-img" />}
                      </div>
                      <div className="card-info-content">
                        <h4>{relArticle.title}</h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section Recommandations : Découvrir plus (Autres catégories) */}
          {moreArticles.length > 0 && (
            <section className="editorial-suggestions-section variant-line">
              <div className="section-title-wrapper">
                <h3 className="section-title">À découvrir aussi</h3>
              </div>
              <div className="suggestions-cards-grid">
                {moreArticles.map((other: any) => {
                  const otherCoverUrl = other.cover ? strapiImageUrlPrefer(other.cover, ['medium', 'small']) : null;
                  return (
                    <Link key={other.id} href={`/articles/${other.slug}`} className="suggestion-item-card">
                      <div className="card-media-wrapper">
                        {otherCoverUrl && <Image src={otherCoverUrl} alt={other.title} fill className="card-img" />}
                      </div>
                      <div className="card-info-content">
                        <h4>{other.title}</h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Colonne de Droite (Sidebar Éditoriale Fixe / Sticky) */}
        <aside className="secondary-sidebar">
          <div className="sticky-sidebar-container">
            <RelatedArticlesSidebar articles={allArticles?.data?.slice(0, 5) || []} currentArticleId={article.id} limit={4} />
          </div>
        </aside>
      </main>
    </div>
  );
}