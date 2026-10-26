import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Badge,
  Button,
  ButtonSize,
  ButtonVariants,
  Hint,
  Left12Icon,
  Placement,
  Right12Icon,
  Text,
  TextColor,
  useSnackbar,
} from '@moysklad/uikit'
import { asset } from '../assets'
import emptyMascot from '../assets/icons/empty-mascot.svg'
import './SolutionsMenuPopover.css'

const POPOVER_WIDTH = 480
const VIEWPORT_GAP = 16

/** Боковое меню каталога https://www.moysklad.ru/integratsii/populyarnoe/ */
const CATEGORIES = [
  'В мобильном приложении',
  'Популярное',
  'Чаты',
  'Для Беларуси',
  'Для Казахстана',
  'Для Узбекистана',
  'Новые',
  'AI (ИИ) и чат-боты',
  'Маркировка',
  'Сотрудники',
  'CMS, конструкторы сайтов и соцсети',
  'CRM',
  'Email, SMS, мессенджеры',
  'Автоматизация',
  'Аналитика',
  'Банки',
  'Бухгалтерия',
  'Доставка',
  'Другое',
  'Заказы, счета и отгрузки',
  'Контрагенты',
  'Маркетплейсы',
  'Мобильные приложения',
  'Онлайн-кассы',
  'Оплата по QR-коду в рознице',
  'Платежные системы',
  'Программы лояльности',
  'Производство',
  'Телефония',
  'Товары и цены',
  'Торговое оборудование',
  'Финансы',
  'ЭДО',
]

type Pick = {
  logo: string
  title: string
  description: string
  badge?: string
}

/** Подборка «Выбор МоегоСклада»: пример из макета и решения сайдпейджа. */
const PICKS: Pick[] = [
  {
    logo: asset('/mock/solutions/logo-mailings.png'),
    title: 'Рассылки 365: WhatsApp Telegram MAX SMS Email',
    description:
      'Автоматически редактируйте документы и поля, отправляйте почту, SMS, WhatsApp, выполняйте быстро рутинные операции',
    badge: '14 дней бесплатно',
  },
  {
    logo: asset('/mock/solutions/logo-robots.png'),
    title: 'Роботы 365 Автоматизация действий',
    description: 'Автоматизирует повторяющиеся действия в МоёмСкладе по правилам',
  },
  {
    logo: asset('/mock/solutions/logo-order.png'),
    title: 'Онлайн-заказ',
    description: 'Принимает и обрабатывает онлайн-заказы покупателей в одном месте',
  },
  {
    logo: asset('/mock/solutions/logo-suppliers.png'),
    title: 'Заказы поставщикам',
    description:
      'Автоматизирует формирование и отправку заказов поставщикам на основе остатков и потребностей склада',
    badge: '7 дней бесплатно',
  },
  {
    logo: asset('/mock/solutions/logo-docs.png'),
    title: 'Конструктор документов',
    description:
      'Создаёт HTML, DOCX, ODT и PDF по шаблонам: фоны, QR-коды, склонения, условия и формулы',
    badge: '14 дней бесплатно',
  },
  {
    logo: asset('/mock/solutions/logo-ai-portrait.png'),
    title: 'AI Портрет клиента',
    description:
      'Сегментирует клиентов и показывает портрет покупателя на основе продаж и CRM',
  },
]

type InstalledApp = {
  logo: string
  title: string
  badge?: string
  clickable: boolean
  actions: string[]
}

/** Короткие установленные решения из макета поповера 2.1. */
const INSTALLED: InstalledApp[] = [
  {
    logo: asset('/mock/solutions/logo-mailings.png'),
    title: 'Рассылки 365: WhatsApp Telegram MAX SMS Email',
    badge: 'Требуется настройка',
    clickable: true,
    actions: [],
  },
  {
    logo: asset('/mock/solutions/logo-search.png'),
    title: 'Умный поиск',
    clickable: true,
    actions: ['Поиск заказа', 'Поиск контрагента', 'Поиск отгрузки', 'Поиск платежа'],
  },
]

const INSTALLED_TWO: InstalledApp[] = INSTALLED.map((app, index) =>
  index === 1 ? { ...app, actions: app.actions.slice(0, 2) } : app,
)
const INSTALLED_SCROLL: InstalledApp[] = INSTALLED.map((app, index) =>
  index === 1
    ? {
        ...app,
        actions: [
          ...app.actions,
          'Поиск счета',
          'Поиск возврата',
          'Поиск товара',
          'Поиск документа',
          'Поиск приемки',
          'Поиск перемещения',
          'Поиск инвентаризации',
          'Поиск прайс-листа',
        ],
      }
    : app,
)

