import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Add20Icon,
  Applications20Icon,
  Button,
  ButtonSize,
  ButtonVariants,
  Checkbox,
  Date12Icon,
  Date20Icon,
  Delete12Icon,
  Dot,
  DotColor,
  Down12Icon,
  Edit12Icon,
  Help,
  HelpSize,
  Hint,
  LabelValueDate,
  LabelValueSelect,
  Link,
  Listing,
  Print20Icon,
  RemoveClose12Icon,
  Send20Icon,
  Still20Icon,
  Text,
  TextColor,
  Turnover20Icon,
  ViewersStack,
  type ISelectOption,
} from '@moysklad/uikit'
import './CustomerOrderPage.css'
import { asset } from '../assets'
import { SolutionsSidepage } from '../components/SolutionsSidepage'
import { SolutionsSidepageV2 } from '../components/SolutionsSidepageV2'
import chromeLogo from '../assets/icons/header/logo-main.svg'
import chromeApplications from '../assets/icons/header/applications-20.svg'
import chromeEvents from '../assets/icons/header/events-20.svg'
import chromeSupport from '../assets/icons/header/support-20.svg'
import navCrm from '../assets/icons/header/nav-crm.svg'
import navGoods from '../assets/icons/header/nav-goods.svg'
import navIndicators from '../assets/icons/header/nav-indicators.svg'
import navManufacture from '../assets/icons/header/nav-manufacture.svg'
import navMoney from '../assets/icons/header/nav-money.svg'
import navProcurement from '../assets/icons/header/nav-procurement.svg'
import navRetail from '../assets/icons/header/nav-retail.svg'
import navSelling from '../assets/icons/header/nav-selling.svg'
import chromeNewspaper from '../assets/icons/header/newspaper-20.svg'
import chromeTasks from '../assets/icons/header/task-20.svg'
import chromeNotifications from '../assets/icons/header/notifications-20.svg'
import futureSolutionSetup from '../assets/icons/header/future-solution-setup.png'
import futureSolutionLogo from '../assets/icons/header/future-solution-logo.png'
import futureSolutionAlert from '../assets/icons/header/future-solution-alert.png'

const navItems: Array<{
  label: string
  icon: string
  iconName: string
  width: number
  active?: boolean
}> = [
  { label: 'Моя компания', icon: navIndicators, iconName: 'indicators', width: 90 },
  { label: 'Закупки', icon: navProcurement, iconName: 'procurement', width: 60 },
  { label: 'Продажи', icon: navSelling, iconName: 'selling', width: 68, active: true },
  { label: 'Товары', icon: navGoods, iconName: 'goods', width: 60 },
  { label: 'CRM', icon: navCrm, iconName: 'crm', width: 60 },
  { label: 'Склад', icon: navMoney, iconName: 'money', width: 60 },
  { label: 'Деньги', icon: navMoney, iconName: 'money', width: 60 },
  { label: 'Розница', icon: navRetail, iconName: 'retail', width: 68 },
  { label: 'Онлайн-торговля', icon: navManufacture, iconName: 'manufacture', width: 106 },
  { label: 'Производство', icon: navManufacture, iconName: 'manufacture', width: 98 },
]

// Блок аккаунта живёт на остатке: место под чаты и решения резервируем сразу
// по раскрытому состоянию (144 + полоска + 144), чтобы раскрытие его не двигало.
const LOGO_WIDTH = 58
const NAV_WIDTH = LOGO_WIDTH + navItems.reduce((sum, item) => sum + item.width, 0)
const CENTER_PADDING = 8
const CENTER_EXPANDED_WIDTH = 144 + 1 + 144
// Вариант 2: слоты остаются по 48px, раскрытие выходит за них — чатам нужно
// 240px слева (5 кнопок), решениям 255px справа
const CENTER_COLLAPSED_WIDTH = 48 + 1 + 48
const FUTURE_CHATS_WIDTH = 5 * 48
const FUTURE_CHATS_OPEN_WIDTH = 6 * 48
const FUTURE_SOLUTIONS_OPEN_WIDTH = 48 + 255
const CENTER_FUTURE_WIDTH = CENTER_COLLAPSED_WIDTH + 2 * FUTURE_CHATS_WIDTH
// Вариант «2 без фикс»: раскрывается один блок за раз, место резервируем под больший
const CENTER_FUTURE_FLOW_WIDTH =
  Math.max(FUTURE_CHATS_OPEN_WIDTH, FUTURE_SOLUTIONS_OPEN_WIDTH) + 1 + 48
