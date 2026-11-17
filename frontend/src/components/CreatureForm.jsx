import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
const empty = { name: '', category: 'Dragon', danger: 'Moderado', region: '', description: '', abilities: [''], color: '#c49a5a', symbol: '✧' }
export default function CreatureForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (initial) setForm({ ...empty, ...initial, abilities: initial.abilities?.length ? initial.abilities : [''] }) }, [initial])
  const change = e => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async e => { e.preventDefault(); setSaving(true); try { await onSave({ ...form, abilities: form.abilities.map(a => a.trim()).filter(Boolean) }) } finally { setSaving(false) } }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="form-modal">
    <div className="form-heading"><div><p className="eyebrow">ARCHIVO CENTRAL</p><h2>{initial ? 'Editar criatura' : 'Nuevo registro'}</h2></div><button className="icon-button" onClick={onClose}><X/></button></div>
    <form onSubmit={submit} className="creature-form">
      <label>Nombre<input name="name" value={form.name} onChange={change} required maxLength="70" placeholder="Ej. Umbra, el devorador"/></label>
      <div className="form-grid"><label>Categoría<select name="category" value={form.category} onChange={change}>{['Dragon','Bestia','Demonio','Espiritu','Ave mitica','Entidad','Ser elemental'].map(x => <option key={x}>{x}</option>)}</select></label><label>Peligrosidad<select name="danger" value={form.danger} onChange={change}>{['Bajo','Moderado','Alto','Extremo'].map(x => <option key={x}>{x}</option>)}</select></label></div>
      <label>Región<input name="region" value={form.region} onChange={change} required placeholder="Lugar donde habita"/></label>
      <label>Descripción<textarea name="description" value={form.description} onChange={change} required rows="3" maxLength="400" placeholder="Describe su origen y comportamiento..."/></label>
      <div className="form-grid"><label>Símbolo<input name="symbol" value={form.symbol} onChange={change} maxLength="3"/></label><label>Color distintivo<input name="color" type="color" value={form.color} onChange={change} className="color-input"/></label></div>
      <label>Habilidades (separadas por coma)<input value={form.abilities.join(', ')} onChange={e => setForm({ ...form, abilities: e.target.value.split(',').slice(0,5) })} placeholder="Vuelo, fuego, regeneración"/></label>
      <div className="form-actions"><button type="button" className="button-secondary" onClick={onClose}>Cancelar</button><button className="button-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar registro'}</button></div>
    </form>
  </section></div>
}
