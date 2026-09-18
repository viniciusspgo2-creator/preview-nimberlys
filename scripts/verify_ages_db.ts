/** Verificação: procura qualquer resquício de faixa etária antiga/texto PT no DB. */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const BAD = [
  "bebê",
  "bebés",
  "crianças pequenas",
  "4 months to 12",
  "4 – 18",
  "18 months",
  "3 – 5",
  "5 – 12",
  "4 – 12",
  "babies and young children",
];

function hits(v: string | null | undefined): string[] {
  if (!v) return [];
  const low = v.toLowerCase();
  return BAD.filter((b) => low.includes(b.toLowerCase()));
}

async function main() {
  for (const s of await db.setting.findMany({
    where: { key: { in: ["ages", "meta_description", "chat_system_prompt", "meta_title", "og_title"] } },
  })) {
    const h = hits(s.value);
    console.log(`[setting] ${s.key} = ${JSON.stringify((s.value ?? "").slice(0, 140))}${h.length ? "  << PROBLEMA: " + h.join(",") : "  ✅"}`);
  }

  const faqs = await db.faq.findMany();
  for (const f of faqs) {
    const h = [...hits(f.question), ...hits(f.answer)];
    if (h.length) console.log(`[faq] #${f.id} << PROBLEMA: ${h.join(",")} :: ${f.answer.slice(0, 120)}`);
  }
  console.log(`[faq] varridas ${faqs.length} (silêncio = ok)`);

  const posts = await db.post.findMany({ select: { slug: true, content: true } });
  let bad = 0;
  for (const p of posts) {
    const h = hits(p.content);
    if (h.length) {
      bad++;
      console.log(`[post] ${p.slug} << PROBLEMA: ${h.join(",")}`);
    }
  }
  console.log(`[post] varridos ${posts.length}, com problema: ${bad}`);

  const ages = await db.setting.findUnique({ where: { key: "ages" } });
  console.log(`\nAGES final no DB: ${JSON.stringify(ages?.value)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
