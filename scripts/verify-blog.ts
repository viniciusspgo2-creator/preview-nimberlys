import { seedPosts } from "/home/z/my-project/src/data/seed/blog-posts.ts";

const cats = new Set(["Choosing Child Care", "Parenting Tips", "Child Development", "Nutrition & Health", "Subsidies & Programs"]);
const issues: string[] = [];
const coverUse: Record<string, number> = {};

const words = (s: string) => s.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

seedPosts.forEach((p) => {
  const w = words(p.content);
  if (w < 700 || w > 1100) issues.push(`${p.slug}: content words=${w}`);
  if (p.excerpt.length < 150 || p.excerpt.length > 165) issues.push(`${p.slug}: excerpt len=${p.excerpt.length}`);
  if (p.metaTitle.length > 60) issues.push(`${p.slug}: metaTitle len=${p.metaTitle.length}`);
  if (p.metaDescription.length > 160) issues.push(`${p.slug}: metaDescription len=${p.metaDescription.length}`);
  if (!cats.has(p.category)) issues.push(`${p.slug}: bad category "${p.category}"`);
  if (p.tags.length < 3 || p.tags.length > 5) issues.push(`${p.slug}: tags=${p.tags.length}`);
  if (p.readingMinutes < 4 || p.readingMinutes > 8) issues.push(`${p.slug}: readingMinutes=${p.readingMinutes}`);
  if (!p.cover.startsWith("/images/gallery/")) issues.push(`${p.slug}: cover bad path`);
  coverUse[p.cover] = (coverUse[p.cover] || 0) + 1;
  if (p.faq.length < 2 || p.faq.length > 4) issues.push(`${p.slug}: faq count=${p.faq.length}`);
  p.faq.forEach((f) => {
    const fw = f.answer.split(/\s+/).filter(Boolean).length;
    if (fw < 40 || fw > 80) issues.push(`${p.slug}: FAQ answer words=${fw} (${f.question.slice(0, 40)})`);
  });
  if (/<h1/i.test(p.content)) issues.push(`${p.slug}: contains h1`);
  if (/(style=|class=)/i.test(p.content)) issues.push(`${p.slug}: inline style/class`);
  if (p.content.includes("`") || p.content.includes("${")) issues.push(`${p.slug}: backtick or template seq in content`);
  if (!/<h2>/.test(p.content)) issues.push(`${p.slug}: no h2`);
  const h2count = (p.content.match(/<h2>/g) || []).length;
  if (h2count < 4 || h2count > 7) issues.push(`${p.slug}: h2 count=${h2count}`);
  const banned = ["delve", "tapestry", "landscape", "In conclusion", "fast-paced world"];
  banned.forEach((b) => { if (new RegExp(b, "i").test(p.content)) issues.push(`${p.slug}: banned phrase "${b}"`); });
});

const featured = seedPosts.filter((p) => p.featured).length;
if (featured !== 3) issues.push(`featured count=${featured}`);
Object.entries(coverUse).forEach(([k, v]) => { if (v > 2) issues.push(`cover overused: ${k} x${v}`); });

console.log("posts:", seedPosts.length);
console.log("featured:", featured);
seedPosts.forEach((p) => console.log(`  - ${p.slug} | words=${words(p.content)} | faq=${p.faq.length} | cat=${p.category}`));
console.log(issues.length ? "ISSUES:\n" + issues.join("\n") : "ALL CHECKS PASS");
