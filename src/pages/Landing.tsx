'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Factory,
  LineChart,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const features = [
  {
    title: 'Smart Vendor Discovery',
    description:
      'Polybid connects you with pre-vetted polymer suppliers so you can source critical materials with confidence.',
    icon: Factory,
  },
  {
    title: 'Transparent Bidding',
    description:
      'Collect comparable bids in one place, shorten negotiation cycles, and make data-backed purchasing decisions.',
    icon: LineChart,
  },
  {
    title: 'Operational Visibility',
    description:
      'Track orders from quote to delivery with automated status updates tailored to your team\'s workflow.',
    icon: ShieldCheck,
  },
];

const differentiators = [
  'Consolidate bids, supplier credentials, and compliance docs in one workspace.',
  'Invite internal stakeholders to collaborate without worrying about license limits.',
  'Automate follow-ups and reminders so vendors always know what comes next.',
];

const stats = [
  { label: 'Faster vendor onboarding', value: '35%' },
  { label: 'Average RFQ response time', value: '48h' },
  { label: 'Supplier network coverage', value: '60+' },
];

export const Landing = () => (
  <main className="flex w-full flex-col gap-28 pb-24">
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
      <div className="relative w-full px-6 pb-24 pt-20 md:px-12 lg:px-20">
        <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="flex flex-col gap-8 lg:max-w-xl">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3 py-1 text-sm font-medium text-emerald-700 shadow-sm shadow-emerald-200/40 backdrop-blur">
              <Sparkles className="size-4" />
              <span>Procurement without the guesswork</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl xl:text-6xl">
                The polymer sourcing co-pilot for modern operations teams
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 md:text-xl">
                Polybid streamlines sourcing, bidding, and vendor collaboration so your team can secure the right
                polymer materials faster. Keep every stakeholder aligned with live context across RFQs, compliance,
                and delivery milestones.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <form className="w-full sm:max-w-md">
                <label className="sr-only" htmlFor="hero-email">
                  Work email
                </label>
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200/70 bg-white/70 p-3 shadow-sm shadow-emerald-100/30 backdrop-blur">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white/90 px-4 py-2">
                    <Mail className="size-5 text-emerald-500" />
                    <Input
                      id="hero-email"
                      type="email"
                      placeholder="Work email"
                      className="h-11 border-none bg-transparent px-0 text-base text-slate-700 placeholder:text-slate-400 focus-visible:ring-0"
                    />
                  </div>
                  <Button className="h-12 w-full gap-2 rounded-xl bg-emerald-600 text-base font-semibold tracking-tight text-white hover:bg-emerald-700">
                    Request early access
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 shadow-sm shadow-emerald-100/40 backdrop-blur">
                  <Users className="size-4 text-emerald-500" />
                  <span>Trusted by operations teams at global polymer suppliers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -translate-y-6 rounded-[48px] bg-gradient-to-br from-emerald-400/30 via-cyan-400/15 to-transparent blur-2xl" />
            <div className="relative rounded-[40px] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-emerald-200/30 backdrop-blur-xl">
              <div className="flex flex-col gap-6">
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 text-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700">Live RFQs</span>
                    <span className="text-xs font-semibold text-emerald-600">Updated 2m ago</span>
                  </div>
                  <div className="mt-4 space-y-4 text-sm">
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3">
                      <span className="font-medium text-slate-700">Medical-grade PE</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        4 bids in review
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3">
                      <span className="font-medium text-slate-700">High-impact ABS</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Supplier shortlisted
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3">
                      <span className="font-medium text-slate-700">Recycled PET blend</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Compliance pending
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 rounded-3xl border border-emerald-100 bg-white/90 p-6 text-sm shadow-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Cycle time reduction</span>
                    <strong className="text-lg text-emerald-600">-32%</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>On-time deliveries</span>
                    <strong className="text-lg text-emerald-600">97%</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Stakeholder alignment</span>
                    <strong className="text-lg text-emerald-600">One shared workspace</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" className="w-full px-6 md:px-12 lg:px-20">
      <div className="rounded-[36px] border border-emerald-100/70 bg-white/80 p-10 shadow-xl shadow-emerald-200/30 backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Everything your procurement team needs in one place
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Polybid brings supplier discovery, RFQs, compliance, and analytics into a single workspace tailored for
              polymer supply chains. Eliminate repetitive tasks and surface actionable insights that move projects
              forward.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-600">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-center"
              >
                <span className="text-lg text-emerald-700">{stat.value}</span>
                <span className="text-slate-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="flex flex-col gap-5 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-100/40"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <Icon className="size-5 text-emerald-600" />
                </span>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </div>
                <a
                  href="#solution"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  Explore workflows
                  <ArrowRight className="size-4" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section id="solution" className="w-full px-6 md:px-12 lg:px-20">
      <div className="grid gap-12 rounded-[36px] border border-emerald-100/70 bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500 p-10 text-emerald-50 shadow-xl shadow-emerald-300/40 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Collaborate in real time across procurement, finance, and compliance
          </h2>
          <p className="text-base leading-relaxed text-emerald-50">
            Keep projects moving with live updates and accountability at every stage of the procurement process.
            Create reusable playbooks, track approvals, and surface supplier risk in minutes instead of days.
          </p>
          <ul className="space-y-4 text-sm text-emerald-50/90">
            {differentiators.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-flex size-2.5 rounded-full bg-white/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button
              className="h-11 rounded-xl bg-white text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
              asChild
            >
              <a href="mailto:hello@polybid.com">Schedule a walkthrough</a>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-white/60 bg-transparent text-sm font-semibold text-white hover:border-white hover:bg-white/10"
              asChild
            >
              <a href="#pricing">See pricing tiers</a>
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 rounded-[28px] border border-white/40 bg-white/15 p-6 shadow-inner shadow-emerald-900/20 backdrop-blur">
          <div className="space-y-4 rounded-2xl border border-white/30 bg-white/10 p-5">
            <span className="text-xs uppercase tracking-wide text-emerald-100">Playbook snapshot</span>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>RFQ kickoff</span>
                <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white">In progress</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Compliance review</span>
                <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white">Pending docs</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Stakeholder alignment</span>
                <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white">Live sync</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-5 text-sm text-emerald-50/90">
            <p>
              "Polybid gives our sourcing, finance, and quality control teams a shared command center. We move from
              vendor shortlisting to compliant purchase orders in a fraction of the time."
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-emerald-100/80">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                AK
              </div>
              <div>
                <span className="block font-semibold text-white">Anita Kumar</span>
                <span className="text-emerald-100/70">VP Operations, Summit Polymers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" className="w-full px-6 md:px-12 lg:px-20">
      <div className="rounded-[36px] border border-emerald-100/70 bg-white/80 p-10 shadow-xl shadow-emerald-200/25 backdrop-blur">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Pricing designed for scaling procurement teams
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600">
            Start with powerful workflows and deploy Polybid company-wide when you&apos;re ready. Every customer gets
            onboarding support, supplier enablement resources, and a dedicated success manager.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {['Launch', 'Growth', 'Enterprise'].map((tier, index) => (
            <div
              key={tier}
              className={cn(
                'flex flex-col gap-6 rounded-3xl border border-emerald-100 bg-white/90 p-6 text-sm shadow-sm shadow-emerald-100/30',
                index === 1 && 'border-emerald-200 shadow-lg shadow-emerald-200/40',
              )}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{tier}</h3>
                <p className="text-slate-600">
                  {index === 0 && 'For lean teams standardizing polymer purchasing.'}
                  {index === 1 && 'Advanced automation and analytics for growing supply operations.'}
                  {index === 2 && 'Security, customization, and integrations for global enterprises.'}
                </p>
              </div>
              <Button className="h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700">
                Talk to sales
              </Button>
              <ul className="space-y-3 text-slate-600">
                <li>Unlimited vendor records</li>
                <li>Live RFQ workspace</li>
                <li>Compliance & audit trails</li>
                {index === 1 && <li>Automated vendor scoring</li>}
                {index === 2 && (
                  <>
                    <li>Custom approvals & SSO</li>
                    <li>Dedicated success manager</li>
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="about" className="w-full px-6 md:px-12 lg:px-20">
      <div className="grid gap-10 rounded-[36px] border border-emerald-100/70 bg-white/80 p-10 shadow-xl shadow-emerald-200/20 backdrop-blur md:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Built by operators who understand polymer supply chains
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            Our team has scaled procurement, operations, and supplier partnerships across advanced manufacturing. We
            designed Polybid to reduce manual reconciliation, tighten supplier relationships, and keep business-critical
            materials flowing even when markets fluctuate.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <div>
              <span className="block text-lg font-semibold text-emerald-600">2019</span>
              Founded
            </div>
            <div>
              <span className="block text-lg font-semibold text-emerald-600">150+</span>
              Integrated suppliers
            </div>
            <div>
              <span className="block text-lg font-semibold text-emerald-600">Global</span>
              Support footprint
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-inner shadow-emerald-100/40">
          <h3 className="text-lg font-semibold text-slate-900">Ready to see Polybid in action?</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Share your upcoming sourcing initiatives and we&apos;ll walk through how Polybid can accelerate vendor
            onboarding, bid management, and ongoing supplier collaboration.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700">
              <a href="mailto:hello@polybid.com">Connect with our team</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-emerald-200 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
            >
              <a href="#features">Review product overview</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </main>
);