const HELP_WIDTH = 44
// Аватар со стрелкой и отступами — меньше блок аккаунта не становится
const USER_COMPACT_WIDTH = 71
const USER_TEXT_MIN_WIDTH = 32
const USER_MAX_WIDTH = 180

// Сколько остаётся блоку аккаунта при текущей ширине хедера
function userSpaceFor(headerWidth: number, centerWidth: number) {
  return headerWidth - NAV_WIDTH - CENTER_PADDING - centerWidth - HELP_WIDTH
}

// Задержка хинтов в шапке, чтобы они не мелькали при проведении курсором, секунды
const HINT_DELAY = 0.8

type HeaderVariant = 0 | 1 | 2 | 3 | 4 | 5

const headerVariants: Array<{ id: HeaderVariant; label: string }> = [
  { id: 0, label: '0 база' },
  { id: 1, label: '1 фикс' },
  { id: 2, label: '2 много' },
  { id: 5, label: '2 без фикс' },
  { id: 3, label: '3 справа' },
  { id: 4, label: '4 слева' },
]

const subnavItems = [
  'Заказы покупателей',
  'Счета покупателей',
  'Отгрузки',
  'Отчеты комиссионера',
  'Возвраты покупателей',
  'Счета-фактуры выданные',
  'Прибыльность',
  'Товары на реализации',
  'Воронка продаж',
]

const opt = (label: string, value = label): ISelectOption => ({ label, value })

type FieldSelectProps = {
  label: string
  value?: ISelectOption
  options: ISelectOption[]
  onChange: (v: ISelectOption) => void
  required?: boolean
  placeholder?: string
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
  required,
  placeholder,
}: FieldSelectProps) {
  return (
    <LabelValueSelect
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      disableSearch
    />
  )
}

/** Editable label-value as in params panel (value + edit icon). */
function EditableValue({
  label,
  value,
  help,
}: {
  label: string
  value: string
  help?: string
}) {
  return (
    <div className="lv">
      <div className="lv__label">
        <span>{label}</span>
        {help ? <Help popup={help} size={HelpSize.S} /> : null}
      </div>
      <div className="lv__value">
        <span className="lv__text">{value}</span>
        <Edit12Icon />
      </div>
    </div>
  )
}

