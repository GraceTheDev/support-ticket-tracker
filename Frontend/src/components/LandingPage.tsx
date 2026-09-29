export type AppView = 'home' | 'logger' | 'support'

interface LandingPageProps {
  onChoose: (view: Exclude<AppView, 'home'>) => void
}

export function LandingPage({ onChoose }: LandingPageProps) {
  return (
    <div className="landing">
      <div className="landing__wallpaper" aria-hidden="true" />
      <div className="landing__overlay" aria-hidden="true" />
      <div className="landing__content">
        <div className="landing__card">
          <img className="landing__logo" src="/logo.svg" alt="" width={64} height={64} />
          <h1 className="landing__title">SUPPORT TICKET TRACKER</h1>
          <p className="landing__subtitle">
            Manage support requests from creation to resolution.
          </p>
          <div className="landing__actions">
            <button
              className="btn btn--primary landing__cta"
              type="button"
              onClick={() => onChoose('logger')}
            >
              Log a ticket
            </button>
            <button
              className="btn btn--ghost landing__cta"
              type="button"
              onClick={() => onChoose('support')}
            >
              Support desk
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
