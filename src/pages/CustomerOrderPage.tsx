import { useEffect, useMemo, useRef, useState } from 'react'
import {
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
  Send20Icon,
  Still20Icon,
  Text,
  TextColor,
  Turnover20Icon,
  useSnackbar,
  ViewersStack,
  type ISelectOption,
} from '@moysklad/uikit'
import './CustomerOrderPage.css'
import { asset } from '../assets'
import { SolutionsMenuPopover } from '../components/SolutionsMenuPopover'
import { SolutionsSidepage } from '../components/SolutionsSidepage'
import {
  VARIANT_CATEGORIES,
  VARIANT_EMPTY,
  VARIANT_EMPTY_PICK,
  VARIANT_FEW,
  VARIANT_FEW_SCROLL,
  useVariant,
} from '../components/variantContext'
import chromeLogo from '../assets/icons/header/logo-main.svg'
import chromeEvents from '../assets/icons/header/events-20.svg'
import chromeBell from '../assets/icons/header/bell-20.svg'
import chromeHelp from '../assets/icons/header/help-20.svg'
import navCrm from '../assets/icons/header/nav-crm.svg'
import navGoods from '../assets/icons/header/nav-goods.svg'
import navIndicators from '../assets/icons/header/nav-indicators.svg'
import navManufacture from '../assets/icons/header/nav-manufacture.svg'
import navMoney from '../assets/icons/header/nav-money.svg'
import navProcurement from '../assets/icons/header/nav-procurement.svg'
import navRetail from '../assets/icons/header/nav-retail.svg'
import navSelling from '../assets/icons/header/nav-selling.svg'
import navTasks from '../assets/icons/header/nav-tasks.svg'
import navSolutions from '../assets/icons/header/nav-solutions.svg'

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
  { label: 'Производство', icon: navManufacture, iconName: 'manufacture', width: 90 },
  { label: 'Задачи', icon: navTasks, iconName: 'tasks', width: 60 },
  { label: 'Решения', icon: navSolutions, iconName: 'solutions', width: 68 },
]

// Блок аккаунта живёт на остатке после навигации и трёх иконок (3×38 + 2×4).
const LOGO_WIDTH = 58
const NAV_WIDTH = LOGO_WIDTH + navItems.reduce((sum, item) => sum + item.width, 0)
const RIGHT_PADDING = 8
const ACTIONS_WIDTH = 38 * 3 + 4 * 2
// Аватар со стрелкой и отступами — меньше блок аккаунта не становится
const USER_COMPACT_WIDTH = 71
const USER_TEXT_MIN_WIDTH = 32
const USER_MAX_WIDTH = 180

// Сколько остаётся блоку аккаунта при текущей ширине хедера
function userSpaceFor(headerWidth: number) {
  return headerWidth - NAV_WIDTH - RIGHT_PADDING - ACTIONS_WIDTH
}

