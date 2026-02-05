import { AnimatePresence } from 'framer-motion'
import { useGachaStore } from '@/stores/useGachaStore'
import { ScreenTransition } from '@/components/ScreenTransition'
import { TitleScreen } from '@/screens/TitleScreen'
import { GachaScreen } from '@/screens/GachaScreen'
import { PotionScreen } from '@/screens/PotionScreen'
import { CombinationScreen } from '@/screens/CombinationScreen'
import { GenerationScreen } from '@/screens/GenerationScreen'

function App() {
  const screen = useGachaStore((s) => s.screen)

  const renderScreen = () => {
    switch (screen) {
      case 'title':
        return <TitleScreen />
      case 'gacha':
        return <GachaScreen />
      case 'potion':
        return <PotionScreen />
      case 'combination':
        return <CombinationScreen />
      case 'generation':
        return <GenerationScreen />
    }
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <ScreenTransition key={screen}>
          {renderScreen()}
        </ScreenTransition>
      </AnimatePresence>
    </div>
  )
}

export default App
