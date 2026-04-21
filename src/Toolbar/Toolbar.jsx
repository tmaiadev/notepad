import { Button, ButtonGroup } from '@heroui/react'
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
            variant={viewMode === 'raw' ? 'secondary' : 'ghost'}
            onPress={() => onViewModeChange('raw')}
          >
            Raw
          </Button>
          <Button
            variant={viewMode === 'visualizer' ? 'secondary' : 'ghost'}
            onPress={() => onViewModeChange('visualizer')}
          >
            <ButtonGroup.Separator />
            Visualizer
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

export default Toolbar
