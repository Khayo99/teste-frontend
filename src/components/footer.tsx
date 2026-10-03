import { useState } from 'react'
import socialOne from '@/assets/footer/social-01.svg'
import socialTwo from '@/assets/footer/social-02.svg'
import socialThree from '@/assets/footer/social-03.svg'
import socialFour from '@/assets/footer/social-04.svg'
import socialFive from '@/assets/footer/social-05.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const benefits = [
  {
    description:
      'Proteja sua carteira e colecione arte digital verificada com confiança.',
    initial: 'W',
    title: 'Segurança da carteira'
  },
  {
    description:
      'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
    initial: 'C',
    title: 'Criadores em destaque'
  },
  {
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
    initial: 'D',
    title: 'Alertas de lançamentos'
  }
]

const linkGroups = [
  {
    title: 'Meu perfil',
    links: [
      'Meu perfil',
      'Minha coleção',
      'Atividade',
      'Estúdio do criador',
      'Lista de interesse'
    ]
  },
  {
    title: 'Central de ajuda',
    links: [
      'Central de ajuda',
      'Como comprar NFTs',
      'Carteira e segurança',
      'Política do mercado',
      'Denunciar item'
    ]
  },
  {
    title: 'Coleções',
    links: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade']
  }
]

const socialLinks = [
  { artwork: socialOne, label: 'Facebook' },
  { artwork: socialTwo, label: 'Instagram' },
  { artwork: socialThree, label: 'X' },
  { artwork: socialFour, label: 'LinkedIn' },
  { artwork: socialFive, label: 'YouTube' }
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'invalid' | 'success'>(
    'idle'
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    if (!form.checkValidity()) {
      setFeedback('invalid')
      return
    }

    setEmail('')
    setFeedback('success')
  }

  return (
    <footer className="w-full overflow-hidden" id="footer">
      <section className="bg-surface-card px-5 py-8 sm:px-8">
        <div className="grid max-w-layout-content gap-8 lg:mx-auto lg:min-h-value-186 lg:grid-cols-footer-newsletter lg:gap-0">
          {benefits.map((benefit, index) => (
            <article
              className={`flex flex-col gap-3 lg:px-4 ${index > 0 ? 'lg:border-l lg:border-primary' : ''}`}
              key={benefit.title}
            >
              <span
                aria-hidden="true"
                className="grid size-footer-medallion place-items-center rounded-full bg-primary text-heading text-ink"
              >
                {benefit.initial}
              </span>
              <h2 className="text-body-17-bold text-text-primary">
                {benefit.title}
              </h2>
              <p className="max-w-value-204 text-body-14-copy text-text-secondary">
                {benefit.description}
              </p>
            </article>
          ))}
          <section
            aria-labelledby="newsletter-title"
            className="border-primary lg:border-l lg:px-4"
          >
            <h2
              className="text-body-18-bold-compact text-text-primary"
              id="newsletter-title"
            >
              Antecipe-se ao próximo lançamento
            </h2>
            <form className="mt-4" noValidate onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="footer-email">
                E-mail para novidades
              </label>
              <div className="flex h-10 overflow-hidden rounded-md bg-surface-dark shadow-design">
                <Input
                  aria-describedby={
                    feedback === 'invalid' ? 'footer-email-feedback' : undefined
                  }
                  className="min-w-0 flex-1 bg-transparent px-3 text-body-14-compact text-text-primary outline-none placeholder:text-secondary"
                  id="footer-email"
                  onChange={event => {
                    setEmail(event.target.value)
                    if (feedback !== 'idle') setFeedback('idle')
                  }}
                  placeholder="digite seu e-mail..."
                  required
                  type="email"
                  value={email}
                />
                <Button
                  className="w-value-85 bg-primary px-1 text-body-18-bold-compact text-ink transition-colors hover:bg-primary-light"
                  type="submit"
                  variant="primary"
                >
                  Enviar
                </Button>
              </div>
              {feedback === 'invalid' && (
                <p
                  className="mt-2 text-caption text-error"
                  id="footer-email-feedback"
                  role="alert"
                >
                  Informe um e-mail válido.
                </p>
              )}
              {feedback === 'success' && (
                <p className="mt-2 text-caption text-success" role="status">
                  Inscrição confirmada. Você receberá as próximas novidades.
                </p>
              )}
            </form>
            <p className="mt-3 text-caption text-text-secondary">
              Receba lançamentos selecionados, histórias de criadores e
              novidades do mercado.
            </p>
          </section>
        </div>
      </section>

      <section className="bg-surface-dark px-5 py-6 sm:px-8">
        <div className="mx-auto grid max-w-layout-content gap-5 text-body-14-copy text-text-primary sm:grid-cols-2 lg:grid-cols-footer-primary lg:items-center lg:gap-value-92">
          <a className="text-body-14-brand text-text-primary" href="/">
            KURIO
          </a>
          <p>
            Feito para colecionadores,
            <br />
            criadores e cultura
          </p>
          <a className="hover:text-text-accent" href="mailto:contato@email.com">
            contato@email.com
          </a>
          <a className="hover:text-text-accent" href="tel:+551140028922">
            +55 11 4002 8922
          </a>
        </div>
      </section>

      <section className="bg-surface-card px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-layout-content gap-10 sm:grid-cols-2 lg:grid-cols-footer-secondary lg:gap-value-124">
          {linkGroups.map(group => (
            <nav aria-label={group.title} key={group.title}>
              <h2 className="text-body-18-bold-compact text-text-primary">
                {group.title}
              </h2>
              <ul className="mt-2 space-y-0">
                {group.links.map(link => (
                  <li key={link}>
                    <a
                      className="text-body-14-loose text-text-primary transition-colors hover:text-text-accent"
                      href="#mercado"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="flex flex-col gap-8">
            <section aria-labelledby="social-title">
              <h2
                className="text-body-18-bold-compact text-text-primary"
                id="social-title"
              >
                Redes sociais
              </h2>
              <div className="mt-5 flex gap-value-10">
                {socialLinks.map(social => (
                  <a
                    aria-label={social.label}
                    className="block overflow-visible"
                    href="#footer"
                    key={social.label}
                  >
                    <img
                      alt=""
                      className="block max-w-none"
                      src={social.artwork}
                    />
                  </a>
                ))}
              </div>
            </section>
            <section aria-labelledby="wallets-title">
              <h2
                className="text-body-18-bold-compact text-text-primary"
                id="wallets-title"
              >
                Carteiras compatíveis
              </h2>
              <p className="mt-3 flex h-value-26 items-center justify-center rounded-md border border-border-soft bg-surface-dark px-2 text-tiny-bold text-text-accent">
                METAMASK&nbsp; • &nbsp;WALLETCONNECT&nbsp; • &nbsp;COINBASE
              </p>
            </section>
          </div>
        </div>
      </section>
      <p className="bg-ink px-5 py-3 text-center text-body-14-loose text-text-primary">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  )
}
