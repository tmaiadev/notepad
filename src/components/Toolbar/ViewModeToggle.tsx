import { Button, ButtonGroup } from '@heroui/react'
import { PencilIcon, EyeIcon } from 'lucide-react'
import { useEditor } from '../../context/useEditor'

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useEditor()
  return (
    <ButtonGroup size="sm" variant="ghost">
      <Button
        aria-label="Edit"
        variant={viewMode === 'raw' ? 'secondary' : 'ghost'}
        onPress={() => setViewMode('raw')}
        isIconOnly
      >
        <PencilIcon size={16} />
      </Button>
      <Button
        aria-label="Formatted Document"
        variant={viewMode === 'visualizer' ? 'secondary' : 'ghost'}
        onPress={() => setViewMode('visualizer')}
        isIconOnly
      >
        <ButtonGroup.Separator />
        <EyeIcon size={16} />
      </Button>
    </ButtonGroup>
  )
}
