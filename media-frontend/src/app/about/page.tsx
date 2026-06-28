import { getAbout } from "@/lib/strapi";

export const metadata = {
  title: "À propos",
  description: "Découvrez Actu 24, notre mission et notre engagement pour une information rigoureuse et indépendante.",
};

export default async function AboutPage() {
  let about = null;
  try {
    const aboutData = await getAbout();
    about = aboutData?.data;
  } catch (err) {
    
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
        {about?.title || "About Us"}
      </h1>

      {about?.blocks && about.blocks.length > 0 ? (
        <div className="prose prose-slate max-w-[68ch] text-[15px]">
          {about.blocks.map((block: any, index: number) => {
            const key = block.id ?? `${block.__component}-${index}`;
            if (block.__component === "shared.rich-text") {
              return (
                <div key={key} dangerouslySetInnerHTML={{ __html: block.body }} />
              );
            }
            if (block.__component === "shared.quote") {
              return (
                <blockquote key={key} className="border-l-[5px] border-slate-900 pl-6 text-xl leading-tight not-italic">
                  {block.body || block.quote}
                  {block.title && <cite className="block mt-3 text-base font-medium not-italic text-slate-600">— {block.title}</cite>}
                </blockquote>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div className="max-w-prose text-lg text-slate-600">
          Actu 24 est une plateforme indépendante dédiée à l’information de qualité et à la vérification des faits. 
          Notre mission : décrypter l’actualité avec rigueur et transparence.
        </div>
      )}
    </div>
  );
}
