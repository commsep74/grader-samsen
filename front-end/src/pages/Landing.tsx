import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  Code2,
  Trophy,
  Zap,
} from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'
import { SITE_NAME } from '@/lib/brand'

const features = [
  { icon: BookOpen, title: 'Classroom management', desc: 'Join with a code, assignments, announcements.' },
  { icon: Code2, title: 'Online compiler', desc: 'Monaco editor, autosave, multi-language support.' },
  { icon: Trophy, title: 'Live contests', desc: 'Real-time leaderboard, penalty, freeze scoreboard.' },
  { icon: ClipboardList, title: 'Submission history', desc: 'Past attempts, verdicts, runtime, and memory stats.' },
  { icon: BarChart3, title: 'Teacher analytics', desc: 'Class progress, acceptance rates, and score exports.' },
  { icon: Zap, title: 'Fast judging', desc: 'Docker sandbox or Judge0 — sub-second feedback.' },
]

const faqs = [
  { q: 'Is it free for schools?', a: 'Yes — core features are free for educational use.' },
  { q: 'Which languages are supported?', a: 'C++, Python, Java, JavaScript, and more via Judge0.' },
  { q: 'Can teachers import students?', a: 'CSV import and class codes are built in.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
}

export default function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="gradient-hero mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            Samsen online judge platform
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Built for schools, contests, and coding education.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Fast, focused judging for Samsen classrooms and contests — assignments, live boards, and analytics in one place.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link to="/register">
                Start now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section id="features" className="border-t border-border bg-muted/40 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Everything you need</h2>
            <p className="mt-2 text-muted-foreground">
              Student and teacher workflows in one clear, accessible interface.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <div className="group h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <f.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">FAQ</h2>
          <dl className="mt-10 space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-border bg-primary px-6 py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold">Ready to start coding?</h2>
            <p className="mt-2 text-primary-foreground/80">Create a free account for your class or contest.</p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span className="text-sm text-muted-foreground">© 2026 {SITE_NAME}</span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link to="/app" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
