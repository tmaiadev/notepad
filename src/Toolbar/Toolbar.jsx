import { Button, ButtonGroup } from '@heroui/react'
import { PencilIcon, EyeIcon } from 'lucide-react'
import FileMenu from './FileMenu'
import EditMenu from './EditMenu'
import InsertMenu from './InsertMenu'
import HelpMenu from './HelpMenu'

function Toolbar({ viewMode, onViewModeChange }) {
  return (
    <div className="toolbar flex w-full items-center justify-between border-b border-border px-2 py-1">
      <div className="flex items-center">
        <FileMenu />
        <EditMenu />
        <InsertMenu />
        <HelpMenu />
      </div>
      <div className="flex items-center">
        <ButtonGroup size="sm" variant="ghost">
          <Button
            aria-label="Edit"
            variant={viewMode === 'raw' ? 'secondary' : 'ghost'}
            onPress={() => onViewModeChange('raw')}
            isIconOnly
          >
            <PencilIcon size={16} />
          </Button>
          <Button
            aria-label="Formatted Document"
            variant={viewMode === 'visualizer' ? 'secondary' : 'ghost'}
            onPress={() => onViewModeChange('visualizer')}
            isIconOnly
          >
            <ButtonGroup.Separator />
            <EyeIcon size={16} />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

export default Toolbar
