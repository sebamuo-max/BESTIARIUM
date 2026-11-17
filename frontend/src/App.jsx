import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, Search, Plus, Feather, Compass, Menu, X, ScrollText, Sparkles, LoaderCircle } from 'lucide-react'
import CrystalScene from './components/CrystalScene'
import CreatureCard from './components/CreatureCard'
import CreatureModal from './components/CreatureModal'
import CreatureForm from './components/CreatureForm'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function App() {
  const [creatures, setCreatures] = useState([])
  const [categories, setCategories] = useState(['Todas'])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [admin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [creatureRes, categoryRes] = await Promise.all([fetch(`${API}/api/creatures`), fetch(`${API}/api/categories`)])
      if (!creatureRes.ok || !categoryRes.ok) throw new Error('El servidor no respondió correctamente.')
      setCreatures(await creatureRes.json())
      setCategories(['Todas', ...(await categoryRes.json())])
    } catch (err) { setError('No pudimos conectar con el archivo central. Comprueba que el backend esté encendido.'); }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = useMemo(() => creatures.filter(c => {
    const matchesCategory = category === 'Todas' || c.category === category
    const term = search.toLowerCase().trim()
    const matchesSearch = !term || `${c.name} ${c.description} ${c.region} ${c.category}`.toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  }), [creatures, category, search])

  const saveCreature = async data => {
    const url = editing ? `${API}/api/creatures/${editing.id}` : `${API}/api/creatures`
    const response = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'No se pudo guardar el registro.')
    setFormOpen(false); setEditing(null); setSelected(null); setNotice(result.message); await loadData(); setTimeout(() => setNotice(''), 3000)
  }

  const deleteCreature = async creature => {
    if (!window.confirm(`¿Eliminar el registro de ${creature.name}?`)) return
    const response = await fetch(`${API}/api/creatures/${creature.id}`, { method: 'DELETE' })
    const result = await response.json()
    if (!response.ok) { setNotice(result.error || 'No se pudo eliminar.'); return }
    setSelected(null); setNotice(result.message); await loadData(); setTimeout(() => setNotice(''), 3000)
  }

  const startEdit = creature => { setSelected(null); setEditing(creature); setFormOpen(true) }
  const startCreate = () => { setEditing(null); setFormOpen(true) }
  const scrollToArchive = () => { document.getElementById('archivo')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenu(false) }

  return <div className="app-shell">
    <header className="site-header">
      <a href="#inicio" className="brand"><span className="brand-mark"><Feather size={19}/></span><span>BESTIARIO<small>ARCHIVO DE LO DESCONOCIDO</small></span></a>
      <nav className={mobileMenu ? 'nav-links nav-open' : 'nav-links'}><a href="#inicio" onClick={() => setMobileMenu(false)}>Inicio</a><a href="#archivo" onClick={() => setMobileMenu(false)}>El archivo</a><a href="#acerca" onClick={() => setMobileMenu(false)}>Acerca del bestiario</a></nav>
      <div className="header-actions"><button className={admin ? 'admin-toggle active' : 'admin-toggle'} onClick={() => setAdmin(!admin)}>{admin ? 'Modo editor activo' : 'Modo editor'}</button><button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menú">{mobileMenu ? <X/> : <Menu/>}</button></div>
    </header>

    <main>
      <section className="hero-section" id="inicio">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> TOMO I · CRIATURAS Y LEYENDAS</p><h1>Hay mundos<br/>que <em>no deberían</em><br/>ser olvidados.</h1><p className="hero-description">Un archivo de seres extraordinarios, mitos antiguos y criaturas que habitan más allá de lo conocido. Abre sus páginas bajo tu propio riesgo.</p>
          <div className="hero-buttons"><button className="button-primary" onClick={scrollToArchive}><BookOpen size={16}/> Explorar el archivo</button><a className="text-link" href="#acerca">Conoce el proyecto <span>↗</span></a></div>
          <div className="hero-stats"><div><strong>{String(creatures.length).padStart(2,'0')}</strong><span>REGISTROS</span></div><div><strong>{String(Math.max(categories.length - 1, 0)).padStart(2,'0')}</strong><span>CLASIFICACIONES</span></div><div><strong>∞</strong><span>MISTERIOS</span></div></div>
        </div>
        <div className="hero-visual"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-label label-top">OBJETO DE ESTUDIO <span>№ 001</span></div><CrystalScene/><div className="visual-caption"><span className="caption-dot"/> ARTEFACTO EN OBSERVACIÓN <span>— 03:17:09</span></div></div>
        <div className="hero-bottom-note"><span>FIG. 01</span> FRAGMENTO DEL ARCHIVO CENTRAL <span className="note-right">DESPLAZA PARA DESCUBRIR ↓</span></div>
      </section>

      <section className="archive-section" id="archivo">
        <div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line"/> COMPENDIO DE ENTIDADES</p><h2>El <em>archivo</em></h2><p className="section-subtitle">Cada registro guarda una historia. Algunas es mejor no pronunciarlas.</p></div><div className="archive-count"><span>REGISTROS DISPONIBLES</span><strong>{String(filtered.length).padStart(2,'0')} <small>/ {String(creatures.length).padStart(2,'0')}</small></strong></div></div>
        <div className="archive-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar criatura, región o leyenda..."/><kbd>⌕</kbd></div><div className="filter-wrap"><Compass size={15}/><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filtrar por categoría">{categories.map(c => <option key={c}>{c}</option>)}</select></div>{admin && <button className="button-primary add-button" onClick={startCreate}><Plus size={16}/> Nuevo registro</button>}</div>
        {error && <div className="error-panel"><p>{error}</p><button className="button-secondary" onClick={loadData}>Reintentar conexión</button></div>}
        {loading ? <div className="loading-state"><LoaderCircle className="spin" size={25}/> Consultando el archivo central...</div> : <>
          {filtered.length ? <div className="creature-grid">{filtered.map(c => <CreatureCard key={c.id} creature={c} onSelect={setSelected}/>)}</div> : <div className="empty-state"><ScrollText size={30}/><h3>No encontramos registros</h3><p>Prueba otra búsqueda o cambia la clasificación.</p><button className="text-link" onClick={() => { setSearch(''); setCategory('Todas') }}>Limpiar filtros ↗</button></div>}
        </>}
      </section>

      <section className="about-section" id="acerca"><div className="about-mark">✳</div><div className="about-copy"><p className="eyebrow"><span className="eyebrow-line"/> SOBRE ESTE COMPENDIO</p><h2>Un mapa de lo<br/><em>imposible.</em></h2></div><div className="about-text"><p>El Bestiario es un archivo digital dedicado a recopilar criaturas fantásticas, seres mitológicos y leyendas de territorios imaginarios. Cada entrada reúne su origen, características y habilidades conocidas.</p><p>Este compendio crece con cada nuevo descubrimiento. Explora sus registros, consulta sus fichas y descubre qué se esconde detrás de cada nombre.</p><div className="about-signature">— ARCHIVISTA DEL TOMO I</div></div></section>
    </main>

    <footer className="site-footer"><a href="#inicio" className="brand"><span className="brand-mark"><Feather size={17}/></span><span>BESTIARIO<small>ARCHIVO DE LO DESCONOCIDO</small></span></a><span>ALGUNAS LEYENDAS MERECEN SER RECORDADAS.</span><span>© 2026 · TOMO I</span></footer>
    {notice && <div className="toast"><Sparkles size={16}/>{notice}</div>}
    <CreatureModal creature={selected} onClose={() => setSelected(null)} onEdit={creature => admin ? startEdit(creature) : setNotice('Activa el modo editor para modificar registros.')} onDelete={creature => admin ? deleteCreature(creature) : setNotice('Activa el modo editor para eliminar registros.')} />
    {formOpen && <CreatureForm initial={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onSave={saveCreature}/>}
  </div>
}
