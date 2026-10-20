import { forwardRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import type { DemoCase } from '../data/demoCases'
import { DataPanel } from './DataPanel'
import { SchemaCanvas, type SchemaCanvasHandle } from './SchemaCanvas'

type Props = { demoCase: DemoCase; active: boolean; showData: boolean; showRelations: boolean; onCloseRelations: () => void }

export const CaseWorkspace = forwardRef<SchemaCanvasHandle, Props>(function CaseWorkspace({ demoCase, active, showData, showRelations, onCloseRelations }, ref) {
  const [placed, setPlaced] = useState<Set<string>>(new Set(demoCase.initialTableIds))
  const [activeFields, setActiveFields] = useState<Set<string>>(new Set())
  const [connectedFields, setConnectedFields] = useState<Set<string>>(new Set())
  return <div className="app__case" hidden={!active}>
    <ReactFlowProvider>
      <div className={`app__body ${showData ? '' : 'data-hidden'}`}>
        <SchemaCanvas ref={ref} demoCase={demoCase} onPlacedChange={setPlaced} onActiveFieldsChange={setActiveFields} onConnectedFieldsChange={setConnectedFields} showRelations={showRelations} onCloseRelations={onCloseRelations} />
        {showData && <DataPanel dataModel={demoCase.tables} placedTableIds={placed} activeFieldKeys={activeFields} connectedFieldKeys={connectedFields} onSelectField={(tableId, columnId) => {
          if (ref && typeof ref !== 'function') ref.current?.selectField(tableId, columnId)
        }} />}
      </div>
    </ReactFlowProvider>
  </div>
})
