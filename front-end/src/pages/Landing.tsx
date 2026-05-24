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

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <p className="mb-4 text-sm font-medium text-gray-500">Samsen online judge platform</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for schools, contests, and coding education.
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Fast, minimal judging for Samsen classrooms and contests.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link to="/register">
                Start Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
          </div>
        </motion.div>
      </section>

      <section id="features" className="border-t border-gray-200 bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Everything you need</h2>
          <p className="mt-2 text-gray-600">Student and teacher workflows in one minimal interface.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="h-full rounded-lg border border-gray-200 bg-white p-6">
                  <f.icon className="h-5 w-5 text-gray-700" />
                  <h3 className="mt-4 text-base font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      <section id="faq" className="border-t border-gray-200 bg-gray-50 py-24">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-semibold text-center">FAQ</h2>
          <dl className="mt-10 space-y-8">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-2 text-sm text-gray-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span className="text-sm text-gray-500">© 2026 {SITE_NAME}</span>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/login" className="hover:text-gray-900">Sign in</Link>
            <Link to="/app" className="hover:text-gray-900">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
