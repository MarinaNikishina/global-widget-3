import {
  Applications20Icon,
  Button,
  ButtonSize,
  ButtonVariants,
  MyApps20Icon,
  Sidepage,
  SidepageContent,
  SidepageHeader,
  SidepageMode,
  Text,
  useSnackbar,
} from '@moysklad/uikit'
import emptyMascot from '../assets/icons/empty-mascot.svg'
import './SolutionsSidepage.css'
import './SolutionsEmptySidepage.css'

type SolutionsEmptySidepageProps = {
  isOpen: boolean
  onClose: () => void
}

const snackbarOrigin = { vertical: 'bottom', horizontal: 'center' } as const

export function SolutionsEmptySidepage({ isOpen, onClose }: SolutionsEmptySidepageProps) {
  const { showSnackbar } = useSnackbar()

  const goCatalog = () => {
    showSnackbar({
      message: 'Переход в каталог решений',
      anchorOrigin: snackbarOrigin,
    })
  }

  const goMySolutions = () => {
    showSnackbar({
      message: 'Переход на страницу Мои решения в разделе',
      anchorOrigin: snackbarOrigin,
    })
  }

  return (
    <Sidepage
      isOpen={isOpen}
      onClose={onClose}
      width={500}
      mode={SidepageMode.Fixed}
      withBackdrop={false}
      disableOverflowControl
      showShadow
      zIndex={100}
      className="solutions-sidepage solutions-sidepage--empty"
    >
      <SidepageHeader className="solutions-sidepage__header">
        <div className="solutions-sidepage__title-row">
          <div className="solutions-sidepage__title">
            <Text.H2>Решения</Text.H2>
          </div>
          <div className="solutions-sidepage__top-actions">
            <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS} onClick={goMySolutions}>
              <MyApps20Icon />
              Мои решения
            </Button>
            <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS} onClick={goCatalog}>
              <Applications20Icon />
              Каталог
            </Button>
          </div>
        </div>
      </SidepageHeader>
      <SidepageContent className="solutions-sidepage__content">
        <div className="solutions-empty-card">
          <div className="solutions-empty-card__row">
            <div className="solutions-popover__mascot">
              <img src={emptyMascot} alt="" />
            </div>
            <div className="solutions-popover__empty-copy">
              <div className="solutions-popover__empty-text">
                <p className="solutions-popover__empty-title">
                  У вас нет активных решений для быстрого доступа
                </p>
                <p className="solutions-popover__empty-desc">
                  Перейдите в каталог для выбора нужного вам решения
                </p>
              </div>
              <div className="solutions-popover__actions">
                <Button size={ButtonSize.L} variant={ButtonVariants.PRIMARY} onClick={goCatalog}>
                  Перейти в каталог
                </Button>
                <Button size={ButtonSize.L} variant={ButtonVariants.FRAMELESS} onClick={onClose}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidepageContent>
    </Sidepage>
  )
}
