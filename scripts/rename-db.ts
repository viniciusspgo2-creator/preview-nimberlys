// Task 6 — one-off: rename "Day Care" → "Daycare" inside existing DB rows
// (Post, Faq, Setting). Case-sensitive brand replace, keeps everything else.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const swap = (s: string) =>
  s ? s.replace(/Day Care/g, "Daycare").replace(/DAY CARE/g, "DAYCARE") : s;

async function main() {
  let posts = 0;
  for (const p of await db.post.findMany()) {
    const patch = {
      title: swap(p.title),
      excerpt: swap(p.excerpt),
      content: swap(p.content),
      metaTitle: swap(p.metaTitle),
      metaDescription: swap(p.metaDescription),
    };
    if (
      patch.title !== p.title ||
      patch.excerpt !== p.excerpt ||
      patch.content !== p.content ||
      patch.metaTitle !== p.metaTitle ||
      patch.metaDescription !== p.metaDescription
    ) {
      await db.post.update({ where: { id: p.id }, data: patch });
      posts++;
    }
  }

  let faqs = 0;
  for (const f of await db.faq.findMany()) {
    const q = swap(f.question);
    const a = swap(f.answer);
    if (q !== f.question || a !== f.answer) {
      await db.faq.update({ where: { id: f.id }, data: { question: q, answer: a } });
      faqs++;
    }
  }

  let settings = 0;
  for (const s of await db.setting.findMany()) {
    const v = swap(s.value);
    if (v !== s.value) {
      await db.setting.update({ where: { key: s.key }, data: { value: v } });
      settings++;
    }
  }

  console.log(`updated: posts=${posts} faqs=${faqs} settings=${settings}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
