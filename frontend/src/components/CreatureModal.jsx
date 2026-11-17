import { X, MapPin, ShieldAlert, Sparkles } from 'lucide-react'
export default function CreatureModal({ creature, onClose, onEdit, onDelete }) {
  if (!creature) return null
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <article className="detail-modal">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Cerrar"><X size={20}/></button>
      <div className="detail-art" style={{ '--creature-color': creature.color || '#c49a5a' }}><span>{creature.symbol || '✧'}</span><small>REGISTRO DEL BESTIARIO · #{creature.id}</small></div>
      <div className="detail-content"><p className="eyebrow">{creature.category} / ARCHIVO CLASIFICADO</p><h2>{creature.name}</h2>
        <p className="detail-description">{creature.description}</p>
        <div className="detail-meta"><span><MapPin size={15}/>{creature.region}</span><span><ShieldAlert size={15}/>{creature.danger}</span></div>
        <h3><Sparkles size={16}/> Habilidades conocidas</h3>
        <div className="ability-list">{(creature.abilities || []).map((a, i) => <span key={i}>{a}</span>)}</div>
        <div className="detail-actions"><button className="button-secondary" onClick={() => onEdit(creature)}>Editar registro</button><button className="button-danger" onClick={() => onDelete(creature)}>Eliminar</button></div>
      </div>
    </article>
  </div>
}
