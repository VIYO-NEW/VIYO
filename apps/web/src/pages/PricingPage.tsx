/**
 * PricingPage — T9 Master Spec §20
 *
 * Public pricing page with tier cards, monthly/annual toggle,
 * feature comparison, and FAQ.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §20
 */
import { useState } from 'react';

type BillingInterval = 'monthly' | 'annual';

interface Tier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  tokens: number;
  emailEstimate: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    tokens: 1_000_000,
    emailEstimate: '~2 emails/month',
    features: [
      'Single Email Builder',
      'AI Image Generation',
      'Best AI Models',
      '1 Brand',
      'Export to ESP',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Starter',
    monthlyPrice: 49,
    annualPrice: 490,
    tokens: 6_000_000,
    emailEstimate: '~15 emails/month',
    features: [
      'Everything in Free',
      '3 Brands',
      'Brand Voice Training',
      'Priority Support',
      'Custom Templates',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Growth',
    monthlyPrice: 149,
    annualPrice: 1490,
    tokens: 23_000_000,
    emailEstimate: '~57 emails/month',
    features: [
      'Everything in Starter',
      '10 Brands',
      'Team Collaboration',
      'Advanced Analytics',
      'API Access',
      'A/B Testing',
    ],
    highlighted: true,
    cta: 'Get Started',
  },
  {
    name: 'Agency',
    monthlyPrice: 499,
    annualPrice: 4990,
    tokens: 100_000_000,
    emailEstimate: '~250 emails/month',
    features: [
      'Everything in Growth',
      'Unlimited Brands',
      'White Label',
      'Dedicated Support',
      'Custom Integrations',
      'SLA Guarantee',
    ],
    cta: 'Get Started',
  },
];

const FAQ = [
  {
    q: 'Do tokens expire?',
    a: 'No. Unused tokens carry over indefinitely.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime from your billing settings. You keep your tokens.',
  },
  {
    q: 'What counts as a token?',
    a: 'Every AI operation consumes tokens based on complexity. A simple email uses fewer tokens than a complex one with many images and revisions.',
  },
  {
    q: 'Can I upgrade or downgrade?',
    a: 'Yes. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your billing period.',
  },
  {
    q: 'Do you offer refunds?',
    a: "We don't refund unused tokens, but you can cancel anytime and your tokens remain available.",
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — the Free plan gives you 1M tokens/month to try VIYO with no credit card required.',
  },
];

function formatPrice(price: number): string {
  if (price === 0) return '$0';
  return `$${price}`;
}

export function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="px-4 pb-12 pt-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          AI-Powered Email Marketing That Pays for Itself
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Generate stunning, high-converting emails in minutes. Pay only for what you use.
        </p>
        <a
          href="/signup"
          className="inline-block rounded-lg bg-viyo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-viyo-700"
        >
          Start Free — No Credit Card Required
        </a>
      </section>

      {/* Billing Toggle */}
      <section className="px-4 pb-16">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${interval === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setInterval(interval === 'monthly' ? 'annual' : 'monthly')}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              interval === 'annual' ? 'bg-viyo-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                interval === 'annual' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${interval === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            Annual
          </span>
          {interval === 'annual' && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Save 17%
            </span>
          )}
        </div>

        {/* Tier Cards */}
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => {
            const price = interval === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            const perMonth = interval === 'annual' && price > 0
              ? Math.round(price / 12)
              : price;

            return (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 ${
                  tier.highlighted
                    ? 'border-viyo-500 bg-viyo-50 shadow-lg dark:border-viyo-400 dark:bg-slate-900'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-viyo-600 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{tier.name}</h3>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(perMonth)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">/month</span>
                  )}
                  {interval === 'annual' && price > 0 && (
                    <p className="text-xs text-slate-400">billed annually at ${price}</p>
                  )}
                </div>

                <p className="mb-1 text-sm font-medium text-viyo-600 dark:text-viyo-400">
                  {new Intl.NumberFormat().format(tier.tokens)} tokens/month
                </p>
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                  {tier.emailEstimate}
                </p>

                <ul className="mb-6 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-0.5 text-emerald-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-viyo-600 text-white hover:bg-viyo-700'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">{item.q}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="border-t border-slate-200 px-4 py-16 text-center dark:border-slate-800">
        <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
          Need more?
        </h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Contact us for custom plans, dedicated support, and SLA guarantees.
        </p>
        <a
          href="mailto:sales@viyo.ai"
          className="inline-block rounded-lg border border-viyo-500 px-6 py-2.5 font-semibold text-viyo-600 transition-colors hover:bg-viyo-50 dark:text-viyo-400 dark:hover:bg-slate-900"
        >
          Contact Sales
        </a>
      </section>
    </div>
  );
}
