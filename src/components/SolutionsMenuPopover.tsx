import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Badge,
  Button,
  ButtonSize,
  ButtonVariants,
  Left12Icon,
  Right12Icon,
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

type SolutionsMenuPopoverProps = {
  layout: 'empty' | 'categories'
  anchor: HTMLElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function SolutionsMenuPopover({
  layout,
  anchor,
  onMouseEnter,
  onMouseLeave,
}: SolutionsMenuPopoverProps) {
  const { showSnackbar } = useSnackbar()
  const [index, setIndex] = useState(0)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [thumb, setThumb] = useState({ height: 0, top: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const pick = PICKS[index]

  useLayoutEffect(() => {
    if (!anchor) return
    const place = () => {
      const rect = anchor.getBoundingClientRect()
      const maxLeft = window.innerWidth - POPOVER_WIDTH - VIEWPORT_GAP
      const left = Math.max(VIEWPORT_GAP, Math.min(rect.left, maxLeft))
      setPos({ top: rect.bottom + 4, left })
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
    const node = scrollRef.current
    if (!node || layout !== 'categories') return
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
    setIndex((current) => (current + delta + PICKS.length) % PICKS.length)
  }

  return createPortal(
    <div
      className={`solutions-popover${layout === 'categories' ? ' solutions-popover--categories' : ''}`}
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
      {layout === 'empty' ? (
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

      <div className="solutions-popover__divider" />

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

      <div className="solutions-popover__card">
        <img className="solutions-popover__logo" src={pick.logo} alt="" width={24} height={24} />
        <div className="solutions-popover__card-body">
          <div className="solutions-popover__card-head">
            <button
              type="button"
              className="solutions-popover__title"
              onClick={() =>
                showSnackbar({
                  message: 'Переход на страницу решения',
                  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                })
              }
            >
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
        </>
      ) : null}
    </div>,
    document.body,
  )
}