// Задержка хинтов в шапке, чтобы они не мелькали при проведении курсором, секунды
const HINT_DELAY = 0.8

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
  const [subnav, setSubnav] = useState(subnavItems[0])
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [solutionsSegment, setSolutionsSegment] = useState<'installed' | 'recommended'>(
    'installed',
  )
  const [compactUser, setCompactUser] = useState(false)
  const [userWidth, setUserWidth] = useState(USER_MAX_WIDTH)
  const [solutionsMenuOpen, setSolutionsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const solutionsNavRef = useRef<HTMLDivElement>(null)
  const solutionsMenuTimer = useRef<number | null>(null)
  const { variant } = useVariant()
  const { showSnackbar } = useSnackbar()
  const solutionsPopover =
    variant === VARIANT_EMPTY_PICK ||
    variant === VARIANT_CATEGORIES ||
    variant === VARIANT_EMPTY ||
    variant === VARIANT_FEW ||
    variant === VARIANT_FEW_SCROLL
      ? variant
      : null

  const openSolutionsMenu = () => {
    if (solutionsMenuTimer.current) window.clearTimeout(solutionsMenuTimer.current)
    setSolutionsMenuOpen(true)
  }
  const closeSolutionsMenu = () => {
    if (solutionsMenuTimer.current) window.clearTimeout(solutionsMenuTimer.current)
    solutionsMenuTimer.current = window.setTimeout(() => setSolutionsMenuOpen(false), 160)
  }

  useEffect(() => {
    return () => {
      if (solutionsMenuTimer.current) window.clearTimeout(solutionsMenuTimer.current)
    }
  }, [])

  useEffect(() => {
    const node = headerRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      const space = userSpaceFor(entry.contentRect.width)
      setUserWidth(Math.min(USER_MAX_WIDTH, Math.max(USER_COMPACT_WIDTH, space)))
      setCompactUser(space < USER_COMPACT_WIDTH + USER_TEXT_MIN_WIDTH)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

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
    <div className="order-page">
      <header className="top-chrome" ref={headerRef}>
        <div className="top-chrome__left">
          <div className="top-chrome__logo">
            <img src={chromeLogo} alt="" width={25} height={19} />
          </div>
          <nav className="top-chrome__nav" aria-label="Основное меню">
            {navItems.map(({ label, icon, iconName, width, active }) => {
              const button = (
                <button
                  type="button"
                  className={`top-chrome__nav-item${active ? ' is-active' : ''}`}
                  style={{ width }}
                  onClick={
                    label === 'Моя компания'
                      ? () => openSolutions('installed')
                      : label === 'Решения' && solutionsPopover
                        ? () =>
                            showSnackbar({
                              message: 'Переход в каталог решений',
                              anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                            })
                        : undefined
                  }
                >
                  <span className="top-chrome__nav-icon">
                    <img className={`top-chrome__nav-ico--${iconName}`} src={icon} alt="" />
                  </span>
                  <span>{label}</span>
                </button>
              )

              if (label === 'Решения' && solutionsPopover) {
                return (
                  <div
                    key={label}
                    ref={solutionsNavRef}
                    className="top-chrome__nav-anchor"
                    onMouseEnter={openSolutionsMenu}
                    onMouseLeave={closeSolutionsMenu}
                  >
                    {button}
                    {solutionsMenuOpen ? (
                      <SolutionsMenuPopover
                        layout={
                          solutionsPopover === VARIANT_CATEGORIES
                            ? 'categories'
                            : solutionsPopover === VARIANT_EMPTY
                              ? 'empty-only'
                              : solutionsPopover === VARIANT_FEW
                                ? 'few'
                                : solutionsPopover === VARIANT_FEW_SCROLL
                                  ? 'few-scroll'
                                  : 'empty'
                        }
                        anchor={solutionsNavRef.current}
                        onMouseEnter={openSolutionsMenu}
                        onMouseLeave={closeSolutionsMenu}
                      />
                    ) : null}
                  </div>
                )
              }

              return (
                <Hint key={label} placement="bottom" overlay={label} mouseEnterDelay={HINT_DELAY}>
                  {button}
                </Hint>
              )
            })}
          </nav>
        </div>
        <div className="top-chrome__right">
          <div className="top-chrome__actions">
            <Hint placement="bottom" overlay="Чаты" mouseEnterDelay={HINT_DELAY}>
              <button type="button" className="top-chrome__action-btn" aria-label="Чаты">
                <img src={chromeEvents} alt="" width={20} height={20} />
              </button>
            </Hint>
            <Hint placement="bottom" overlay="Уведомления" mouseEnterDelay={HINT_DELAY}>
              <button
                type="button"
                className="top-chrome__action-btn"
                aria-label="Уведомления"
              >
                <img src={chromeBell} alt="" width={17} height={18} />
              </button>
            </Hint>
            <Hint placement="bottom" overlay="Справка" mouseEnterDelay={HINT_DELAY}>
              <button type="button" className="top-chrome__action-btn" aria-label="Справка">
                <img src={chromeHelp} alt="" width={18} height={18} />
              </button>
            </Hint>
          </div>
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
    </div>
  )
}

export default CustomerOrderPage
