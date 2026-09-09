import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Applications20Icon,
  Badge,
  Button,
  ButtonSize,
  ButtonVariants,
  Checkbox,
  Check20Icon,
  Delete12Icon,
  Down12Icon,
  DragNDrop20Icon,
  Help,
  HelpSize,
  Hint,
  Input,
  Link,
  MyApps20Icon,
  Placement,
  Play12Icon,
  Select,
  Sidepage,
  SidepageContent,
  SidepageFooter,
  SidepageHeader,
  SidepageMode,
  Spinner,
  SpinnerSize,
  Text,
  TextColor,
  TurnBackward20Icon,
  useSnackbar,
  type ISelectOption,
} from '@moysklad/uikit'
import { asset } from '../assets'
import './SolutionsSidepage.css'

/** Скрыто: включить, чтобы снова показать избранное (bookmark). */
const FAVORITES_ENABLED = false

/** Закрепление решений (бывшая логика избранного). */
const PINNING_ENABLED = true

/** Kit has only Bookmark16 — 20px outline glyph for favorites (скрыто). */
function Bookmark20Icon({
  stroke = 'currentColor',
  className,
}: {
  stroke?: string
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
    >
      <path
        d="M15.72 18.04 10 12.32l-5.72 5.72V2.15A1.43 1.43 0 0 1 5.71.72h8.58a1.43 1.43 0 0 1 1.43 1.43z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.1}
        fill="none"
      />
    </svg>
  )
}

/** attach-pin-20 из Figma library «Иконки». */
function AttachPin20Icon({
  stroke = 'currentColor',
  className,
}: {
  stroke?: string
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
    >
      <path
        d="M6.57041 13.3867L0.727553 19.2724M13.9133 10.9153L18.5847 7.90102C18.7666 7.79066 18.9217 7.64105 19.0384 7.46312C19.1551 7.28518 19.2306 7.08341 19.2593 6.87256C19.2881 6.66171 19.2694 6.4471 19.2046 6.2444C19.1397 6.04171 19.0305 5.85606 18.8847 5.70102L14.299 1.1153C14.1439 0.96954 13.9583 0.860256 13.7556 0.795436C13.5529 0.730617 13.3383 0.7119 13.1274 0.740652C12.9166 0.769405 12.7148 0.844901 12.5369 0.961624C12.3589 1.07835 12.2093 1.23335 12.099 1.4153L9.01327 6.02959L2.59898 7.45816C2.4523 7.49375 2.31762 7.56745 2.20855 7.67179C2.09949 7.77614 2.01992 7.90743 1.97788 8.0524C1.93584 8.19736 1.93282 8.35086 1.96914 8.49737C2.00545 8.64387 2.07981 8.77819 2.1847 8.88673L10.9704 17.6867C11.0816 17.7874 11.2169 17.8576 11.3632 17.8906C11.5095 17.9237 11.6619 17.9184 11.8055 17.8753C11.9492 17.8322 12.0793 17.7527 12.1833 17.6446C12.2872 17.5365 12.3615 17.4034 12.399 17.2582L13.9133 10.9153Z"
        stroke={stroke}
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

type SolutionsSidepageProps = {
  isOpen: boolean
  onClose: () => void
  initialSegment?: 'installed' | 'recommended'
}

type SolutionId =
  | 'payments'
  | 'order'
  | 'mailings'
  | 'robots'
  | 'debt'
  | 'search'
  | 'time'
  | 'ai-portrait'
  | 'suppliers'
  | 'docs'

type SolutionItem = {
  id: SolutionId
  logo: string
  title: string
  description?: string
  showDot?: boolean
  segment: 'installed' | 'recommended'
  body?:
    | 'payments'
    | 'order-actions'
    | 'mailings-actions'
    | 'robots-actions'
    | 'search'
    | 'time'
    | 'ai-settings'
    | 'debt-settings'
  /** Пробный период в днях (для рекомендуемых). */
  trialDays?: number
  /** Стоимость от, ₽/мес (для рекомендуемых). */
  priceFrom?: number
}

const SOLUTIONS: SolutionItem[] = [
  {
    id: 'payments',
    logo: asset('/mock/solutions/logo-payments.png'),
    title: 'Автоматическая привязка платежей',
    segment: 'installed',
    body: 'payments',
    description: 'Связывает входящие платежи с заказами и счетами без ручной работы',
    priceFrom: 800,
  },
  {
    id: 'order',
    logo: asset('/mock/solutions/logo-order.png'),
    title: 'Онлайн-заказ',
    segment: 'installed',
    body: 'order-actions',
    description: 'Принимает и обрабатывает онлайн-заказы покупателей в одном месте',
    priceFrom: 1200,
  },
  {
    id: 'mailings',
    logo: asset('/mock/solutions/logo-mailings.png'),
    title: 'Рассылки 365: WhatsApp Telegram MAX SMS Email',
    segment: 'installed',
    body: 'mailings-actions',
    description: 'Отправляет уведомления клиентам в мессенджеры, SMS и email',
    priceFrom: 1500,
  },
  {
    id: 'robots',
    logo: asset('/mock/solutions/logo-robots.png'),
    title: 'Роботы 365 Автоматизация действий',
    segment: 'installed',
    body: 'robots-actions',
    description: 'Автоматизирует повторяющиеся действия в МоёмСкладе по правилам',
    priceFrom: 2000,
  },
  {
    id: 'debt',
    logo: asset('/mock/solutions/logo-debt.png'),
    title: 'Установка лимита долга',
    segment: 'installed',
    body: 'debt-settings',
    showDot: true,
    description: 'Контролирует лимиты задолженности контрагентов при продажах',
    priceFrom: 900,
  },
  {
    id: 'search',
    logo: asset('/mock/solutions/logo-search.png'),
    title: 'Умный поиск клиента',
    segment: 'installed',
    body: 'search',
    description: 'Быстро находит контрагентов по любым данным прямо в документе',
    priceFrom: 700,
  },
  {
    id: 'time',
    logo: asset('/mock/solutions/logo-time.png'),
    title: 'Учет рабочего времени',
    segment: 'installed',
    body: 'time',
    description: 'Фиксирует начало и конец рабочего дня сотрудников',
    priceFrom: 1100,
  },
  {
    id: 'ai-portrait',
    logo: asset('/mock/solutions/logo-ai-portrait.png'),
    title: 'AI Портрет клиента',
    segment: 'installed',
    body: 'ai-settings',
    showDot: true,
    description: 'Сегментирует клиентов и показывает портрет покупателя на основе продаж и CRM',
    priceFrom: 2900,
  },
  {
    id: 'suppliers',
    logo: asset('/mock/solutions/logo-suppliers.png'),
    title: 'Заказы поставщикам',
    segment: 'recommended',
    description:
      'Автоматизирует формирование и отправку заказов поставщикам на основе остатков и потребностей склада',
    trialDays: 7,
    priceFrom: 1000,
  },
  {
    id: 'docs',
    logo: asset('/mock/solutions/logo-docs.png'),
    title: 'Конструктор документов',
    segment: 'recommended',
    description:
      'Создаёт HTML, DOCX, ODT и PDF по шаблонам: фоны, QR-коды, склонения, условия и формулы',
    trialDays: 14,
    priceFrom: 1500,
  },
]

const HIDDEN_LIST_IDS = new Set<SolutionId>(['payments', 'search', 'time'])

/** Решения без перехода: карточка не кликается, без ховера и шеврона. */
const NON_INTERACTIVE_IDS = new Set<SolutionId>(['mailings'])

const INSTALLED_IDS = SOLUTIONS.filter(
  (s) => s.segment === 'installed' && !HIDDEN_LIST_IDS.has(s.id),
).map((s) => s.id)
const RECOMMENDED_IDS = SOLUTIONS.filter((s) => s.segment === 'recommended').map((s) => s.id)

type SolutionCardProps = {
  logo: string
  title: string
  description?: string
  showDot?: boolean
  isPinned?: boolean
  isFavorite?: boolean
  isEditing?: boolean
  dragHandle?: ReactNode
  pinControl?: ReactNode
  bookmarkControl?: ReactNode
  onClick?: () => void
  children?: ReactNode
}

function isTitleOverflowing(el: HTMLElement) {
  // В части браузеров при text-overflow: ellipsis scrollWidth === clientWidth.
  // На время замера снимаем ellipsis.
  const { textOverflow, overflow } = el.style
  el.style.textOverflow = 'clip'
  el.style.overflow = 'hidden'
  const overflowing = el.scrollWidth > el.clientWidth
  el.style.textOverflow = textOverflow
  el.style.overflow = overflow
  return overflowing
}

function TruncatedTextHint({
  text,
  className,
  triggerClassName,
  as: As = Text,
}: {
  text: string
  className?: string
  triggerClassName?: string
  as?: typeof Text | typeof Text.H4
}) {
  const textRef = useRef<HTMLElement>(null)
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
        setHintOpen(Boolean(el && isTitleOverflowing(el)))
      }}
      overlay={<Text.Body colorToken={TextColor.invert}>{text}</Text.Body>}
    >
      <div className={triggerClassName}>
        <As ref={textRef} className={className} colorToken={TextColor.primary}>
          {text}
        </As>
      </div>
    </Hint>
  )
}

