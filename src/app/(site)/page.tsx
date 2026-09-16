// HOME — conversion-optimized single-page experience (Task 3-a).
// Server component composing client section components.
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { VoiceMessage } from "@/components/home/VoiceMessage";
import { Welcome } from "@/components/home/Welcome";
import { AgeGroups } from "@/components/home/AgeGroups";
import { CareAndLearning } from "@/components/home/CareAndLearning";
import { PlayActivities } from "@/components/home/PlayActivities";
import { WhyUs } from "@/components/home/WhyUs";
import { Values } from "@/components/home/Values";
import { Subsidy } from "@/components/home/Subsidy";
import { Gallery } from "@/components/home/Gallery";
import { FaqPreview } from "@/components/home/FaqPreview";
import { LocationPreview } from "@/components/home/LocationPreview";
import { FinalCta } from "@/components/home/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <VoiceMessage />
      <Welcome />
      <AgeGroups />
      <CareAndLearning />
      <PlayActivities />
      <WhyUs />
      <Values />
      <Subsidy />
      <Gallery />
      <FaqPreview />
      <LocationPreview />
      <FinalCta />
    </>
  );
}
