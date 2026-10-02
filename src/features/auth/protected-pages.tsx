import { Link } from '@tanstack/react-router'

export function ProtectedPage({ title }: { title: string }) {
  return (
    <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-widest text-text-accent">
        Área autenticada
      </p>
      <h1 className="mt-3 text-4xl font-bold">{title}</h1>
      <p className="mt-4 text-text-secondary">
        Esta área está pronta para receber os dados privados da sua conta.
      </p>
      <Link
        className="mt-8 w-fit rounded-md bg-primary px-5 py-3 font-bold text-ink"
        to="/"
      >
        Voltar ao início
      </Link>
    </section>
  )
}