/** Подборка 2.1 и 2.1.1: без решений из списка, «Конструктор документов» первый. */
const FEW_PICKS: Pick[] = (() => {
  const installed = new Set(INSTALLED.map((app) => app.title))
  const rest = PICKS.filter((item) => !installed.has(item.title))
  const docs = rest.filter((item) => item.title === 'Конструктор документов')
  const others = rest.filter((item) => item.title !== 'Конструктор документов')
  return [...docs, ...others]
})()

const MENU_LINKS = [
  { label: 'Каталог', message: 'Переход в каталог решений' },
  { label: 'Мои решения', message: 'Переход на страницу Мои решения в разделе' },
  { label: 'Разработка', message: 'Переход на страницу разработчика в каталоге решений' },
  { label: 'Блог', message: 'Переход в блог' },
] as const

const ACTION_MESSAGE =
  'Выполнение действия по кнопке: модальное окно, снекбар выполнения и пр.'

function isOverflowing(el: HTMLElement) {
  const { textOverflow, overflow } = el.style
  el.style.textOverflow = 'clip'
  el.style.overflow = 'hidden'
  const overflowing = el.scrollWidth > el.clientWidth
  el.style.textOverflow = textOverflow
  el.style.overflow = overflow
  return overflowing
}

function OverflowHint({ text, className }: { text: string; className: string }) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [hintOpen, setHintOpen] = useState(false)

  return (
    <Hint
      placement={Placement.TOP}
      mouseEnterDelay={0.3}
      zIndex={300}
      getTooltipContainer={() => document.body}
      visible={hintOpen}
      onVisibleChange={(visible) => {
        if (!visible) {
          setHintOpen(false)
          return
        }
        const el = textRef.current
        setHintOpen(Boolean(el && isOverflowing(el)))
      }}
      overlay={<Text.Body colorToken={TextColor.invert}>{text}</Text.Body>}
    >
      <span ref={textRef} className={className}>
        {text}
      </span>
    </Hint>
  )
}

function MoySkladPick({
  pick,
  onStep,
  onOpen,
}: {
  pick: Pick
  onStep: (delta: number) => void
  onOpen: () => void
}) {
  return (
    <div className="solutions-popover__pick">
      <div className="solutions-popover__pick-head">
        <p className="solutions-popover__pick-title">Выбор МоегоСклада</p>
        <div className="solutions-popover__arrows">
          <Button
            size={ButtonSize.M}
            variant={ButtonVariants.FILLED}
            color="grey"
            isIconButton
            aria-label="Предыдущее решение"
            onClick={() => onStep(-1)}
          >
            <Left12Icon />
          </Button>
          <Button
            size={ButtonSize.M}
            variant={ButtonVariants.FILLED}
            color="grey"
            isIconButton
            aria-label="Следующее решение"
            onClick={() => onStep(1)}
          >
            <Right12Icon />
          </Button>
        </div>
      </div>

      <div className="solutions-popover__card">
        <img className="solutions-popover__logo" src={pick.logo} alt="" width={24} height={24} />
        <div className="solutions-popover__card-body">
          <div className="solutions-popover__card-head">
            <button type="button" className="solutions-popover__title" onClick={onOpen}>
              {pick.title}
            </button>
            {pick.badge ? (
              <Badge className="solutions-popover__badge" variant="green" label={pick.badge} />
            ) : null}
          </div>
          <p className="solutions-popover__desc">{pick.description}</p>
        </div>
      </div>
    </div>
  )
}

type SolutionsMenuPopoverProps = {
  layout:
    | 'empty'
    | 'empty-only'
    | 'categories'
    | 'few'
    | 'few-scroll'
    | 'few-plain'
    | 'many'
    | 'many-scroll'
  anchor: HTMLElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
  onOpenFullList?: () => void
}