function SolutionTitle({ title }: { title: string }) {
  return (
    <div className="sol-card__title-ellipsis">
      <TruncatedTextHint text={title} className="sol-card__title" triggerClassName="sol-card__title-trigger" as={Text.H4} />
    </div>
  )
}

function SolutionCard({
  logo,
  title,
  description,
  showDot,
  isPinned,
  isFavorite,
  isEditing,
  dragHandle,
  pinControl,
  bookmarkControl,
  onClick,
  children,
}: SolutionCardProps) {
  const clickable = Boolean(onClick) && !isEditing

  const content = (
    <>
      <header
        className={`sol-card__header${clickable ? ' sol-card__header--clickable' : ''}`}
        onClick={clickable ? onClick : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick?.()
                }
              }
            : undefined
        }
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
      >
        {!isEditing && FAVORITES_ENABLED && bookmarkControl}
        <img className="sol-card__logo" src={logo} alt="" width={24} height={24} />
        <div className="sol-card__title-wrap">
          <SolutionTitle title={title} />
          {showDot ? (
            <span className="sol-card__badge">
              <Badge label="Требуется настройка" variant="red" />
            </span>
          ) : null}
        </div>
        {FAVORITES_ENABLED && !isEditing && isFavorite ? (
          <span className="sol-card__bookmark" aria-label="В избранном">
            <Bookmark20Icon />
          </span>
        ) : null}
        {PINNING_ENABLED && !isEditing && isPinned ? (
          <span className="sol-card__pin" aria-label="Закреплено">
            <AttachPin20Icon />
          </span>
        ) : null}
        {clickable ? <span className="sol-card__goto" aria-hidden /> : null}
      </header>
      {description ? (
        <div className="sol-card__body">
          <Text className="sol-card__description" colorToken={TextColor.primary}>
            {description}
          </Text>
        </div>
      ) : null}
      {!isEditing && children ? <div className="sol-card__body">{children}</div> : null}
    </>
  )

  if (isEditing) {
    return (
      <article className="sol-card sol-card--editing">
        <div className="sol-card__main">{content}</div>
        <div className="sol-card__controls">
          {pinControl}
          {dragHandle}
          {FAVORITES_ENABLED && bookmarkControl}
        </div>
      </article>
    )
  }

  return <article className="sol-card">{content}</article>
}

function ActionLine({ label }: { label: string }) {
  const option = { label, value: label }
  return (
    <Select.Option option={option} showHighlight={false} onClick={() => undefined} />
  )
}

const QUICK_ACTIONS: Partial<Record<NonNullable<SolutionItem['body']>, string[]>> = {
  'order-actions': ['Создать заказ', 'Отменить заказ', 'Изменить заказ'],
  'mailings-actions': ['Отправить уведомление', 'Отменить заказ'],
  'robots-actions': ['Создать заказ'],
}

/** Тексты кнопок/действий в карточке списка — для поиска «Действие или решение». */
function getQuickActions(
  item: SolutionItem,
  options?: { aiConfigured?: boolean },
): string[] | null {
  if (!item.body) return null
  if (item.body === 'ai-settings') {
    return options?.aiConfigured ? ['Запустить анализ заказа'] : null
  }
  return QUICK_ACTIONS[item.body] ?? null
}

function hasFeaturePanel(item: SolutionItem): boolean {
  return item.body === 'payments' || item.body === 'search' || item.body === 'time'
}

const AI_EMPLOYEE_OPTIONS: ISelectOption[] = [
  { label: 'Морозов С. В.', value: 'morozov' },
  { label: 'Петрова А. И.', value: 'petrova' },
  { label: 'Сидоров К. П.', value: 'sidorov' },
]

const AI_SELF_EMPLOYEE = AI_EMPLOYEE_OPTIONS[0]

type AiAccessUser = {
  id: string
  name: string
  profit: boolean
  cost: boolean
}

const DEBT_COUNTERPARTY_OPTIONS: ISelectOption[] = [
  { label: 'ООО «Ромашка»', value: 'romashka' },
  { label: 'ИП Козлова М.И.', value: 'kozlova' },
  { label: 'ООО «ТехноСнаб»', value: 'technosnab' },
  { label: 'АО «СеверТорг»', value: 'severtorg' },
]

type DebtLimitEntry = {
  id: string
  counterpartyId: string
  counterpartyName: string
  limit: string
}

function formatDebtLimit(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return `${Number(digits).toLocaleString('ru-RU')} ₽`
}

function SolutionDebtLimitsForm({
  counterparty,
  setCounterparty,
  limit,
  setLimit,
  onSave,
  compact,
}: {
  counterparty: ISelectOption | undefined
  setCounterparty: (v: ISelectOption | undefined) => void
  limit: string
  setLimit: (v: string) => void
  onSave: () => void
  compact?: boolean
}) {
  const canSave = Boolean(counterparty) && Boolean(limit.replace(/\D/g, ''))

  return (
    <div
      className={
        compact ? 'sol-card__debt' : 'solution-debt-settings__form'
      }
    >
      <Select
        label="Контрагент"
        value={counterparty}
        options={DEBT_COUNTERPARTY_OPTIONS}
        onChange={setCounterparty}
        placeholder="Выберите контрагента"
        searchable={false}
        fullWidth
        className={compact ? 'sol-card__debt-select' : 'solution-debt-settings__select'}
        dropdownZIndex={400}
        emptyText="Нет контрагентов"
      />
      <Input
        name="debt-limit"
        label="Лимит долга"
        value={limit}
        onChange={(e) => setLimit(e.target.value.replace(/[^\d\s]/g, ''))}
        inputSize="M"
        placeholder="0"
        className={compact ? 'sol-card__debt-limit' : undefined}
      />
      <Button
        size={ButtonSize.L}
        variant={ButtonVariants.PRIMARY}
        disabled={!canSave}
        onClick={onSave}
        className={compact ? 'sol-card__debt-save' : undefined}
        isIconButton={compact}
        aria-label={compact ? 'Сохранить' : undefined}
      >
        {compact ? <Check20Icon /> : 'Сохранить'}
      </Button>
    </div>
  )
}

