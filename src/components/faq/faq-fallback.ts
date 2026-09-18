/**
 * Hardcoded fallback FAQs — copied from prisma/seed.ts so the FAQ page
 * still renders if the database or /api/faq is unavailable.
 */
export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
};

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 1,
    question: "What ages of children do you accept?",
    answer:
      "We welcome infants and toddlers. Our small, family-style setting lets us care for infants, toddlers, preschoolers, and school-age children in a warm, mixed-age environment where everyone feels at home.",
    category: "Enrollment",
    order: 1,
  },
  {
    id: 2,
    question: "What are your hours of operation?",
    answer:
      "We are open Monday through Friday, from 7:00 AM to 5:30 PM. We're closed on weekends and major holidays. If you need care during specific hours, give us a call and we'll be happy to confirm availability.",
    category: "General",
    order: 2,
  },
  {
    id: 3,
    question: "Where is Nimberly's Daycare located?",
    answer:
      "We're located on Island View Drive in Bay Point, California 94565 — a quiet, family-friendly neighborhood in Contra Costa County. Families visit us from Bay Point, Pittsburg, and surrounding communities.",
    category: "General",
    order: 3,
  },
  {
    id: 4,
    question: "Do you accept child care subsidy programs?",
    answer:
      "Yes! We accept child care subsidy programs from Contra Costa County and the State of California, including CalWORKs Child Care, CAPP, CCTR, CSPP, CocoKids, and CDSS programs. Eligibility is determined by each program, so contact us and we'll gladly help you understand your options.",
    category: "Subsidy",
    order: 4,
  },
  {
    id: 5,
    question: "How do I schedule a visit?",
    answer:
      "It's simple — call us at (925) 848-8272, email nimberlysdaycare0528@gmail.com, or fill out the contact form on our website. We love meeting families in person, and a visit is the best way to see if we're the right fit for your child.",
    category: "Enrollment",
    order: 5,
  },
  {
    id: 6,
    question: "Can I visit before enrolling my child?",
    answer:
      "Absolutely. We encourage every family to visit, meet us, and see the environment where their child will learn and play. Tours give you the chance to ask questions and for your little one to explore a brand-new place with you nearby.",
    category: "Enrollment",
    order: 6,
  },
  {
    id: 7,
    question: "What should we bring on the first day?",
    answer:
      "Before your child's first day, we'll walk you through everything you'll need — from comfort items to extra clothing. We make sure every family knows exactly what to expect, so the first day feels exciting instead of overwhelming.",
    category: "Enrollment",
    order: 7,
  },
  {
    id: 8,
    question: "What does a typical day look like?",
    answer:
      "Our days follow a balanced, predictable rhythm: free play, learning activities, story time, outdoor play, rest, and plenty of care in between. A consistent routine helps children feel safe — and when kids feel safe, they thrive.",
    category: "Programs",
    order: 8,
  },
  {
    id: 9,
    question: "How do you keep children safe?",
    answer:
      "Safety comes first in everything we do: a secure home environment, age-appropriate spaces, constant supervision, and open communication with parents. We treat every child the way we'd want our own to be treated.",
    category: "Safety",
    order: 9,
  },
  {
    id: 10,
    question: "How will I know how my child is doing?",
    answer:
      "Communication matters to us. We talk with parents at drop-off and pick-up, and we're always available by phone or email. You'll never have to wonder how your child's day went — we love sharing the little moments.",
    category: "General",
    order: 10,
  },
];
