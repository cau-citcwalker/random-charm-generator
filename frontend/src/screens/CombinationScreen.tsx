import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGachaStore } from '@/stores/useGachaStore'
import { getChoices, submitGenerate } from '@/api/client'
import { ShapePicker } from '@/components/ShapePicker'
import { PatternPicker } from '@/components/PatternPicker'
import { ColorPicker } from '@/components/ColorPicker'
import type { ColorOption } from '@/types/choices'
import { playClick } from '@/utils/audio'

export function CombinationScreen() {
  const {
    baseElement,
    selectedPotions,
    selectedShape,
    selectedPattern,
    selectedColor,
    setShape,
    setPattern,
    setColor,
    setGenerationId,
    setGenerationStatus,
    setScreen,
  } = useGachaStore()

  const [shapes, setShapes] = useState<string[]>([])
  const [patterns, setPatterns] = useState<string[]>([])
  const [colors, setColors] = useState<ColorOption[]>([])

  useEffect(() => {
    getChoices()
      .then((data) => {
        setShapes(data.shapes)
        setPatterns(data.patterns)
        setColors(data.colors)
      })
      .catch(console.error)
  }, [])

  const isComplete = selectedShape && selectedPattern && selectedColor

  const handleComplete = async () => {
    if (!baseElement || !selectedShape || !selectedPattern || !selectedColor) return
    playClick()

    try {
      const response = await submitGenerate({
        base_element: baseElement.base_element,
        potions: selectedPotions,
        shape: selectedShape,
        pattern: selectedPattern,
        color: selectedColor,
      })
      setGenerationId(response.generation_id)
      setGenerationStatus('queued')
      setScreen('generation')
    } catch (error) {
      console.error('Generation submit failed:', error)
    }
  }

  return (
    <div className="combination-screen">
      <h2 className="screen-title">결합</h2>
      <p className="screen-desc">도형, 패턴, 색상을 선택하세요</p>

      <div className="picker-section">
        <h3>도형</h3>
        <ShapePicker
          shapes={shapes}
          selected={selectedShape}
          onSelect={setShape}
        />
      </div>

      <div className="picker-section">
        <h3>패턴</h3>
        <PatternPicker
          patterns={patterns}
          selected={selectedPattern}
          onSelect={setPattern}
        />
      </div>

      <div className="picker-section">
        <h3>색상</h3>
        <ColorPicker
          colors={colors}
          selected={selectedColor}
          onSelect={setColor}
        />
      </div>

      <motion.button
        className="btn-complete"
        onClick={handleComplete}
        disabled={!isComplete}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        완료
      </motion.button>
    </div>
  )
}