function SolutionDebtSettingsPanel({
  counterparty,
  setCounterparty,
  limit,
  setLimit,
  entries,
  onSave,
  onRemove,
}: {
  counterparty: ISelectOption | undefined
  setCounterparty: (v: ISelectOption | undefined) => void
  limit: string
  setLimit: (v: string) => void
  entries: DebtLimitEntry[]
  onSave: () => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="solution-setup solution-debt-settings">
      <div className="solution-setup__header">
        <Text.H4 className="solution-setup__title">
          Лимиты задолженности контрагентов при продажах
        </Text.H4>
      </div>

      <div className="solution-debt-settings__content">
        <SolutionDebtLimitsForm
          counterparty={counterparty}
          setCounterparty={setCounterparty}
          limit={limit}
          setLimit={setLimit}
          onSave={onSave}
        />

        <div className="solution-debt-settings__table">
          <div className="solution-debt-settings__table-head">
            <span>Контрагент</span>
            <span>Лимит долга</span>
            <span className="solution-debt-settings__table-action" aria-hidden />
          </div>
          {entries.length === 0 ? (
            <div className="solution-debt-settings__table-empty">
              <Text.Caption colorToken={TextColor.secondary}>
                Нет добавленных лимитов.
              </Text.Caption>
            </div>
          ) : (
            <ul className="solution-debt-settings__table-body">
              {entries.map((entry) => (
                <li key={entry.id} className="solution-debt-settings__table-row">
                  <Text colorToken={TextColor.primary}>{entry.counterpartyName}</Text>
                  <Text colorToken={TextColor.primary}>{formatDebtLimit(entry.limit)}</Text>
                  <Button
                    size={ButtonSize.L}
                    variant={ButtonVariants.FRAMELESS}
                    isIconButton
                    aria-label={`Удалить ${entry.counterpartyName}`}
                    className="solution-debt-settings__remove"
                    onClick={() => onRemove(entry.id)}
                  >
                    <Delete12Icon />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SolutionAiSettingsPanel({
  employee,
  setEmployee,
  users,
  setUsers,
  onSave,
}: {
  employee: ISelectOption | undefined
  setEmployee: (v: ISelectOption | undefined) => void
  users: AiAccessUser[]
  setUsers: Dispatch<SetStateAction<AiAccessUser[]>>
  onSave: (isConfigured: boolean) => void
}) {
  const addUser = (option: ISelectOption) => {
    setUsers((prev) => {
      if (prev.some((u) => u.id === String(option.value))) return prev
      return [
        ...prev,
        {
          id: String(option.value),
          name: option.label,
          profit: true,
          cost: false,
        },
      ]
    })
    setEmployee(undefined)
  }

  const handleAdd = () => {
    if (!employee) return
    addUser(employee)
  }

  const handleAddSelf = () => {
    addUser(AI_SELF_EMPLOYEE)
  }

  const toggleUserFlag = (id: string, field: 'profit' | 'cost') => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, [field]: !user[field] } : user)),
    )
  }

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  return (
    <div className="solution-setup solution-ai-settings">
      <div className="solution-setup__header">
        <div className="solution-setup__title-row">
          <Text.H4 className="solution-setup__title">Настройка решения</Text.H4>
          <Link
            href="#"
            className="solution-setup__manual"
            onClick={(e) => e.preventDefault()}
          >
            Инструкция
          </Link>
        </div>
        <Text className="solution-setup__subtitle" colorToken={TextColor.secondary}>
          Доступ пользователей. Пользователи из списка могут открывать решение и виджет.
        </Text>
      </div>

      <div className="solution-ai-settings__content">
        <div className="solution-ai-settings__employee">
          <Select
            label="Сотрудник"
            value={employee}
            options={AI_EMPLOYEE_OPTIONS}
            onChange={setEmployee}
            placeholder="Выберите сотрудника"
            searchable={false}
            fullWidth
            className="solution-ai-settings__select"
            dropdownZIndex={400}
            emptyText="Нет сотрудников"
          />
          <div className="solution-ai-settings__employee-actions">
            <Button
              size={ButtonSize.L}
              variant={ButtonVariants.ADDITIONAL}
              disabled={!employee}
              onClick={handleAdd}
            >
              Добавить
            </Button>
            <Button size={ButtonSize.L} variant={ButtonVariants.ADDITIONAL} onClick={handleAddSelf}>
              Добавить себя
            </Button>
          </div>
        </div>

        <div className="solution-ai-settings__table">
          <div className="solution-ai-settings__table-head">
            <span>Сотрудник</span>
            <span>Прибыль, ₽</span>
            <span>Себестоимость, ₽</span>
            <span className="solution-ai-settings__table-action" aria-hidden />
          </div>
          {users.length === 0 ? (
            <div className="solution-ai-settings__table-empty">
              <Text.Caption colorToken={TextColor.secondary}>
                Нет добавленных пользователей.
              </Text.Caption>
            </div>
          ) : (
            <ul className="solution-ai-settings__table-body">
              {users.map((user) => (
                <li key={user.id} className="solution-ai-settings__table-row">
                  <Text colorToken={TextColor.primary}>{user.name}</Text>
                  <Checkbox
                    checked={user.profit}
                    onChange={() => toggleUserFlag(user.id, 'profit')}
                    aria-label={`Прибыль: ${user.name}`}
                  />
                  <Checkbox
                    checked={user.cost}
                    onChange={() => toggleUserFlag(user.id, 'cost')}
                    aria-label={`Себестоимость: ${user.name}`}
                  />
                  <Button
                    size={ButtonSize.L}
                    variant={ButtonVariants.FRAMELESS}
                    isIconButton
                    aria-label={`Удалить ${user.name}`}
                    className="solution-ai-settings__remove"
                    onClick={() => removeUser(user.id)}
                  >
                    <Delete12Icon />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="solution-ai-settings__footer">
          <div className="solution-setup__actions">
            <Button
              size={ButtonSize.L}
              variant={ButtonVariants.PRIMARY}
              onClick={() => onSave(users.length > 0)}
            >
              Сохранить настройки
            </Button>
            <Button size={ButtonSize.L} variant={ButtonVariants.ADDITIONAL}>
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SEARCH_RESULTS = [
  {
    id: '1',
    name: 'ООО «Ромашка»',
    meta: 'ИНН 7701234567 · Покупатель',
    requisites: 'ИНН 7701234567 / КПП 770101001',
    address: 'г. Москва, ул. Садовая, 12, оф. 401',
    contact: 'Иванова Ольга, менеджер',
    phone: '+7 495 120-33-45',
    balance: 'Долг 18 400 ₽',
  },
  {
    id: '2',
    name: 'ИП Козлова М.И.',
    meta: 'ИНН 501234567890 · Покупатель',
    requisites: 'ИНН 501234567890',
    address: 'Московская обл., г. Химки, ул. Победы, 3',
    contact: 'Козлова Марина, владелец',
    phone: '+7 926 774-11-08',
    balance: 'Без задолженности',
  },
  {
    id: '3',
    name: 'ООО «ТехноСнаб»',
    meta: 'ИНН 5409876543 · Поставщик',
    requisites: 'ИНН 5409876543 / КПП 540901001',
    address: 'г. Новосибирск, пр. Дзержинского, 87',
    contact: 'Петров Артём, отдел продаж',
    phone: '+7 383 210-56-70',
    balance: 'Аванс 32 000 ₽',
  },
]

const SEARCH_OPTIONS: ISelectOption[] = SEARCH_RESULTS.map((row) => ({
  label: row.name,
  value: row.id,
}))

/** Поиск идёт и по реквизитам/контактам: совпавшее поле дописываем в label,
 *  иначе встроенный фильтр Select отбросит вариант. */
function buildCounterpartyOptions(searchText: string): ISelectOption[] {
  const q = searchText.trim().toLowerCase()
  if (!q) return SEARCH_OPTIONS

  const options: ISelectOption[] = []
  SEARCH_RESULTS.forEach((row) => {
    if (row.name.toLowerCase().includes(q)) {
      options.push({ label: row.name, value: row.id })
      return
    }
    const matched = [row.requisites, row.address, row.contact, row.phone, row.meta].find((field) =>
      field.toLowerCase().includes(q),
    )
    if (matched) {
      options.push({ label: `${row.name} · ${matched}`, value: row.id })
    }
  })
  return options
}

function CounterpartySearchSelect({
  value,
  onChange,
  className,
  fullWidth,
}: {
  value: ISelectOption | undefined
  onChange?: (v: ISelectOption | undefined) => void
  className?: string
  fullWidth?: boolean
}) {
  const [searchText, setSearchText] = useState('')
  const options = useMemo(() => buildCounterpartyOptions(searchText), [searchText])

  return (
    <Select
      value={value}
      options={options}
      onChange={(option) => onChange?.(option)}
      onSearch={setSearchText}
      onClear={() => onChange?.(undefined)}
      placeholder="Поиск контрагента..."
      searchable
      fullWidth={fullWidth}
      className={className}
      dropdownZIndex={400}
      emptyText="Ничего не найдено"
    />
  )
}

function SolutionCounterpartyCard({ id }: { id: string }) {
  const row = SEARCH_RESULTS.find((r) => r.id === id)
  if (!row) return null

  const fields = [
    { label: 'Реквизиты', value: row.requisites },
    { label: 'Адрес', value: row.address },
    { label: 'Контактное лицо', value: row.contact },
    { label: 'Телефон', value: row.phone },
    { label: 'Баланс', value: row.balance },
  ]

  return (
    <div className="solution-counterparty">
      <Text className="solution-counterparty__title" colorToken={TextColor.primary}>
        {row.name}
      </Text>
      <dl className="solution-counterparty__fields">
        {fields.map((field) => (
          <div key={field.label} className="solution-counterparty__field">
            <Text.Caption
              className="solution-counterparty__label"
              colorToken={TextColor.secondary}
            >
              {field.label}
            </Text.Caption>
            <Text className="solution-counterparty__value" colorToken={TextColor.primary}>
              {field.value}
            </Text>
          </div>
        ))}
      </dl>
    </div>
  )
}

const PAYMENT_MATCHES = [
  {
    id: '1',
    title: 'ООО «Ромашка»',
    hint: 'Счёт №1043 · 2 августа',
    amount: '18 400 ₽',
  },
  {
    id: '2',
    title: 'ИП Козлова М.И.',
    hint: 'Заказ №2291 · 1 августа',
    amount: '12 200 ₽',
  },
  {
    id: '3',
    title: 'ООО «ТехноСнаб»',
    hint: 'Счёт №1039 · 31 июля',
    amount: '15 000 ₽',
  },
]

function SolutionFeaturePanel({
  item,
  searchCounterparty,
  setSearchCounterparty,
  workStarted,
  onToggleWork,
}: {
  item: SolutionItem
  searchCounterparty?: ISelectOption | undefined
  setSearchCounterparty?: (v: ISelectOption | undefined) => void
  workStarted: boolean
  onToggleWork: () => void
}) {
  if (item.body === 'payments') {
    return (
      <div className="solution-feature">
        <Text.H4 className="solution-feature__title">Неразнесённые платежи</Text.H4>
        <Text.Caption className="solution-feature__subtitle" colorToken={TextColor.secondary}>
          3 платежа на 45 600 ₽ ожидают привязки к заказам и счетам
        </Text.Caption>
        <ul className="solution-feature__list">
          {PAYMENT_MATCHES.map((row) => (
            <li key={row.id} className="solution-feature__row">
              <div className="solution-feature__row-main">
                <Text className="solution-feature__row-title" colorToken={TextColor.primary}>
                  {row.title}
                </Text>
                <Text.Caption colorToken={TextColor.secondary}>{row.hint}</Text.Caption>
              </div>
              <Text className="solution-feature__row-amount" colorToken={TextColor.primary}>
                {row.amount}
              </Text>
            </li>
          ))}
        </ul>
        <div className="solution-feature__actions">
          <Button size={ButtonSize.L} variant={ButtonVariants.PRIMARY}>
            Привязать автоматически
          </Button>
          <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS}>
            Открыть все платежи
          </Button>
        </div>
      </div>
    )
  }

  if (item.body === 'search') {
    return (
      <div className="solution-feature">
        <Text.H4 className="solution-feature__title">Поиск контрагента</Text.H4>
        <Text.Caption className="solution-feature__subtitle" colorToken={TextColor.secondary}>
          Найдите контрагента по названию, ИНН или контактам и подставьте в документ
        </Text.Caption>
        <CounterpartySearchSelect
          value={searchCounterparty}
          onChange={setSearchCounterparty}
          className="solution-feature__search"
          fullWidth
        />
        {searchCounterparty ? (
          <SolutionCounterpartyCard id={String(searchCounterparty.value)} />
        ) : (
          <Text.Caption colorToken={TextColor.secondary}>
            Выберите контрагента, чтобы посмотреть карточку.
          </Text.Caption>
        )}
      </div>
    )
  }

  if (item.body === 'time') {
    return (
      <div className="solution-feature">
        <Text.H4 className="solution-feature__title">Рабочий день</Text.H4>
        <div className="solution-feature__status">
          <Text colorToken={TextColor.primary}>
            Статус: {workStarted ? 'работаете с 09:00' : 'не работаете'}
          </Text>
          <Text.Caption colorToken={TextColor.secondary}>
            Сегодня: {workStarted ? '3 ч 12 мин' : '0 ч 00 мин'}
          </Text.Caption>
        </div>
        <div className="solution-feature__actions">
          <Button
            size={ButtonSize.L}
            variant={workStarted ? ButtonVariants.ADDITIONAL : ButtonVariants.ACCENT}
            className={workStarted ? undefined : 'sol-card__time-btn'}
            onClick={onToggleWork}
          >
            {!workStarted ? <Play12Icon /> : null}
            {workStarted ? 'Завершить рабочий день' : 'Начать рабочий день'}
          </Button>
        </div>
        <ul className="solution-feature__list">
          <li className="solution-feature__row">
            <div className="solution-feature__row-main">
              <Text className="solution-feature__row-title" colorToken={TextColor.primary}>
                Вчера
              </Text>
              <Text.Caption colorToken={TextColor.secondary}>09:02 — 18:11</Text.Caption>
            </div>
            <Text className="solution-feature__row-amount" colorToken={TextColor.primary}>
              8 ч 09 мин
            </Text>
          </li>
          <li className="solution-feature__row">
            <div className="solution-feature__row-main">
              <Text className="solution-feature__row-title" colorToken={TextColor.primary}>
                1 августа
              </Text>
              <Text.Caption colorToken={TextColor.secondary}>10:15 — 17:40</Text.Caption>
            </div>
            <Text className="solution-feature__row-amount" colorToken={TextColor.primary}>
              7 ч 25 мин
            </Text>
          </li>
        </ul>
      </div>
    )
  }

  return null
}

function SolutionBody({
  item,
  searchCounterparty,
  setSearchCounterparty,
  onOpenSearchDetail,
  aiConfigured,
  debtReady,
  debtCounterparty,
  setDebtCounterparty,
  debtLimit,
  setDebtLimit,
  onSaveDebtLimit,
  workStarted,
  onToggleWork,
  paymentsBinding,
  paymentsLastAt,
  onBindPayments,
}: {
  item: SolutionItem
  searchCounterparty?: ISelectOption | undefined
  setSearchCounterparty?: (v: ISelectOption | undefined) => void
  onOpenSearchDetail?: () => void
  aiConfigured?: boolean
  debtReady?: boolean
  debtCounterparty?: ISelectOption | undefined
  setDebtCounterparty?: (v: ISelectOption | undefined) => void
  debtLimit?: string
  setDebtLimit?: (v: string) => void
  onSaveDebtLimit?: () => void
  workStarted?: boolean
  onToggleWork?: () => void
  paymentsBinding?: boolean
  paymentsLastAt?: string | null
  onBindPayments?: () => void
}) {
  const quickActions = getQuickActions(item, { aiConfigured })
  if (quickActions) {
    return (
      <ul className="sol-card__actions">
        {quickActions.map((label) => (
          <ActionLine key={label} label={label} />
        ))}
      </ul>
    )
  }

  switch (item.body) {
    case 'debt-settings':
      if (
        !debtReady ||
        !setDebtCounterparty ||
        debtLimit === undefined ||
        !setDebtLimit ||
        !onSaveDebtLimit
      ) {
        return null
      }
      return (
        <SolutionDebtLimitsForm
          counterparty={debtCounterparty}
          setCounterparty={setDebtCounterparty}
          limit={debtLimit}
          setLimit={setDebtLimit}
          onSave={onSaveDebtLimit}
          compact
        />
      )
    case 'payments':
      if (paymentsBinding) {
        return (
          <div className="sol-card__payments">
            <Spinner size={SpinnerSize.S} className="sol-card__payments-status">
              <Text colorToken={TextColor.primary}>Выполнение привязки</Text>
            </Spinner>
          </div>
        )
      }
      return (
        <div className="sol-card__payments">
          <Button
            size={ButtonSize.L}
            variant={ButtonVariants.ADDITIONAL}
            onClick={onBindPayments}
          >
            Привязать платежи
          </Button>
          {paymentsLastAt ? (
            <Text colorToken={TextColor.secondary}>Последняя в {paymentsLastAt}</Text>
          ) : null}
        </div>
      )
    case 'search':
      return (
        <div className="sol-card__search-row">
          <CounterpartySearchSelect
            value={searchCounterparty}
            onChange={setSearchCounterparty}
            className="sol-card__search"
          />
          <Button
            size={ButtonSize.L}
            variant={ButtonVariants.ADDITIONAL}
            disabled={!searchCounterparty}
            onClick={onOpenSearchDetail}
          >
            Перейти
          </Button>
        </div>
      )
    case 'time':
      return (
        <div className="sol-card__time">
          <Button
            size={ButtonSize.L}
            variant={ButtonVariants.ADDITIONAL}
            onClick={onToggleWork}
          >
            {!workStarted ? <Play12Icon /> : null}
            {workStarted ? 'Завершить' : 'Начать рабочий день'}
          </Button>
          <Text colorToken={TextColor.primary}>
            Статус: {workStarted ? 'работаете с 09:00' : 'не работаете'}
          </Text>
        </div>
      )
    default:
      return null
  }
}

function SortableSolutionRow({
  item,
  isPinned,
  onTogglePin,
  showDot,
  children,
}: {
  item: SolutionItem
  isPinned: boolean
  onTogglePin: () => void
  showDot?: boolean
  children?: ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !isPinned,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sol-card-sortable${isDragging ? ' sol-card-sortable--dragging' : ''}`}
    >
      <SolutionCard
        logo={item.logo}
        title={item.title}
        description={item.description}
        showDot={showDot ?? item.showDot}
        isEditing
        isPinned={isPinned}
        dragHandle={
          <button
            type="button"
            className="sol-card__drag"
            aria-label="Переместить"
            disabled={!isPinned}
            {...(isPinned ? { ...attributes, ...listeners } : {})}
          >
            <DragNDrop20Icon />
          </button>
        }
        pinControl={
          PINNING_ENABLED ? (
            <Button
              size={ButtonSize.L}
              variant={ButtonVariants.FRAMELESS}
              isIconButton
              aria-label={isPinned ? 'Открепить' : 'Закрепить'}
              aria-pressed={isPinned}
              className={isPinned ? 'sol-card__pin-btn is-active' : 'sol-card__pin-btn'}
              onClick={onTogglePin}
            >
              <AttachPin20Icon />
            </Button>
          ) : null
        }
      >
        {children}
      </SolutionCard>
    </div>
  )
}

export function SolutionsSidepage({
  isOpen,
  onClose,
  initialSegment = 'installed',
}: SolutionsSidepageProps) {
  const { showSnackbar } = useSnackbar()
  const [segment, setSegment] = useState<string | number>(initialSegment)
  const [searchCounterparty, setSearchCounterparty] = useState<ISelectOption | undefined>(undefined)
  const [workDayStarted, setWorkDayStarted] = useState(false)
  const [paymentsBinding, setPaymentsBinding] = useState(false)
  const [paymentsLastAt, setPaymentsLastAt] = useState<string | null>(null)
  const [setupCompletedIds, setSetupCompletedIds] = useState<SolutionId[]>([])
  const paymentsBindTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [setupLogin, setSetupLogin] = useState('')
  const [setupApi, setSetupApi] = useState('')
  const [aiEmployee, setAiEmployee] = useState<ISelectOption | undefined>(undefined)
  const [aiAccessUsers, setAiAccessUsers] = useState<AiAccessUser[]>([])
  const [isAiSettingsConfigured, setIsAiSettingsConfigured] = useState(false)
  const [debtCounterparty, setDebtCounterparty] = useState<ISelectOption | undefined>(undefined)
  const [debtLimitInput, setDebtLimitInput] = useState('')
  const [debtLimits, setDebtLimits] = useState<DebtLimitEntry[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [detailId, setDetailId] = useState<SolutionId | null>(null)
  const [detailTrialStarted, setDetailTrialStarted] = useState(false)

  const [orderBySegment, setOrderBySegment] = useState<Record<'installed' | 'recommended', SolutionId[]>>({
    installed: [...INSTALLED_IDS],
    recommended: [...RECOMMENDED_IDS],
  })
  /** После «Попробовать бесплатно» решение переходит в установленные. */
  const [segmentOverrides, setSegmentOverrides] = useState<
    Partial<Record<SolutionId, 'installed' | 'recommended'>>
  >({})
  /** Порядок закреплённых id (новые — в начало). Избранное скрыто, логика та же. */
  const [pinnedIds, setPinnedIds] = useState<SolutionId[]>([])
  const [favorites, setFavorites] = useState<SolutionId[]>([])

  const [draftOrder, setDraftOrder] = useState<SolutionId[]>([])
  const [draftPinned, setDraftPinned] = useState<SolutionId[]>([])
  const [draftFavorites, setDraftFavorites] = useState<SolutionId[]>([])

  const activeSegment = segment === 'recommended' ? 'recommended' : 'installed'
  const solutionsById = useMemo(() => new Map(SOLUTIONS.map((s) => [s.id, s])), [])

  const resolveSegment = (id: SolutionId): 'installed' | 'recommended' =>
    segmentOverrides[id] ?? solutionsById.get(id)?.segment ?? 'installed'

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
      setDetailId(null)
      setDetailTrialStarted(false)
      setSegmentOverrides({})
      setDraftOrder([])
      setDraftPinned([])
      setDraftFavorites([])
      setWorkDayStarted(false)
      setPaymentsBinding(false)
      setPaymentsLastAt(null)
      setSearchCounterparty(undefined)
      if (paymentsBindTimerRef.current) {
        clearTimeout(paymentsBindTimerRef.current)
        paymentsBindTimerRef.current = null
      }
      return
    }
    setSegment(initialSegment)
  }, [isOpen, initialSegment])

  useEffect(() => {
    return () => {
      if (paymentsBindTimerRef.current) {
        clearTimeout(paymentsBindTimerRef.current)
      }
    }
  }, [])

  const bindPayments = () => {
    if (paymentsBinding) return
    setPaymentsBinding(true)
    if (paymentsBindTimerRef.current) {
      clearTimeout(paymentsBindTimerRef.current)
    }
    paymentsBindTimerRef.current = setTimeout(() => {
      const time = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
      setPaymentsLastAt(time)
      setPaymentsBinding(false)
      paymentsBindTimerRef.current = null
    }, 5000)
  }

  const prevDetailIdRef = useRef<SolutionId | null>(null)

  useEffect(() => {
    if (!detailId) {
      setDetailTrialStarted(false)
      setSetupLogin('')
      setSetupApi('')
      setAiEmployee(undefined)
      setDebtCounterparty(undefined)
      setDebtLimitInput('')
      if (prevDetailIdRef.current === 'search') {
        setSearchCounterparty(undefined)
      }
    }
    prevDetailIdRef.current = detailId
  }, [detailId])

  const needsSetup = (id: SolutionId, showDot?: boolean) => {
    if (!showDot) return false
    if (id === 'ai-portrait') return !isAiSettingsConfigured
    return !setupCompletedIds.includes(id)
  }

  const completeSetup = () => {
    if (!detailId) return
    if (!setupLogin.trim() && !setupApi.trim()) return
    setSetupCompletedIds((prev) => (prev.includes(detailId) ? prev : [...prev, detailId]))
    setSetupLogin('')
    setSetupApi('')
  }

  const saveDebtLimit = () => {
    if (!debtCounterparty) return
    const digits = debtLimitInput.replace(/\D/g, '')
    if (!digits) return
    const counterpartyId = String(debtCounterparty.value)
    setDebtLimits((prev) => {
      const nextEntry: DebtLimitEntry = {
        id: counterpartyId,
        counterpartyId,
        counterpartyName: debtCounterparty.label,
        limit: digits,
      }
      const existingIndex = prev.findIndex((entry) => entry.counterpartyId === counterpartyId)
      if (existingIndex >= 0) {
        const next = [...prev]
        next[existingIndex] = nextEntry
        return next
      }
      return [...prev, nextEntry]
    })
    setDebtCounterparty(undefined)
    setDebtLimitInput('')
  }

  const removeDebtLimit = (id: string) => {
    setDebtLimits((prev) => prev.filter((entry) => entry.id !== id))
  }

  const detailSolution = detailId ? solutionsById.get(detailId) ?? null : null

  const detailTrialEndsLabel = useMemo(() => {
    if (!detailSolution) return ''
    const date = new Date()
    date.setDate(date.getDate() + (detailSolution.trialDays ?? 7))
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }, [detailSolution])

  const nextChargeLabel = useMemo(() => {
    if (!detailSolution) return ''
    const date = new Date()
    date.setDate(date.getDate() + 2)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [detailSolution])

  const isDetailRecommended =
    Boolean(detailSolution) && resolveSegment(detailSolution!.id) === 'recommended'
  const showDetailTrialOffer = isDetailRecommended && !detailTrialStarted
  const showDetailTrialActive = detailTrialStarted
  const showDetailInstalledSub =
    Boolean(detailSolution) &&
    resolveSegment(detailSolution!.id) === 'installed' &&
    !detailTrialStarted
  const detailQuickActions = detailSolution
    ? getQuickActions(detailSolution, { aiConfigured: isAiSettingsConfigured })
    : null
  const showDetailFeature =
    Boolean(detailSolution) && hasFeaturePanel(detailSolution!) && !showDetailTrialOffer
  const showDetailSetup =
    Boolean(detailSolution) &&
    detailSolution!.body !== 'ai-settings' &&
    needsSetup(detailSolution!.id, detailSolution!.showDot)
  const showDetailAiSettings =
    Boolean(detailSolution) && detailSolution!.body === 'ai-settings' && !showDetailTrialOffer
  const showDetailDebtSettings =
    Boolean(detailSolution) &&
    detailSolution!.body === 'debt-settings' &&
    !needsSetup(detailSolution!.id, detailSolution!.showDot) &&
    !showDetailTrialOffer

  /**
   * Изоляция скролла:
   * — курсор над сайдпейджем → крутится только он;
   * — редактирование списка блокирует страницу;
   * — остальные сайдпейджи неблокирующие.
   */
  useEffect(() => {
    if (!isOpen && !isEditing && !detailId) return

    const onWheel = (event: WheelEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      if (isEditing) {
        const editingSidepage = target.closest('.solutions-sidepage--editing')
        if (!editingSidepage) {
          event.preventDefault()
          return
        }

        const scrollEl = editingSidepage.querySelector(':scope > div:last-child')
        if (!(scrollEl instanceof HTMLElement)) {
          event.preventDefault()
          return
        }

        event.preventDefault()
        let delta = event.deltaY
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 16
        else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= scrollEl.clientHeight
        scrollEl.scrollTop += delta
        return
      }

      const sidepage = target.closest('.solutions-sidepage')
      if (!sidepage) return

      const scrollEl = sidepage.querySelector(':scope > div:last-child')
      if (!(scrollEl instanceof HTMLElement)) {
        event.preventDefault()
        return
      }

      event.preventDefault()

      let delta = event.deltaY
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        delta *= 16
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        delta *= scrollEl.clientHeight
      }

      scrollEl.scrollTop += delta
    }

    document.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => {
      document.removeEventListener('wheel', onWheel, true)
    }
  }, [isOpen, isEditing, detailId])

  const listVisibleIds = useMemo(() => {
    const segmentOrder = orderBySegment[activeSegment].filter(
      (id) => resolveSegment(id) === activeSegment,
    )
    const pinSet = new Set(pinnedIds)
    const pinnedOrdered = pinnedIds.filter((id) => segmentOrder.includes(id))
    const rest = segmentOrder.filter((id) => !pinSet.has(id))
    return [...pinnedOrdered, ...rest]
  }, [activeSegment, orderBySegment, pinnedIds, segmentOverrides, solutionsById])

  const editVisibleIds = useMemo(() => {
    const segmentOrder = draftOrder.filter((id) => resolveSegment(id) === activeSegment)
    const pinSet = new Set(draftPinned)
    const pinnedOrdered = draftPinned.filter((id) => segmentOrder.includes(id))
    const rest = segmentOrder.filter((id) => !pinSet.has(id))
    return [...pinnedOrdered, ...rest]
  }, [activeSegment, draftOrder, draftPinned, segmentOverrides, solutionsById])

  const cancelEdit = () => {
    setIsEditing(false)
    setDraftOrder([])
    setDraftPinned([])
    setDraftFavorites([])
  }

  const restoreDefaults = () => {
    const defaults = SOLUTIONS.filter((s) => resolveSegment(s.id) === activeSegment).map(
      (s) => s.id,
    )
    setDraftPinned([])
    setDraftOrder(defaults)
  }

  const hasSavedPins = pinnedIds.some((id) => resolveSegment(id) === activeSegment)

  const saveEdit = () => {
    const otherSegment = activeSegment === 'installed' ? 'recommended' : 'installed'
    const otherPinned = pinnedIds.filter((id) => resolveSegment(id) === otherSegment)

    setOrderBySegment((prev) => ({
      ...prev,
      [activeSegment]: [...draftOrder],
    }))
    setPinnedIds([...draftPinned, ...otherPinned])

    if (FAVORITES_ENABLED) {
      const otherFavs = favorites.filter((id) => resolveSegment(id) === otherSegment)
      setFavorites([...draftFavorites, ...otherFavs])
    }

    setIsEditing(false)
    setDraftOrder([])
    setDraftPinned([])
    setDraftFavorites([])
  }

  const startDetailTrial = () => {
    if (!detailId) return
    setDetailTrialStarted(true)
    setSegmentOverrides((prev) => ({ ...prev, [detailId]: 'installed' }))
    setOrderBySegment((prev) => ({
      installed: prev.installed.includes(detailId)
        ? prev.installed
        : [...prev.installed, detailId],
      recommended: prev.recommended.filter((id) => id !== detailId),
    }))
  }

  const togglePin = (id: SolutionId) => {
    setDraftPinned((prevPinned) => {
      const nextPinned = prevPinned.includes(id)
        ? prevPinned.filter((x) => x !== id)
        : [id, ...prevPinned]

      setDraftOrder((order) => {
        const pinSet = new Set(nextPinned)
        const rest = order.filter((x) => !pinSet.has(x))
        const pinnedInOrder = nextPinned.filter((p) => order.includes(p) || p === id)
        return [...pinnedInOrder, ...rest]
      })

      return nextPinned
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as SolutionId
    const overId = over.id as SolutionId
    if (!draftPinned.includes(activeId) || !draftPinned.includes(overId)) return

    setDraftPinned((items) => {
      const oldIndex = items.indexOf(activeId)
      const newIndex = items.indexOf(overId)
      if (oldIndex < 0 || newIndex < 0) return items
      const nextPinned = arrayMove(items, oldIndex, newIndex)

      setDraftOrder((order) => {
        const pinSet = new Set(nextPinned)
        const rest = order.filter((x) => !pinSet.has(x))
        return [...nextPinned, ...rest]
      })

      return nextPinned
    })
  }

  const listPinnedSet = new Set(pinnedIds)
  const draftPinnedSet = new Set(draftPinned)

  return (
    <>
      <Sidepage
        isOpen={isOpen}
        onClose={onClose}
        width={500}
        mode={SidepageMode.Fixed}
        withBackdrop={false}
        disableOverflowControl
        isBackLayer={isEditing || Boolean(detailSolution)}
        showShadow
        zIndex={100}
        className="solutions-sidepage"
      >
        <SidepageHeader className="solutions-sidepage__header">
          <div className="solutions-sidepage__title-row">
            <div className="solutions-sidepage__title">
              <Text.H2>Решения</Text.H2>
            </div>
            <div className="solutions-sidepage__top-actions">
              <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS}>
                <MyApps20Icon />
                Мои решения
              </Button>
              <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS}>
                <Applications20Icon />
                Каталог
              </Button>
            </div>
          </div>
        </SidepageHeader>

        <SidepageContent className="solutions-sidepage__content">
          <div className="solutions-sidepage__list">
            {listVisibleIds.map((id) => {
              const item = solutionsById.get(id)
              if (!item) return null
              return (
                <SolutionCard
                  key={id}
                  logo={item.logo}
                  title={item.title}
                  description={
                    resolveSegment(item.id) === 'recommended' ? item.description : undefined
                  }
                  showDot={needsSetup(item.id, item.showDot)}
                  isPinned={listPinnedSet.has(id)}
                  onClick={
                    NON_INTERACTIVE_IDS.has(item.id)
                      ? undefined
                      : () => {
                          showSnackbar({
                            message:
                              resolveSegment(item.id) === 'recommended'
                                ? 'Переход на страницу решения'
                                : 'Открытие айфрейма решения',
                            anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                          })
                        }
                  }
                >
                  {item.body ? (
                    <SolutionBody
                      item={item}
                      searchCounterparty={searchCounterparty}
                      setSearchCounterparty={setSearchCounterparty}
                      onOpenSearchDetail={() => setDetailId('search')}
                      aiConfigured={isAiSettingsConfigured}
                      debtReady={!needsSetup(item.id, item.showDot)}
                      debtCounterparty={debtCounterparty}
                      setDebtCounterparty={setDebtCounterparty}
                      debtLimit={debtLimitInput}
                      setDebtLimit={setDebtLimitInput}
                      onSaveDebtLimit={saveDebtLimit}
                      workStarted={workDayStarted}
                      onToggleWork={() => setWorkDayStarted((v) => !v)}
                      paymentsBinding={paymentsBinding}
                      paymentsLastAt={paymentsLastAt}
                      onBindPayments={bindPayments}
                    />
                  ) : null}
                </SolutionCard>
              )
            })}
            {listVisibleIds.length === 0 ? (
              <div className="solutions-sidepage__empty">
                <Text colorToken={TextColor.secondary}>В этом разделе пока нет решений.</Text>
              </div>
            ) : null}
          </div>
        </SidepageContent>
      </Sidepage>

      <Sidepage
        isOpen={Boolean(detailSolution)}
        onClose={() => setDetailId(null)}
        width={500}
        mode={SidepageMode.Fixed}
        withBackdrop={false}
        disableOverflowControl
        showShadow
        zIndex={120}
        className="solutions-sidepage solutions-sidepage--detail"
      >
        {detailSolution ? (
          <SidepageContent className="solutions-sidepage__content solution-detail">
            <div className="solution-detail__top">
              <img
                className="solution-detail__logo"
                src={detailSolution.logo}
                alt=""
                width={32}
                height={32}
              />
              <div className="solution-detail__info">
                <Text.H3 className="solution-detail__title">{detailSolution.title}</Text.H3>
                {isDetailRecommended && detailSolution.description ? (
                  <Text className="solution-detail__desc" colorToken={TextColor.primary}>
                    {detailSolution.description}
                  </Text>
                ) : null}
                {!showDetailTrialOffer ? null : (
                  <div className="solution-detail__cta">
                    <div className="solution-detail__actions">
                      <Button
                        size={ButtonSize.L}
                        variant={ButtonVariants.ADDITIONAL}
                        onClick={startDetailTrial}
                      >
                        Попробовать бесплатно на {detailSolution.trialDays ?? 7} дней
                      </Button>
                      <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS}>
                        О решении
                      </Button>
                    </div>
                    <Text.Caption className="solution-detail__note" colorToken={TextColor.primary}>
                      После окончания пробного периода, подписка приостановится. Деньги не спишутся
                      пока вы не продлите подписку.
                      <br />
                      Стоимость от {detailSolution.priceFrom ?? 1000} ₽ в месяц
                    </Text.Caption>
                  </div>
                )}
              </div>
            </div>
            {showDetailTrialActive ? (
              <div className="solution-subscription">
                <div className="solution-subscription__header">
                  <Text.H4 className="solution-subscription__title">Подписка</Text.H4>
                  <Badge label="Активно" variant="green" />
                </div>
                <Text.Caption className="solution-subscription__text">
                  Вы на пробном периоде до {detailTrialEndsLabel}. Далее подписка приостановится.
                  При оплате сейчас оставшиеся дни пробного периода прибавятся к вашей подписке.
                </Text.Caption>
                <div className="solution-subscription__actions">
                  <Button size={ButtonSize.L} variant={ButtonVariants.ADDITIONAL}>
                    Изменить подписку
                  </Button>
                  <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS}>
                    Перейти в решение
                  </Button>
                </div>
              </div>
            ) : null}
            {showDetailInstalledSub ? (
              <div className="solution-subscription">
                <div className="solution-subscription__header">
                  <Text.H4 className="solution-subscription__title">Подписка</Text.H4>
                  <Badge label="Активно" variant="green" />
                  {needsSetup(detailSolution.id, detailSolution.showDot) ? (
                    <Badge label="Требуется настройка" variant="red" />
                  ) : null}
                </div>
                <div className="solution-subscription__meta">
                  <div className="solution-subscription__field">
                    <Text.Caption
                      className="solution-subscription__label"
                      colorToken={TextColor.secondary}
                    >
                      Стоимость
                    </Text.Caption>
                    <Text className="solution-subscription__value" colorToken={TextColor.primary}>
                      {detailSolution.priceFrom ?? 1000} ₽ за месяц
                    </Text>
                  </div>
                  <div className="solution-subscription__field solution-subscription__field--grow">
                    <div className="solution-subscription__label-row">
                      <Text.Caption
                        className="solution-subscription__label"
                        colorToken={TextColor.secondary}
                      >
                        Автопродление
                      </Text.Caption>
                      <Help
                        popup="Автоматическое продление подписки и списание средств"
                        size={HelpSize.S}
                        zIndex={400}
                      />
                    </div>
                    <div className="solution-subscription__value-row">
                      <TruncatedTextHint
                        text={`Отключено, приостановится ${nextChargeLabel}`}
                        className="solution-subscription__value"
                        triggerClassName="solution-subscription__value-trigger"
                      />
                      <Down12Icon className="solution-subscription__chevron" />
                    </div>
                  </div>
                </div>
                <div className="solution-subscription__actions">
                  <Button size={ButtonSize.L} variant={ButtonVariants.ADDITIONAL}>
                    Изменить подписку
                  </Button>
                  <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS}>
                    Перейти в решение
                  </Button>
                </div>
              </div>
            ) : null}
            {detailQuickActions ? (
              <div className="solution-quick-actions">
                <Text.H4 className="solution-quick-actions__title">Быстрые действия</Text.H4>
                <ul className="solution-quick-actions__list">
                  {detailQuickActions.map((label) => (
                    <ActionLine key={label} label={label} />
                  ))}
                </ul>
              </div>
            ) : null}
            {showDetailSetup ? (
              <div className="solution-setup">
                <div className="solution-setup__header">
                  <div className="solution-setup__title-row">
                    <Text.H4 className="solution-setup__title">Настройка решения</Text.H4>
                    <Link
                      href="#"
                      className="solution-setup__manual"
                      onClick={(e) => e.preventDefault()}
                    >
                      Инструкция
                    </Link>
                  </div>
                  <Text className="solution-setup__subtitle" colorToken={TextColor.secondary}>
                    Интеграция сервиса с МоимСкладом
                  </Text>
                </div>
                <div className="solution-setup__fields">
                  <Input
                    name="solution-setup-login"
                    label="Логин"
                    value={setupLogin}
                    onChange={(e) => setSetupLogin(e.target.value)}
                    inputSize="M"
                  />
                  <Input
                    name="solution-setup-api"
                    label="API"
                    value={setupApi}
                    onChange={(e) => setSetupApi(e.target.value)}
                    inputSize="M"
                  />
                </div>
                <div className="solution-setup__actions">
                  <Button
                    size={ButtonSize.L}
                    variant={ButtonVariants.PRIMARY}
                    disabled={!setupLogin.trim() && !setupApi.trim()}
                    onClick={completeSetup}
                  >
                    Войти
                  </Button>
                </div>
              </div>
            ) : null}
            {showDetailAiSettings ? (
              <SolutionAiSettingsPanel
                employee={aiEmployee}
                setEmployee={setAiEmployee}
                users={aiAccessUsers}
                setUsers={setAiAccessUsers}
                onSave={setIsAiSettingsConfigured}
              />
            ) : null}
            {showDetailDebtSettings ? (
              <SolutionDebtSettingsPanel
                counterparty={debtCounterparty}
                setCounterparty={setDebtCounterparty}
                limit={debtLimitInput}
                setLimit={setDebtLimitInput}
                entries={debtLimits}
                onSave={saveDebtLimit}
                onRemove={removeDebtLimit}
              />
            ) : null}
            {showDetailFeature && detailSolution ? (
              <SolutionFeaturePanel
                item={detailSolution}
                searchCounterparty={searchCounterparty}
                setSearchCounterparty={setSearchCounterparty}
                workStarted={workDayStarted}
                onToggleWork={() => setWorkDayStarted((v) => !v)}
              />
            ) : null}
          </SidepageContent>
        ) : null}
      </Sidepage>

      <Sidepage
        isOpen={isEditing}
        onClose={cancelEdit}
        width={500}
        mode={SidepageMode.Fixed}
        withBackdrop
        closeOnBackdropClick
        showShadow
        zIndex={110}
        className="solutions-sidepage solutions-sidepage--editing"
      >
        <SidepageHeader className="solutions-sidepage__header">
          <div className="solutions-sidepage__title-row">
            <div className="solutions-sidepage__title">
              <Text.H2>Редактирование списка</Text.H2>
            </div>
          </div>
        </SidepageHeader>

        <SidepageContent className="solutions-sidepage__content">
          <div className="solutions-sidepage__list">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={editVisibleIds} strategy={verticalListSortingStrategy}>
                {editVisibleIds.map((id) => {
                  const item = solutionsById.get(id)
                  if (!item) return null
                  return (
                    <SortableSolutionRow
                      key={id}
                      item={item}
                      isPinned={draftPinnedSet.has(id)}
                      onTogglePin={() => togglePin(id)}
                      showDot={needsSetup(item.id, item.showDot)}
                    />
                  )
                })}
              </SortableContext>
            </DndContext>
          </div>
        </SidepageContent>

        <SidepageFooter className="solutions-sidepage__edit-footer">
          <div className="solutions-sidepage__edit-actions">
            <Button size={ButtonSize.L} variant={ButtonVariants.PRIMARY} onClick={saveEdit}>
              Сохранить
            </Button>
            {hasSavedPins ? (
              <Button
                size={ButtonSize.L}
                variant={ButtonVariants.FRAMELESS}
                onClick={restoreDefaults}
              >
                <TurnBackward20Icon />
                Вернуть по умолчанию
              </Button>
            ) : (
              <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS} onClick={cancelEdit}>
                Отмена
              </Button>
            )}
          </div>
        </SidepageFooter>
      </Sidepage>
    </>
  )
}

export default SolutionsSidepage