export function SolutionsMenuPopover({
  layout,
  anchor,
  onMouseEnter,
  onMouseLeave,
  onOpenFullList,
}: SolutionsMenuPopoverProps) {
  const { showSnackbar } = useSnackbar()
  const [index, setIndex] = useState(0)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [thumb, setThumb] = useState({ height: 0, top: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const picks = layout === 'few' || layout === 'few-scroll' ? FEW_PICKS : PICKS
  const pick = picks[index % picks.length]

  useLayoutEffect(() => {
    if (!anchor) return
    const place = () => {
      const rect = anchor.getBoundingClientRect()
      const viewport = document.documentElement.clientWidth
      const maxLeft = viewport - POPOVER_WIDTH - VIEWPORT_GAP
      const left = Math.round(Math.max(VIEWPORT_GAP, Math.min(rect.left, maxLeft)))
      setPos({ top: Math.round(rect.bottom + 4), left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchor])

  useLayoutEffect(() => {
    const root = popoverRef.current
    if (!root) return
    const snap = () => {
      const dpr = window.devicePixelRatio || 1
      const lines = [...root.querySelectorAll<HTMLElement>('.solutions-popover__divider')]
      for (const line of lines) {
        line.style.height = ''
        line.style.transform = ''
      }
      for (const line of lines) {
        const y = line.getBoundingClientRect().top
        const snapped = Math.round(y * dpr) / dpr
        line.style.height = `${1 / dpr}px`
        const delta = snapped - y
        line.style.transform = Math.abs(delta) > 0.01 ? `translateY(${delta}px)` : ''
      }
    }
    snap()
    window.addEventListener('resize', snap)
    return () => window.removeEventListener('resize', snap)
  }, [layout, pos, index, thumb])

  useLayoutEffect(() => {
    const node = scrollRef.current
    if (!node || (layout !== 'categories' && layout !== 'few-scroll' && layout !== 'many-scroll')) return
    const update = () => {
      const { scrollHeight, clientHeight, scrollTop } = node
      if (scrollHeight <= clientHeight) {
        setThumb({ height: 0, top: 0 })
        return
      }
      const height = Math.max(24, (clientHeight / scrollHeight) * clientHeight)
      const maxTop = clientHeight - height
      const top = ((scrollTop / (scrollHeight - clientHeight)) * maxTop)
      setThumb({ height, top })
    }
    update()
    node.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => {
      node.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [layout])

  const openSolution = () => {
    showSnackbar({
      message: 'Переход на страницу решения',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    })
  }

  const goCatalog = () => {
    showSnackbar({
      message: 'Переход в каталог решений',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    })
  }

  const step = (delta: number) => {
    setIndex((current) => (current + delta + picks.length) % picks.length)
  }

  const installedApps =
    layout === 'few-scroll' || layout === 'many-scroll'
      ? INSTALLED_SCROLL
      : layout === 'few-plain'
        ? INSTALLED_TWO
        : INSTALLED
  const scrolling = layout === 'few-scroll' || layout === 'many-scroll'
  const showPick = layout === 'few' || layout === 'few-scroll'
  const showFullList = layout === 'many' || layout === 'many-scroll'

  const renderInstalled = (apps: InstalledApp[]) => (
    <div className="solutions-popover__apps">
      {apps.map((app) => (
        <article key={app.title} className="solutions-popover__app">
          {app.clickable ? (
            <button
              type="button"
              className="solutions-popover__app-head solutions-popover__app-head--clickable"
              onClick={() =>
                showSnackbar({
                  message: 'Переход на страницу фрейма решения',
                  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                })
              }
            >
              <img className="solutions-popover__app-logo" src={app.logo} alt="" width={24} height={24} />
              <OverflowHint text={app.title} className="solutions-popover__app-title" />
              {app.badge ? (
                <Badge className="solutions-popover__badge" variant="red" label={app.badge} />
              ) : null}
              <span className="solutions-popover__goto" aria-hidden />
            </button>
          ) : (
            <div className="solutions-popover__app-head">
              <img className="solutions-popover__app-logo" src={app.logo} alt="" width={24} height={24} />
              <OverflowHint text={app.title} className="solutions-popover__app-title" />
              {app.badge ? (
                <Badge className="solutions-popover__badge" variant="red" label={app.badge} />
              ) : null}
            </div>
          )}
          {app.actions.length > 0 ? (
            <div className="solutions-popover__app-actions">
              {app.actions.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="solutions-popover__app-action"
                  onClick={() =>
                    showSnackbar({
                      message: ACTION_MESSAGE,
                      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                    })
                  }
                >
                  <OverflowHint text={label} className="solutions-popover__app-action-label" />
                </button>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )

  return createPortal(
    <div
      ref={popoverRef}
      className={`solutions-popover${
        layout === 'categories' ? ' solutions-popover--categories' : ''
      }${
        layout === 'few' || layout === 'few-scroll' || layout === 'many' || layout === 'many-scroll'
          ? ' solutions-popover--few'
          : ''
      }${scrolling ? ' solutions-popover--few-scroll' : ''}`}
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {layout === 'categories' ? (
        <>
          <div className="solutions-popover__intro">
            <p className="solutions-popover__intro-title">
              Решения для расширения возможностей
            </p>
            <p className="solutions-popover__intro-desc">
              Добавляйте интеграции, автоматизации и функции к МоемуСкладу
            </p>
          </div>
          <div className="solutions-popover__divider" />
          <div className="solutions-popover__scroll-wrap">
          <div className="solutions-popover__scroll" ref={scrollRef}>
            <div className="solutions-popover__pick-head">
              <p className="solutions-popover__pick-title">Выбор МоегоСклада</p>
              <div className="solutions-popover__arrows">
                <Button
                  size={ButtonSize.M}
                  variant={ButtonVariants.FILLED}
                  color="grey"
                  isIconButton
                  aria-label="Предыдущее решение"
                  onClick={() => step(-1)}
                >
                  <Left12Icon />
                </Button>
                <Button
                  size={ButtonSize.M}
                  variant={ButtonVariants.FILLED}
                  color="grey"
                  isIconButton
                  aria-label="Следующее решение"
                  onClick={() => step(1)}
                >
                  <Right12Icon />
                </Button>
              </div>
            </div>
            <div className="solutions-popover__card solutions-popover__card--compact">
              <img className="solutions-popover__logo" src={pick.logo} alt="" width={16} height={16} />
              <div className="solutions-popover__card-body">
                <div className="solutions-popover__card-head">
                  <button type="button" className="solutions-popover__title" onClick={openSolution}>
                    {pick.title}
                  </button>
                  {pick.badge ? (
                    <Badge className="solutions-popover__badge" variant="green" label={pick.badge} />
                  ) : null}
                </div>
                <p className="solutions-popover__desc">{pick.description}</p>
              </div>
            </div>
            <p className="solutions-popover__categories-title">Другие категории</p>
            <ul className="solutions-popover__categories">
              {CATEGORIES.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    className="solutions-popover__category"
                    onClick={() =>
                      showSnackbar({
                        message: `Переход на страницу категории каталога "${name}"`,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                      })
                    }
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {thumb.height > 0 ? (
            <div
              className="solutions-popover__thumb"
              style={{ height: thumb.height, transform: `translateY(${thumb.top}px)` }}
            />
          ) : null}
          </div>
          <div className="solutions-popover__footer">
            <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS} onClick={goCatalog}>
              Каталог решений
            </Button>
            <Button
              size={ButtonSize.L}
              variant={ButtonVariants.FRAMELESS}
              onClick={() =>
                showSnackbar({
                  message: 'Переход в блог',
                  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                })
              }
            >
              Статьи и обзоры
            </Button>
          </div>
        </>
      ) : null}
      {layout === 'few' ||
      layout === 'few-scroll' ||
      layout === 'few-plain' ||
      layout === 'many' ||
      layout === 'many-scroll' ? (
        <>
          <div className="solutions-popover__links">
            {MENU_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                className="solutions-popover__link"
                onClick={() =>
                  showSnackbar({
                    message: link.message,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                  })
                }
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="solutions-popover__divider" />
          {scrolling ? (
            <div className="solutions-popover__scroll-wrap">
              <div className="solutions-popover__scroll" ref={scrollRef}>
                {renderInstalled(installedApps)}
              </div>
              {thumb.height > 0 ? (
                <div
                  className="solutions-popover__thumb"
                  style={{ height: thumb.height, transform: `translateY(${thumb.top}px)` }}
                />
              ) : null}
            </div>
          ) : (
            renderInstalled(installedApps)
          )}
          {showPick ? (
            <>
              <div className="solutions-popover__divider" />
              <MoySkladPick pick={pick} onStep={step} onOpen={openSolution} />
            </>
          ) : null}
          {showFullList ? (
            <>
              <div className="solutions-popover__divider" />
              <div className="solutions-popover__full-list">
                <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS} onClick={onOpenFullList}>
                  Полный список
                </Button>
              </div>
            </>
          ) : null}
        </>
      ) : null}
      {layout === 'empty' || layout === 'empty-only' ? (
        <>
      <div className="solutions-popover__empty">
        <div className="solutions-popover__mascot">
          <img src={emptyMascot} alt="" />
        </div>
        <div className="solutions-popover__empty-copy">
          <div className="solutions-popover__empty-text">
            <p className="solutions-popover__empty-title">
              У вас нет активных решений для быстрого доступа
            </p>
            <p className="solutions-popover__empty-desc">
              Добавляйте интеграции, автоматизации и функции к МоемуСкладу в каталоге решений
            </p>
          </div>
          <div className="solutions-popover__actions">
            <Button size={ButtonSize.L} variant={ButtonVariants.PRIMARY} onClick={goCatalog}>
              Перейти в каталог
            </Button>
            <Button
              size={ButtonSize.L}
              variant={ButtonVariants.FRAMELESS}
              onClick={() =>
                showSnackbar({
                  message: 'Переход в блог',
                  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                })
              }
            >
              Обзоры решений
            </Button>
          </div>
        </div>
      </div>
      {layout === 'empty' ? (
        <>
      <div className="solutions-popover__divider" />
      <MoySkladPick pick={pick} onStep={step} onOpen={openSolution} />
        </>
      ) : null}
        </>
      ) : null}
    </div>,
    document.body,
  )
}
