import { PrismaClient } from "@prisma/client";
import { seedPosts } from "../src/data/seed/blog-posts";

const db = new PrismaClient();

const defaultSettings: Record<string, string> = {
  site_name: "Nimberly's Daycare, Inc.",
  site_display_name: "Nimberly's Daycare",
  tagline: "Where Little Hearts Learn, Play & Grow",
  phone: "(925) 848-8272",
  email: "nimberlysdaycare0528@gmail.com",
  address_street: "Island View Drive",
  address_city: "Bay Point, CA 94565",
  hours: "Monday – Friday, 7:00 AM – 5:30 PM",
  ages: "4 months – 12 years",
  meta_title: "Nimberly's Daycare | Trusted Daycare & Child Care in Bay Point, CA",
  meta_description:
    "Warm, family-style daycare in Bay Point, CA for children 4 months to 12 years. Safe, nurturing care, learning through play, and California child care subsidy programs accepted.",
  og_image: "/images/og-image.jpg",
  ga_measurement_id: "",
  gsc_verification: "",
  gemini_api_key: "",
  gemini_model: "gemini-2.5-flash",
  chat_welcome:
    "Hi there! I'm Sunny, the Nimberly's Daycare assistant. Ask me anything about our daycare — ages, hours, programs, or how to schedule a visit!",
  chat_system_prompt: `You are "Sunny", the friendly virtual assistant for Nimberly's Daycare, a family child care home in Bay Point, California (Contra Costa County).

FACTS (never contradict, never invent beyond these):
- Name: Nimberly's Daycare, Inc.
- Ages: 4 months to 12 years
- Hours: Monday–Friday, 7:00 AM – 5:30 PM (closed weekends)
- Address: Island View Drive, Bay Point, CA 94565
- Phone: (925) 848-8272 | Email: nimberlysdaycare0528@gmail.com
- Accepts Contra Costa County and California child care subsidy programs: CalWORKs Child Care, CAPP, CCTR, CSPP, CocoKids, Contra Costa County Child Care Assistance, and CDSS programs. Eligibility is decided by each program/agency — encourage families to contact the daycare or the agency for details.

STYLE: Warm, cheerful, professional American English. Short paragraphs. 2-4 sentences per reply unless more detail is truly helpful. Use a light touch of emoji warmth (at most one) but never spam. If asked something you don't know (tuition rates, meals, staff numbers, certifications), say you don't have that detail and suggest calling (925) 848-8272 or emailing nimberlysdaycare0528@gmail.com. Always encourage scheduling a visit for questions about enrollment. Do not make up prices, policies, or guarantees.`,
  chat_quick_replies:
    "What ages do you accept?|What are your hours?|Do you accept subsidy programs?|How do I schedule a visit?|Where are you located?",
};

const faqs = [
  {
    question: "What ages of children do you accept?",
    answer:
      "We welcome children from 4 months to 12 years old. Our small, family-style setting lets us care for infants, toddlers, preschoolers, and school-age children in a warm, mixed-age environment where everyone feels at home.",
    category: "Enrollment",
    order: 1,
  },
  {
    question: "What are your hours of operation?",
    answer:
      "We are open Monday through Friday, from 7:00 AM to 5:30 PM. We're closed on weekends and major holidays. If you need care during specific hours, give us a call and we'll be happy to confirm availability.",
    category: "General",
    order: 2,
  },
  {
    question: "Where is Nimberly's Daycare located?",
    answer:
      "We're located on Island View Drive in Bay Point, California 94565 — a quiet, family-friendly neighborhood in Contra Costa County. Families visit us from Bay Point, Pittsburg, and surrounding communities.",
    category: "General",
    order: 3,
  },
  {
    question: "Do you accept child care subsidy programs?",
    answer:
      "Yes! We accept child care subsidy programs from Contra Costa County and the State of California, including CalWORKs Child Care, CAPP, CCTR, CSPP, CocoKids, and CDSS programs. Eligibility is determined by each program, so contact us and we'll gladly help you understand your options.",
    category: "Subsidy",
    order: 4,
  },
  {
    question: "How do I schedule a visit?",
    answer:
      "It's simple — call us at (925) 848-8272, email nimberlysdaycare0528@gmail.com, or fill out the contact form on our website. We love meeting families in person, and a visit is the best way to see if we're the right fit for your child.",
    category: "Enrollment",
    order: 5,
  },
  {
    question: "Can I visit before enrolling my child?",
    answer:
      "Absolutely. We encourage every family to visit, meet us, and see the environment where their child will learn and play. Tours give you the chance to ask questions and for your little one to explore a brand-new place with you nearby.",
    category: "Enrollment",
    order: 6,
  },
  {
    question: "What should we bring on the first day?",
    answer:
      "Before your child's first day, we'll walk you through everything you'll need — from comfort items to extra clothing. We make sure every family knows exactly what to expect, so the first day feels exciting instead of overwhelming.",
    category: "Enrollment",
    order: 7,
  },
  {
    question: "What does a typical day look like?",
    answer:
      "Our days follow a balanced, predictable rhythm: free play, learning activities, story time, outdoor play, rest, and plenty of care in between. A consistent routine helps children feel safe — and when kids feel safe, they thrive.",
    category: "Programs",
    order: 8,
  },
  {
    question: "How do you keep children safe?",
    answer:
      "Safety comes first in everything we do: a secure home environment, age-appropriate spaces, constant supervision, and open communication with parents. We treat every child the way we'd want our own to be treated.",
    category: "Safety",
    order: 9,
  },
  {
    question: "How will I know how my child is doing?",
    answer:
      "Communication matters to us. We talk with parents at drop-off and pick-up, and we're always available by phone or email. You'll never have to wonder how your child's day went — we love sharing the little moments.",
    category: "General",
    order: 10,
  },
];

async function main() {
  // Settings
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // FAQs
  const faqCount = await db.faq.count();
  if (faqCount === 0) {
    for (const f of faqs) await db.faq.create({ data: f });
  }

  // Blog posts
  for (const p of seedPosts) {
    await db.post.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        cover: p.cover,
        category: p.category,
        tags: p.tags.join(", "),
        readingMinutes: p.readingMinutes,
        faq: JSON.stringify(p.faq),
        featured: p.featured,
      },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        cover: p.cover,
        category: p.category,
        tags: p.tags.join(", "),
        readingMinutes: p.readingMinutes,
        faq: JSON.stringify(p.faq),
        featured: p.featured,
      },
    });
  }

  console.log(`Seeded: ${await db.post.count()} posts, ${await db.faq.count()} faqs, ${await db.setting.count()} settings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
