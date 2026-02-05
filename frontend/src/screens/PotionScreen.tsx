import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useGachaStore } from '@/stores/useGachaStore'
import { getChoices } from '@/api/client'
import { Cauldron } from '@/components/Cauldron'
import { PotionShelf } from '@/components/PotionShelf'
import { PotionBottle } from '@/components/PotionBottle'
import type { Potion } from '@/types/choices'
import { playPotionDrop, playClick } from '@/utils/audio'

export function PotionScreen() {
  const selectedPotions = useGachaStore((s) => s.selectedPotions)
  const addPotion = useGachaStore((s) => s.addPotion)
  const removePotion = useGachaStore((s) => s.removePotion)
  const setScreen = useGachaStore((s) => s.setScreen)
  const [potions, setPotions] = useState<Potion[]>([])
  const [activePotionId, setActivePotionId] = useState<string | null>(null)

  useEffect(() => {
    getChoices().then((data) => setPotions(data.potions)).catch(console.error)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActivePotionId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePotionId(null)
    if (event.over?.id === 'cauldron') {
      playPotionDrop()
      addPotion(event.active.id as string)
    }
  }

  const handleTapPotion = (potionId: string) => {
    playPotionDrop()
    if (selectedPotions.includes(potionId)) {
      removePotion(potionId)
    } else {
      addPotion(potionId)
    }
  }

  const handleNext = () => {
    playClick()
    setScreen('combination')
  }

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  })
  const sensors = useSensors(pointerSensor, touchSensor)

  const activePotion = potions.find((p) => p.id === activePotionId) ?? null

  return (
    <div className="potion-screen">
      <h2 className="screen-title">포션 조합</h2>
      <p className="screen-desc">포션을 솥에 넣어 마법의 조합을 만들어보세요</p>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <PotionShelf
          potions={potions}
          selectedPotions={selectedPotions}
          onTapPotion={handleTapPotion}
        />
        <Cauldron selectedPotions={selectedPotions} potions={potions} />
        <DragOverlay>
          {activePotion ? <PotionBottle potion={activePotion} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {selectedPotions.length > 0 && (
        <div className="selected-list">
          <span>선택된 포션: {selectedPotions.length}개</span>
          <div className="selected-tags">
            {selectedPotions.map((id) => {
              const potion = potions.find((p) => p.id === id)
              return potion ? (
                <span
                  key={id}
                  className="potion-tag"
                  style={{ backgroundColor: potion.color }}
                  onClick={() => removePotion(id)}
                >
                  {potion.name} ✕
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      <motion.button
        className="btn-next"
        onClick={handleNext}
        disabled={selectedPotions.length === 0}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        다음
      </motion.button>
    </div>
  )
}
