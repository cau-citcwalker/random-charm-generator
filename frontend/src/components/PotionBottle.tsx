import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Potion } from '@/types/choices'

interface PotionBottleProps {
  potion: Potion
  isDragging?: boolean
  isSelected?: boolean
  onTap?: () => void
}

export function PotionBottle({ potion, isDragging, isSelected, onTap }: PotionBottleProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: potion.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      className={`potion-bottle ${isSelected ? 'selected' : ''}`}
      style={style}
      onClick={onTap}
      {...listeners}
      {...attributes}
    >
      <div className="bottle-body" style={{ backgroundColor: potion.color }}>
        <div className="bottle-liquid" />
        <div className="bottle-cap" />
      </div>
      <span className="potion-name">{potion.name}</span>
    </div>
  )
}
