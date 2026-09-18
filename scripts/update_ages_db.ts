/**
 * Task 3 (correção 2): o cliente pediu o texto em INGLÊS — "Infants / Toddlers".
 * Segunda passada no banco local do preview: troca o texto em português
 * inserido na passada anterior pelos equivalentes em inglês.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const NEW_AGES = "Infants / Toddlers";
const META_OLD = "for bebês / crianças pequenas (babies and young children)";
const META_NEW = "for infants and toddlers";
const PROMPT_OLD =
  "- Ages: we welcome bebês / crianças pequenas (babies and young children) — do not state specific age ranges; if asked for exact ages, invite the family to call (925) 848-8272.";
const PROMPT_NEW =
  "- Ages: we welcome infants and toddlers — do not state specific age ranges; if asked for exact ages, invite the family to call (925) 848-8272.";
const FAQ_OLD = "We welcome bebês / crianças pequenas (babies and young children).";
const FAQ_NEW = "We welcome infants and toddlers.";
const POST_OLD = "welcomes bebês / crianças pequenas in a warm, mixed-age setting";
const POST_NEW = "welcomes infants and toddlers in a warm, mixed-age setting";

const swap = (s: string, oldStr: string, newStr: string) =>
  s.includes(oldStr) ? s.split(oldStr).join(newStr) : null;

async function main() {
  for (const s of await db.setting.findMany({
    where: { key: { in: ["ages", "meta_description", "chat_system_prompt"] } },
  })) {
    let v: string | null;
    if (s.key === "ages") v = s.value === NEW_AGES ? null : NEW_AGES;
    else if (s.key === "meta_description") v = swap(s.value, META_OLD, META_NEW);
    else v = swap(s.value, PROMPT_OLD, PROMPT_NEW);
    if (v !== null) {
      await db.setting.update({ where: { key: s.key }, data: { value: v } });
      console.log(`setting "${s.key}" atualizado`);
    } else {
      console.log(`setting "${s.key}" já ok`);
    }
  }

  for (const f of await db.faq.findMany({
    where: { answer: { contains: "crianças pequenas" } },
  })) {
    const v = swap(f.answer, FAQ_OLD, FAQ_NEW);
    if (v) {
      await db.faq.update({ where: { id: f.id }, data: { answer: v } });
      console.log(`faq #${f.id} atualizada`);
    }
  }

  for (const p of await db.post.findMany({
    where: { content: { contains: "crianças pequenas" } },
  })) {
    const v = swap(p.content, POST_OLD, POST_NEW);
    if (v) {
      await db.post.update({ where: { id: p.id }, data: { content: v } });
      console.log(`post "${p.slug}" atualizado`);
    }
  }

  console.log("done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
