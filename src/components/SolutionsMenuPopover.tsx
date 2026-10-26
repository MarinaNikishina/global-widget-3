import { useLayoutEffect, useState } from 'react'
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
  anchor: HTMLElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function SolutionsMenuPopover({
  anchor,
  onMouseEnter,
  onMouseLeave,
}: SolutionsMenuPopoverProps) {
  const { showSnackbar } = useSnackbar()
  const [index, setIndex] = useState(0)
  const [pos, setPos] = useState({ top: 0, left: 0 })
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
      className="solutions-popover"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
            {pick.badge ? <Badge variant="green" label={pick.badge} /> : null}
          </div>
          <p className="solutions-popover__desc">{pick.description}</p>
        </div>
      </div>
      </div>
    </div>,
    document.body,
  )
}
