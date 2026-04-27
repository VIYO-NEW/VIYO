/**
 * Billing API Client — T9 Master Spec §4, §6
 *
 * Typed fetch wrappers for all billing endpoints.
 * Uses the workspace auth token from Supabase.
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §4
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface TokenBalance {
  balance: number;
  lifetimeGranted: number;
  lifetimeConsumed: number;
  subscriptionTier: string;
  subscriptionStatus: string;
}

interface LedgerEntry {
  id: string;
  amount: number;
  runningBalance: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

interface LedgerResponse {
  data: LedgerEntry[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface CheckoutResponse {
  data: {
    sessionId: string;
    url: string;
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Lazy-load Supabase to avoid pulling the SDK into the initial bundle
  const { supabase } = await import('./supabase.js');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error ?? `API error: ${res.status}`);
    (error as unknown as Record<string, unknown>).status = res.status;
    (error as unknown as Record<string, unknown>).code = body.code;
    throw error;
  }

  return res.json() as Promise<T>;
}

export async function fetchTokenBalance(): Promise<TokenBalance> {
  const res = await apiFetch<{ data: TokenBalance }>('/api/v1/billing/balance');
  return res.data;
}

export async function fetchLedger(page = 1, pageSize = 20): Promise<LedgerResponse> {
  return apiFetch<LedgerResponse>(`/api/v1/billing/ledger?page=${page}&pageSize=${pageSize}`);
}

export async function createCheckout(priceId: string, successUrl: string, cancelUrl: string): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>('/api/v1/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId, successUrl, cancelUrl }),
  });
}

export async function createTopUp(packId: string): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>('/api/v1/billing/top-up', {
    method: 'POST',
    body: JSON.stringify({ packId }),
  });
}

export type { TokenBalance, LedgerEntry, LedgerResponse };
