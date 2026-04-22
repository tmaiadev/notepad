import { Button } from '@heroui/react'
import { DownloadIcon } from 'lucide-react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { EditMenu } from './EditMenu'
import { FileMenu } from './FileMenu'
import { HelpMenu } from './HelpMenu'
import { InsertMenu } from './InsertMenu'
import { ViewModeToggle } from './ViewModeToggle'

export function Toolbar() {
  const install = useInstallPrompt()

  return (
    <div className="toolbar flex w-full items-center justify-between border-b border-border px-2 py-1">
      <div className="flex items-center">
        <FileMenu />
        <EditMenu />
        <InsertMenu />
        <HelpMenu />
      </div>
      <div className="flex items-center gap-1">
        {install && (
          <Button size="sm" variant="ghost" onPress={install.trigger}>
            <DownloadIcon size={14} />
            Install
          </Button>
        )}
        <ViewModeToggle />
      </div>
    </div>
  )
}
