import { useMemo, useState } from 'react'
import {
  AnalyticsGraph20Icon,
  Applications20Icon,
  Button,
  ButtonSize,
  ButtonVariants,
  Checkbox,
  Customers20Icon,
  Date12Icon,
  Date20Icon,
  Delete12Icon,
  Dot,
  DotColor,
  Down12Icon,
  Edit12Icon,
  Events20Icon,
  Help,
  HelpSize,
  Indicators20Icon,
  LabelValueDate,
  LabelValueSelect,
  Link,
  Listing,
  Money20Icon,
  MyApps20Icon,
  Notifications20Icon,
  Print20Icon,
  Production20Icon,
  Products20Icon,
  Purchases20Icon,
  RemoveClose12Icon,
  Retail20Icon,
  Sales20Icon,
  Send20Icon,
  Still20Icon,
  Support20Icon,
  Tasks20Icon,
  Text,
  TextColor,
  Turnover20Icon,
  ViewersStack,
  Warehouse20Icon,
  type ISelectOption,
} from '@moysklad/uikit'
import './CustomerOrderPage.css'
import { asset } from '../assets'
import { SolutionsSidepage } from '../components/SolutionsSidepage'
import { SolutionsSidepageV2 } from '../components/SolutionsSidepageV2'

const navItems: Array<{
  label: string
  icon: typeof Indicators20Icon
  active?: boolean
}> = [
  { label: 'Показатели', icon: Indicators20Icon },
  { label: 'Закупки', icon: Purchases20Icon },
  { label: 'Продажи', icon: Sales20Icon, active: true },
  { label: 'Товары', icon: Products20Icon },
  { label: 'CRM', icon: Customers20Icon },
  { label: 'Склад', icon: Warehouse20Icon },
  { label: 'Деньги', icon: Money20Icon },
  { label: 'Розница', icon: Retail20Icon },
  { label: 'Онлайн-торговля', icon: AnalyticsGraph20Icon },
  { label: 'Производство', icon: Production20Icon },
  { label: 'Задачи', icon: Tasks20Icon },
  { label: 'Решения', icon: Applications20Icon },
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
  const [subnav, setSubnav] = useState(subnavItems[0])
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [solutionsSegment, setSolutionsSegment] = useState<'installed' | 'recommended'>(
    'installed',
  )
  const [solutionsTipOpen, setSolutionsTipOpen] = useState(true)
  const [solutionsV2Open, setSolutionsV2Open] = useState(false)

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
      <header className="top-chrome">
        <div className="top-chrome__left">
          <div className="top-chrome__logo">
            <img src={asset('/mock/logo.svg')} alt="" width={25} height={19} />
          </div>
          <nav className="top-chrome__nav" aria-label="Основное меню">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={`top-chrome__nav-item${active ? ' is-active' : ''}`}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="top-chrome__right">
          <div className="top-chrome__solutions">
            <button
              type="button"
              className="top-chrome__icon-btn"
              aria-label="Решения"
              onClick={() => openSolutions('installed')}
            >
              <MyApps20Icon />
            </button>
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
          <button
            type="button"
            className="top-chrome__icon-btn"
            aria-label="События"
            onClick={() => setSolutionsV2Open(true)}
          >
            <Events20Icon />
          </button>
          <button type="button" className="top-chrome__icon-btn" aria-label="Уведомления">
            <Notifications20Icon />
          </button>
          <button type="button" className="top-chrome__icon-btn" aria-label="Помощь">
            <Support20Icon />
          </button>
          <div className="top-chrome__user">
            <div className="top-chrome__user-text">
              <span className="top-chrome__user-name">Морозов С. В.</span>
              <span className="top-chrome__user-email">admin@shoes</span>
            </div>
            <img
              className="top-chrome__avatar"
              src={asset('/mock/avatar.svg')}
              alt=""
              width={36}
              height={36}
            />
            <Down12Icon />
          </div>
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
