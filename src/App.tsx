import { useRef, useState } from 'react'
import { CaseWorkspace } from './components/CaseWorkspace'
import { demoCases, type DemoCase } from './data/demoCases'
import { DesignIcon as Icon } from './components/DesignIcon'
import { type SchemaCanvasHandle } from './components/SchemaCanvas'
import './App.css'

export default function App() {
  const simpleRef = useRef<SchemaCanvasHandle>(null)
  const complexRef = useRef<SchemaCanvasHandle>(null)
  const [activeCase, setActiveCase] = useState<DemoCase['id']>('simple')
  const [visited, setVisited] = useState(new Set<DemoCase['id']>(['simple']))
  const canvasRef = activeCase === 'simple' ? simpleRef : complexRef
  const changeCase = (id: DemoCase['id']) => {
    setVisited((current) => new Set([...current, id]))
    setActiveCase(id)
  }
  const [showData, setShowData] = useState(true)
  const [showRelations, setShowRelations] = useState(() => window.innerWidth >= 1100)
  return <div className="app">
      <nav className="nav-rail" aria-label="Основная навигация">
        <img className="nav-logo" src="/figma/logo.svg" alt="Логотип" />
        <div className="nav-items">{[['home', 'Главная'], ['file', 'Проекты'], ['chart', 'Отчёты'], ['users', 'Команда'], ['support', 'Поддержка']].map(([name, label]) => <button key={name} className="icon-button" title={`${label} — недоступно в прототипе`} disabled><Icon name={name} /></button>)}</div>
        <div className="nav-bottom"><span className="avatar">БХ</span><button className="nav-expand icon-button" title="Скрыть или показать данные" onClick={() => setShowData(!showData)}><Icon name="expand" /></button></div>
      </nav>
      <div className="app__workspace">
        <header className="app__header">
          <div className="project-name">Новый проект <Icon name="down" /></div>
          <div className="header-actions"><span className="session-note">Прототип · изменения в текущей сессии</span><button className="icon-button outlined" title="Вписать схему" onClick={() => canvasRef.current?.fit()}><Icon name="refresh" /></button><button className="outlined" onClick={() => canvasRef.current?.exportSchema()}>Поделиться</button></div>
        </header>
        <div className="workspace-toolbar"><button onClick={() => setShowData(!showData)}>Данные <Icon name="down" /></button><span className="toolbar-divider" /><button onClick={() => setShowRelations(!showRelations)} aria-pressed={showRelations}>Связи</button><button className="organize-button" title="Звезда: основная таблица в центре, связанные — вокруг" onClick={() => canvasRef.current?.organize()}>Упорядочить таблицы</button><button className={`icon-button data-toggle ${showData ? 'is-active' : ''}`} title="Панель данных" onClick={() => setShowData(!showData)} aria-pressed={showData}><Icon name="panel" /></button></div>
        <div className="app__cases">
          {demoCases.filter((demoCase) => visited.has(demoCase.id)).map((demoCase) => <CaseWorkspace key={demoCase.id} ref={demoCase.id === 'simple' ? simpleRef : complexRef} demoCase={demoCase} active={demoCase.id === activeCase} showData={showData} showRelations={showRelations} onCloseRelations={() => setShowRelations(false)} />)}
        </div>
        <footer className="workspace-footer"><div className="case-switcher" role="group" aria-label="Примеры модели данных">
          <button className={activeCase === 'simple' ? 'is-active' : ''} aria-pressed={activeCase === 'simple'} onClick={() => changeCase('simple')}>Простой пример</button>
          <button className={activeCase === 'complex' ? 'is-active' : ''} aria-pressed={activeCase === 'complex'} onClick={() => changeCase('complex')}>Интернет-магазин</button>
        </div><div className="view-tabs"><button className="icon-button is-active" title="Схема данных"><Icon name="network" /></button><button className="icon-button outlined" disabled title="Визуализация — недоступно в прототипе"><Icon name="presentation" /></button><button className="icon-button outlined" disabled title="Таблицы — недоступно в прототипе"><Icon name="properties" /></button></div></footer>
      </div>
    </div>
}
