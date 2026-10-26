import './VariantPanel.css'

const groups = ['Пустое состояние', 'Мало решений', 'Много решений']

export function VariantPanel() {
  return (
    <aside className="variant-panel" aria-label="Варианты">
      {groups.map((title) => (
        <section key={title} className="variant-panel__group">
          <h2 className="variant-panel__heading">{title}</h2>
        </section>
      ))}
    </aside>
  )
}