export function CustomerOrderPage() {
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>(0)
  const [subnav, setSubnav] = useState(subnavItems[0])
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [solutionsSegment, setSolutionsSegment] = useState<'installed' | 'recommended'>(
    'installed',
  )
  const [solutionsTipOpen, setSolutionsTipOpen] = useState(false)
  const [solutionsV2Open, setSolutionsV2Open] = useState(false)
  const [chatsOpen, setChatsOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  // Вариант 1: блоки всегда открыты, но полоски тянутся на всю высоту
  // только при наведении на кнопки внутри соответствующего блока
  const [hoveredGroup, setHoveredGroup] = useState<'chats' | 'solutions' | null>(null)
  const [compactUser, setCompactUser] = useState(false)
  const [userWidth, setUserWidth] = useState(USER_MAX_WIDTH)
  const [canExpand, setCanExpand] = useState(true)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = headerRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      const centerWidth =
        headerVariant === 2
          ? CENTER_FUTURE_WIDTH
          : headerVariant === 5
            ? CENTER_FUTURE_FLOW_WIDTH
            : CENTER_EXPANDED_WIDTH
      const space = userSpaceFor(entry.contentRect.width, centerWidth)
      // В «2 без фикс» место под аккаунт считаем по текущему раскрытию — блок может сдвигаться
      const actualCenter =
        headerVariant === 5
          ? chatsOpen
            ? FUTURE_CHATS_OPEN_WIDTH + 1 + 48
            : catalogOpen
              ? 48 + 1 + FUTURE_SOLUTIONS_OPEN_WIDTH
              : CENTER_COLLAPSED_WIDTH
          : centerWidth
      const actualSpace = userSpaceFor(entry.contentRect.width, actualCenter)
      const width = Math.min(
        USER_MAX_WIDTH,
        Math.max(USER_COMPACT_WIDTH, headerVariant === 5 ? actualSpace : space),
      )
      setUserWidth(width)
      setCompactUser(
        (headerVariant === 5 ? actualSpace : space) <
          USER_COMPACT_WIDTH + USER_TEXT_MIN_WIDTH,
      )
      // Раскрытому центральному блоку места не хватает — не раскрываем его вовсе.
      // В варианте 2 раскрытие выезжает из центра, поэтому считаем запас по краям
      if (headerVariant === 2) {
        const center =
          entry.contentRect.width - NAV_WIDTH - CENTER_PADDING - HELP_WIDTH - width
        setCanExpand((center - CENTER_COLLAPSED_WIDTH) / 2 >= FUTURE_CHATS_WIDTH)
      } else {
        setCanExpand(space >= USER_COMPACT_WIDTH)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [headerVariant, chatsOpen, catalogOpen])

  useEffect(() => {
    if (canExpand) return
    setChatsOpen(false)
    setCatalogOpen(false)
  }, [canExpand])

  const showFutureChrome = headerVariant === 2 || headerVariant === 5
  const chatsExpanded = headerVariant === 1 || chatsOpen
  const solutionsExpanded = headerVariant === 1 || catalogOpen
  const futureExpanded = showFutureChrome && catalogOpen
  const futureChatsExpanded = showFutureChrome && chatsOpen
  const chatsHovered = headerVariant === 1 && hoveredGroup === 'chats'
  const solutionsHovered = headerVariant === 1 && hoveredGroup === 'solutions'

  const openSolutions = (segment: 'installed' | 'recommended' = 'installed') => {
    setSolutionsSegment(segment)
    setSolutionsOpen(true)
  }
  const [reserve, setReserve] = useState(true)
  const [posted, setPosted] = useState(true)
  const [blacklist, setBlacklist] = useState(false)

  const [counterparty, setCounterparty] = useState(opt('ИП Ромашкины сказки'))
  const [org, setOrg] = useState(opt('ООО «Золотая нить»'))
  const [shipDate, setShipDate] = useState<Date | null>(null)
  const [contract, setContract] = useState<ISelectOption | undefined>(undefined)
  const [warehouse, setWarehouse] = useState(opt('Склад на Фрунзенской'))
  const [project, setProject] = useState<ISelectOption | undefined>(undefined)
  const [vat, setVat] = useState(opt('Цена не включает НДС'))
  const [access, setAccess] = useState(opt('Морозов С.В., Основной'))
  const [leadSource, setLeadSource] = useState(
    opt('Ретаргетинг ВБ в Яндексе поиске'),
  )

  const counterparties = useMemo(
    () => [opt('ИП Ромашкины сказки'), opt('ООО «Север»')],
    [],
  )
  const orgs = useMemo(() => [opt('ООО «Золотая нить»'), opt('ИП Петров')], [])
  const warehouses = useMemo(
    () => [opt('Склад на Фрунзенской'), opt('Основной склад')],
    [],
  )
  const contracts = useMemo(
    () => [opt('Основной договор'), opt('Договор поставки')],
    [],
  )
  const projects = useMemo(() => [opt('Маркетплейсы'), opt('Розница')], [])
  const vatOptions = useMemo(
    () => [opt('Цена не включает НДС'), opt('Цена включает НДС'), opt('Без НДС')],
    [],
  )
  const accessOptions = useMemo(
    () => [opt('Морозов С.В., Основной'), opt('Общий')],
    [],
  )
  const leadSources = useMemo(
    () => [
      opt('Ретаргетинг ВБ в Яндексе поиске'),
      opt('Реклама'),
      opt('Рекомендация'),
    ],
    [],
  )

  const viewers = useMemo(
    () => [
      { id: '1', label: 'А' },
      { id: '2', label: 'Морозов С.В.', image: asset('/mock/avatar.svg') },
      { id: '3', label: 'Петрова' },
      { id: '4', label: 'Сидоров' },
      { id: '5', label: 'Козлова' },
      { id: '6', label: 'Орлов' },
    ],
    [],
  )

  return (
    <div className={`order-page order-page--header-variant-${headerVariant}`}>
      <nav className="header-variant-menu" aria-label="Варианты шапки">
        {headerVariants.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`header-variant-menu__button${
              headerVariant === id ? ' is-active' : ''
            }`}
            aria-label={`Вариант ${label}`}
            aria-pressed={headerVariant === id}
            onClick={() => {
              setHeaderVariant(id)
              setChatsOpen(false)
              setCatalogOpen(false)
              setHoveredGroup(null)
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <header className="top-chrome" ref={headerRef}>
        <div className="top-chrome__left">
          <div className="top-chrome__logo">
            <img src={chromeLogo} alt="" width={25} height={19} />
          </div>
          <nav className="top-chrome__nav" aria-label="Основное меню">
            {navItems.map(({ label, icon, iconName, width, active }) => (
              <Hint
                key={label}
                placement="bottom"
                overlay={label}
                mouseEnterDelay={HINT_DELAY}
              >
                <button
                  type="button"
                  className={`top-chrome__nav-item${active ? ' is-active' : ''}`}
                  style={{ width }}
                >
                  <span className="top-chrome__nav-icon">
                    <img className={`top-chrome__nav-ico--${iconName}`} src={icon} alt="" />
                  </span>
                  <span>{label}</span>
                </button>
              </Hint>
            ))}
          </nav>
        </div>
        <div className="top-chrome__right">
          <div className="top-chrome__center">
            <div
              className={`chrome-group chrome-group--chats${
                chatsExpanded ? ' is-open' : ''
              }${futureChatsExpanded ? ' is-future-open' : ''}${
                chatsHovered ? ' is-hovered' : ''
              }`}
              onMouseOver={() => {
                if (headerVariant === 1) setHoveredGroup('chats')
              }}
              onFocusCapture={() => {
                if (headerVariant === 1) setHoveredGroup('chats')
              }}
              onMouseLeave={() => {
                setHoveredGroup(null)
                setChatsOpen(false)
              }}
            >
              <span className="chrome-group__edge" aria-hidden="true" />
              <Hint placement="bottom" overlay="Задачи" mouseEnterDelay={HINT_DELAY}>
                <button
                  type="button"
                  className="chrome-btn chrome-btn--extra chrome-btn--chats-1"
                  aria-label="Задачи"
                  aria-hidden={showFutureChrome || !chatsExpanded}
                  tabIndex={!showFutureChrome && chatsExpanded ? 0 : -1}
                >
                  <img src={chromeTasks} alt="" width={20} height={20} />
                  <span className="chrome-btn__badge">3</span>
                </button>
              </Hint>
              <Hint placement="bottom" overlay="Уведомления" mouseEnterDelay={HINT_DELAY}>
                <button
                  type="button"
                  className="chrome-btn chrome-btn--extra chrome-btn--chats-2"
                  aria-label="Уведомления"
                  aria-hidden={showFutureChrome || !chatsExpanded}
                  tabIndex={!showFutureChrome && chatsExpanded ? 0 : -1}
                >
                  <img src={chromeNotifications} alt="" width={20} height={20} />
                </button>
              </Hint>
              {showFutureChrome ? (
                <div className="future-chats" aria-hidden={!futureChatsExpanded}>
                  <Hint
                    placement="bottom"
                    overlay="Решение: 2 новых события"
                    mouseEnterDelay={HINT_DELAY}
                  >
                    <button
                      type="button"
                      className="chrome-btn"
                      aria-label="Решение: 2 новых события"
                      tabIndex={futureChatsExpanded ? 0 : -1}
                    >
                      <span className="chrome-btn__logo">
                        <img src={futureSolutionSetup} alt="" />
                        <img src={futureSolutionLogo} alt="" />
                      </span>
                      <span className="chrome-btn__badge">2</span>
                    </button>
                  </Hint>
                  <Hint
                    placement="bottom"
                    overlay="Решение: 1 новое событие"
                    mouseEnterDelay={HINT_DELAY}
                  >
                    <button
                      type="button"
                      className="chrome-btn"
                      aria-label="Решение: 1 новое событие"
                      tabIndex={futureChatsExpanded ? 0 : -1}
                    >
                      <span className="chrome-btn__logo">
                        <img src={futureSolutionAlert} alt="" />
                      </span>
                      <span className="chrome-btn__badge">1</span>
                    </button>
                  </Hint>
                  <Hint placement="bottom" overlay="Задачи" mouseEnterDelay={HINT_DELAY}>
                    <button
                      type="button"
                      className="chrome-btn"
                      aria-label="Задачи"
                      tabIndex={futureChatsExpanded ? 0 : -1}
                    >
                      <img src={chromeTasks} alt="" width={20} height={20} />
                      <span className="chrome-btn__badge">3</span>
                    </button>
                  </Hint>
                  <Hint
                    placement="bottom"
                    overlay="Уведомления"
                    mouseEnterDelay={HINT_DELAY}
                  >
                    <button
                      type="button"
                      className="chrome-btn"
                      aria-label="Уведомления"
                      tabIndex={futureChatsExpanded ? 0 : -1}
                    >
                      <img src={chromeNotifications} alt="" width={20} height={20} />
                    </button>
                  </Hint>
                  <Hint placement="bottom" overlay="Новости" mouseEnterDelay={HINT_DELAY}>
                    <button
                      type="button"
                      className="chrome-btn"
                      aria-label="Новости"
                      tabIndex={futureChatsExpanded ? 0 : -1}
                    >
                      <img src={chromeNewspaper} alt="" width={20} height={20} />
                    </button>
                  </Hint>
                </div>
              ) : null}
              <Hint placement="bottom" overlay="Чаты" mouseEnterDelay={HINT_DELAY}>
                <button
                  type="button"
                  className="chrome-btn"
                  aria-label="Чаты"
                  onMouseEnter={() => {
                    if (headerVariant !== 1) setChatsOpen(canExpand)
                  }}
                  onFocus={() => {
                    if (headerVariant !== 1) setChatsOpen(canExpand)
                  }}
                >
                  <img src={chromeEvents} alt="" width={20} height={20} />
                  <span className="chrome-btn__badge">5</span>
                </button>
              </Hint>
            </div>
            <span
              className={`top-chrome__divider${
                chatsHovered ||
                solutionsHovered ||
                (headerVariant !== 1 && (chatsOpen || catalogOpen))
                  ? ' is-tall'
                  : ''
              }`}
              aria-hidden="true"
            />
            <div
              className={`chrome-group chrome-group--solutions${
                solutionsExpanded ? ' is-open' : ''
              }${futureExpanded ? ' is-future-open' : ''}${
                solutionsHovered ? ' is-hovered' : ''
              }`}
              onMouseOver={() => {
                if (headerVariant === 1) setHoveredGroup('solutions')
              }}
              onFocusCapture={() => {
                if (headerVariant === 1) setHoveredGroup('solutions')
              }}
              onMouseLeave={() => {
                setHoveredGroup(null)
                setCatalogOpen(false)
              }}
            >
              <Hint placement="bottom" overlay="Решения" mouseEnterDelay={HINT_DELAY}>
                <button
                  type="button"
                  className="chrome-btn"
                  aria-label="Решения"
                  onMouseEnter={() => {
                    if (headerVariant !== 1) setCatalogOpen(canExpand)
                  }}
                  onFocus={() => {
                    if (headerVariant !== 1) setCatalogOpen(canExpand)
                  }}
                  onClick={() => openSolutions('installed')}
                >
                  <img src={chromeApplications} alt="" width={20} height={20} />
                  {showFutureChrome ? <span className="chrome-btn__dot" /> : null}
                </button>
              </Hint>
              {showFutureChrome ? (
                <div className="future-solutions" aria-hidden={!futureExpanded}>
                  <Hint
                    placement="bottom"
                    overlay="Требуется настройка"
                    mouseEnterDelay={HINT_DELAY}
                  >
                    <button
                      type="button"
                      className="future-solutions__status"
                      tabIndex={futureExpanded ? 0 : -1}
                    >
                      <span className="future-solutions__app">
                        <img src={futureSolutionSetup} alt="" />
                        <img src={futureSolutionLogo} alt="" />
                      </span>
                      <span>Требуется настройка</span>
                    </button>
                  </Hint>
                  <Hint
                    placement="bottom"
                    overlay="Решение требует внимания"
                    mouseEnterDelay={HINT_DELAY}
                  >
                    <button
                      type="button"
                      className="future-solutions__icon"
                      tabIndex={futureExpanded ? 0 : -1}
                    >
                      <img src={futureSolutionAlert} alt="" />
                      <span className="future-solutions__dot" />
                    </button>
                  </Hint>
                  <Hint
                    placement="bottom"
                    overlay="Добавить новое решение из Каталога"
                    mouseEnterDelay={HINT_DELAY}
                  >
                    <button
                      type="button"
                      className="future-solutions__icon future-solutions__add"
                      tabIndex={futureExpanded ? 0 : -1}
                    >
                      <Add20Icon />
                    </button>
                  </Hint>
                </div>
              ) : null}
              <Hint placement="bottom" overlay="Добавить новое решение из Каталога" mouseEnterDelay={HINT_DELAY}>
                <button
                  type="button"
                  className="chrome-btn chrome-btn--extra chrome-btn--add"
                  aria-hidden={showFutureChrome || !solutionsExpanded}
                  tabIndex={!showFutureChrome && solutionsExpanded ? 0 : -1}
                >
                  <Add20Icon />
                  <span>Решение</span>
                </button>
              </Hint>
              <span className="chrome-group__edge" aria-hidden="true" />
            </div>
            {solutionsTipOpen && !solutionsOpen ? (
              <div className="solutions-tip" role="status">
                <Text className="solutions-tip__text">
                  2 решения для работы с Заказом покупателя.{' '}
                  <Link
                    href="#"
                    className="solutions-tip__link"
                    onClick={(e) => {
                      e.preventDefault()
                      setSolutionsTipOpen(false)
                      openSolutions('recommended')
                    }}
                  >
                    Посмотреть
                  </Link>
                </Text>
                <button
                  type="button"
                  className="solutions-tip__close"
                  aria-label="Закрыть"
                  onClick={() => setSolutionsTipOpen(false)}
                >
                  <RemoveClose12Icon />
                </button>
              </div>
            ) : null}
          </div>
          <Hint placement="bottom" overlay="Поддержка" mouseEnterDelay={HINT_DELAY}>
            <button
              type="button"
              className="top-chrome__icon-btn top-chrome__icon-btn--help"
              aria-label="Поддержка"
            >
              <img src={chromeSupport} alt="" width={20} height={20} />
            </button>
          </Hint>
          <Hint placement="bottom" overlay="Аккаунт: Морозов С. В., admin@shoes" mouseEnterDelay={HINT_DELAY}>
            <div className="top-chrome__user" style={{ maxWidth: userWidth }}>
              {compactUser ? null : (
                <div className="top-chrome__user-text">
                  <span className="top-chrome__user-name">Морозов С. В.</span>
                  <span className="top-chrome__user-email">admin@shoes</span>
                </div>
              )}
              <img
                className="top-chrome__avatar"
                src={asset('/mock/avatar.svg')}
                alt=""
                width={36}
                height={36}
              />
              <Down12Icon />
            </div>
          </Hint>
        </div>
      </header>

      <div className="subnav" role="tablist" aria-label="Разделы продаж">
        {subnavItems.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={subnav === item}
            className={`subnav__item${subnav === item ? ' is-active' : ''}`}
            onClick={() => setSubnav(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <main className="order-content">
        <section className="doc-hat">
          <div className="doc-hat__row">
            <div className="doc-hat__title">
              <Text.H3>Заказ покупателя</Text.H3>
              <Text.H3>№10103212300011</Text.H3>
              <Text.BodyXL>от 28.05.2024 13:40</Text.BodyXL>
              <Date20Icon />
            </div>

            <div className="doc-hat__actions">
              <Listing
                current={1}
                total={200}
                onPrev={() => undefined}
                onNext={() => undefined}
                isPrevDisabled
                withDivider
              />
              <Button size={ButtonSize.M} variant={ButtonVariants.FRAMELESS}>
                Создать документ
                <Down12Icon />
              </Button>
              <Button
                size={ButtonSize.M}
                variant={ButtonVariants.FRAMELESS}
                isIconButton
                aria-label="Печать"
              >
                <Print20Icon />
              </Button>
              <Button
                size={ButtonSize.M}
                variant={ButtonVariants.FRAMELESS}
                isIconButton
                aria-label="Отправить"
              >
                <Send20Icon />
              </Button>
              <Button
                size={ButtonSize.M}
                variant={ButtonVariants.ADDITIONAL}
                isIconButton
                aria-label="Ещё"
              >
                <Still20Icon />
              </Button>
              <Button size={ButtonSize.M} variant={ButtonVariants.PRIMARY}>
                Сохранить
              </Button>
              <Button size={ButtonSize.M} variant={ButtonVariants.ADDITIONAL}>
                Закрыть
              </Button>
            </div>
          </div>

          <div className="doc-hat__meta">
            <div className="doc-hat__meta-left">
              <button type="button" className="status-pill">
                <span className="status-pill__label">
                  Собран/Ожидает отгрузки [Ozon fbo]
                </span>
                <Down12Icon />
              </button>

              <div className="payment-state">
                <Dot color={DotColor.GREEN} />
                <Text colorToken={TextColor.positive}>Частично оплачено</Text>
                <Link href="#" onClick={(e) => e.preventDefault()}>
                  Запросить оплату
                </Link>
              </div>

              <Checkbox
                checked={reserve}
                onChange={() => setReserve((v) => !v)}
                label="Резерв"
                help="Товар будет зарезервирован на складе"
              />
              <Checkbox
                checked={posted}
                onChange={() => setPosted((v) => !v)}
                label="Проведено"
                help="Документ проведён в учёте"
              />

              <Button size={ButtonSize.M} variant={ButtonVariants.FRAMELESS}>
                <Applications20Icon />
                Решения
                <Down12Icon />
              </Button>
            </div>

            <div className="doc-hat__meta-right">
              <ViewersStack viewers={viewers} label="Смотрят" maxVisibleCount={2} />
              <a className="history-link" href="#" onClick={(e) => e.preventDefault()}>
                <Turnover20Icon />
                12.02.2025 16:35
              </a>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="fields-grid fields-grid--main">
            <FieldSelect
              label="Контрагент"
              value={counterparty}
              options={counterparties}
              onChange={setCounterparty}
              required
            />
            <LabelValueDate
              label="Дата планируемой отгрузки"
              value={shipDate}
              onChange={setShipDate}
              placeholder="__.__.____"
            />
            <FieldSelect
              label="Склад"
              value={warehouse}
              options={warehouses}
              onChange={setWarehouse}
            />
            <FieldSelect
              label="Проект"
              value={project}
              options={projects}
              onChange={setProject}
              placeholder="Выберите"
            />
            <FieldSelect
              label="НДС Включен"
              value={vat}
              options={vatOptions}
              onChange={setVat}
            />
            <FieldSelect
              label="Доступ"
              value={access}
              options={accessOptions}
              onChange={setAccess}
            />

            <FieldSelect
              label="Организация"
              value={org}
              options={orgs}
              onChange={setOrg}
              required
            />
            <FieldSelect
              label="Договор"
              value={contract}
              options={contracts}
              onChange={setContract}
              placeholder="Выберите"
            />
            <div className="lv">
              <div className="lv__label">Комментарий</div>
              <div className="lv__value">
                <Link href="#" onClick={(e) => e.preventDefault()}>
                  Добавить
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="delivery-row">
          <Button size={ButtonSize.M} variant={ButtonVariants.FRAMELESS}>
            + Доставка
          </Button>
        </div>

        <section className="panel panel--params">
          <div className="fields-grid fields-grid--params">
            <EditableValue label="Промокод" value="PROMO1234" />
            <EditableValue label="Приоритет обработки" value="1" />
            <EditableValue label="Скидка менеджера" value="0,25" />
            <div className="lv">
              <div className="lv__label">
                <span>Фактическая дата доставки</span>
                <Help popup="Фактическая дата доставки" size={HelpSize.S} />
              </div>
              <div className="lv__value">
                <span className="lv__text">05.05.2025</span>
                <span className="lv__text">14:03</span>
                <Date12Icon />
              </div>
            </div>
            <FieldSelect
              label="Источник лида"
              value={leadSource}
              options={leadSources}
              onChange={setLeadSource}
            />
            <div className="lv">
              <div className="lv__label">Скан накладной</div>
              <div className="lv__value lv__value--file">
                <img
                  className="lv__thumb"
                  src={asset('/mock/file-preview.png')}
                  alt=""
                  width={16}
                  height={16}
                />
                <Link href="#" onClick={(e) => e.preventDefault()}>
                  Название файла.jpeg
                </Link>
                <Button
                  size={ButtonSize.M}
                  variant={ButtonVariants.FRAMELESS}
                  isIconButton
                  aria-label="Удалить файл"
                >
                  <Delete12Icon />
                </Button>
              </div>
            </div>

            <div className="lv">
              <div className="lv__label">Черный список</div>
              <div className="lv__value">
                <Checkbox
                  checked={blacklist}
                  onChange={() => setBlacklist((v) => !v)}
                />
              </div>
            </div>
            <EditableValue
              label="Примечание к заказу из интернет-магазина"
              value="Если кислотно-зеленый то ВОЗВРАТ, перезвоните!!!"
            />
            <div className="lv">
              <div className="lv__label">Онлайн-чек</div>
              <div className="lv__value">
                <Link
                  className="lv__link-ellipsis"
                  href="https://okd.ru/297834756786298039844"
                  onClick={(e) => e.preventDefault()}
                >
                  https://okd.ru/297834756786298039844
                </Link>
                <Button
                  size={ButtonSize.M}
                  variant={ButtonVariants.FRAMELESS}
                  isIconButton
                  aria-label="Редактировать"
                >
                  <Edit12Icon />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel panel--widgets" aria-label="Виджеты решений">
          <div className="widgets-row">
            {['Интеграция со СДЭК', 'Умный поиск клиентов', 'ИИ-ассистент'].map(
              (title) => (
                <div key={title} className="widget-card">
                  <span className="widget-card__title">{title}</span>
                  <Button
                    size={ButtonSize.M}
                    variant={ButtonVariants.FRAMELESS}
                    isIconButton
                    aria-label={`Свернуть ${title}`}
                  >
                    <Down12Icon />
                  </Button>
                </div>
              ),
            )}
            <Button
              size={ButtonSize.M}
              variant={ButtonVariants.FRAMELESS}
              isIconButton
              aria-label="Ещё виджеты"
            >
              <Still20Icon />
            </Button>
          </div>
        </section>

        {/* В макете блок «Позиции» — растровое изображение image 146 */}
        <section className="positions-mock">
          <img
            src={asset('/mock/positions.png')}
            alt="Позиции заказа покупателя"
            width={1360}
            height={414}
          />
        </section>
      </main>

      <SolutionsSidepage
        isOpen={solutionsOpen}
        onClose={() => setSolutionsOpen(false)}
        initialSegment={solutionsSegment}
      />

      <SolutionsSidepageV2
        isOpen={solutionsV2Open}
        onClose={() => setSolutionsV2Open(false)}
        initialSegment="installed"
      />
    </div>
  )
}

export default CustomerOrderPage
