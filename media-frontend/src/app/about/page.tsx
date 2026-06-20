import { getAbout } from "@/lib/strapi";

export const metadata = {
  title: "About Us",
  description: "Learn more about us",
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
        <div className="prose dark:prose-invert max-w-none space-y-6">
          {about.blocks.map((block: any, index: number) => {
            const key = block.id ?? `${block.__component}-${index}`;
            if (block.__component === "shared.rich-text") {
              return (
                <div
                  key={key}
                  className="text-zinc-700 dark:text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: block.body }}
                />
              );
            }
            if (block.__component === "shared.quote") {
              return (
                <blockquote
                  key={key}
                  className="border-l-4 border-black dark:border-white pl-6 py-4 italic text-lg text-zinc-700 dark:text-zinc-300"
                >
                  <p>{block.body}</p>
                  <p className="mt-2 font-medium text-zinc-900 dark:text-white">
                    — {block.title}
                  </p>
                </blockquote>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          No content available yet.
        </p>
      )}
    </div>
  );
}
