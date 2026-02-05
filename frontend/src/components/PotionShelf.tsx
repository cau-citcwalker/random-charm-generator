import { PotionBottle } from './PotionBottle'
import type { Potion } from '@/types/choices'

interface PotionShelfProps {
  potions: Potion[]
  selectedPotions: string[]
  onTapPotion: (potionId: string) => void
}

export function PotionShelf({ potions, selectedPotions, onTapPotion }: PotionShelfProps) {
  return (
    <div className="potion-shelf">
      {potions.map((potion) => (
        <PotionBottle
          key={potion.id}
          potion={potion}
          isSelected={selectedPotions.includes(potion.id)}
          onTap={() => onTapPotion(potion.id)}
        />
      ))}
    </div>
  )
}
