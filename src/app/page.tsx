import { HeroSection } from '@/sections/HeroSection'
import { TestimonialsSection } from '@/sections/TestimonialsSection'
import { TnModelsSection } from '@/sections/TnModelsSection'
import { AirMaxPlusTNSection } from '@/sections/AirMaxPlusDriftSection'
import { AirMax95Section } from '@/sections/AirMax95Section'
import { MizunoProphecy6Section } from '@/sections/MizunoProphecy6Section'
import { MizunoProphecy7Section } from '@/sections/MizunoProphecy7Section'
import { MizunoProphecy8Section } from '@/sections/MizunoProphecy8Section'

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-950 overflow-x-hidden">
      <HeroSection />
      <TnModelsSection />
      <AirMaxPlusTNSection />
      <AirMax95Section />
      <MizunoProphecy6Section />
      <MizunoProphecy7Section />
      <MizunoProphecy8Section />
      <TestimonialsSection />
    </main>
  )
}
