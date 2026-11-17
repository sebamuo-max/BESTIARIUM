import { MapPin, ShieldAlert, ArrowUpRight } from 'lucide-react'
export default function CreatureCard({ creature, onSelect }) {
  return <button className="creature-card text-left" onClick={() => onSelect(creature)}>
    <div className="card-art" style={{ '--creature-color': creature.color || '#c49a5a' }}>
      <span className="card-index">ARCHIVO N.º {String(creature.id).slice(-3).padStart(3, '0')}</span>
      <span className="creature-symbol">{creature.symbol || '✧'}</span>
      <span className="card-category">{creature.category}</span>
      <span className="card-art-glow" />
    </div>
    <div className="card-body">
      <div className="flex items-start justify-between gap-3">
        <div><h3>{creature.name}</h3><p className="card-region"><MapPin size={13}/>{creature.region}</p></div>
        <ArrowUpRight size={18} className="card-arrow" />
      </div>
      <p className="card-description">{creature.description}</p>
      <div className="card-footer"><span><ShieldAlert size={13}/>{creature.danger}</span><span>CONSULTAR FICHA</span></div>
    </div>
  </button>
}
