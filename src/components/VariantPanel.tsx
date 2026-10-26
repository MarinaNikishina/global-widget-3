import './VariantPanel.css'
import {
  VARIANT_CATEGORIES,
  VARIANT_EMPTY,
  VARIANT_EMPTY_PICK,
  VARIANT_FEW,
  VARIANT_FEW_SCROLL,
  useVariant,
} from './variantContext'

const groups: Array<{ title: string; items: Array<{ id: string; label: string }> }> = [
  {
    title: 'Пустое состояние',
    items: [
      { id: VARIANT_EMPTY_PICK, label: '1.1 Empty state + Выбор МС' },
      { id: VARIANT_CATEGORIES, label: '1.2 Категории + Выбор МС' },
      { id: VARIANT_EMPTY, label: '1.3 Empty State' },
    ],
  },
  {
    title: 'Мало решений',
    items: [
      { id: VARIANT_FEW, label: '2.1 Список + Выбор МС' },
      { id: VARIANT_FEW_SCROLL, label: '2.1.1 Список + Выбор МС' },
    ],
  },
  { title: 'Много решений', items: [] },
]

export function VariantPanel() {
  const { variant, setVariant } = useVariant()

  return (
    <aside className="variant-panel" aria-label="Варианты">
      {groups.map((group) => (
        <section key={group.title} className="variant-panel__group">
          <h2 className="variant-panel__heading">{group.title}</h2>
          {group.items.map((item) => {
            const selected = variant === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`variant-panel__item${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => setVariant(selected ? null : item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </section>
      ))}
    </aside>
  )
}
