// src/components/Premium.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants.js";
import { useLocation } from "react-router-dom";

const fallbackPerks = {
  silver: [
    "Unlimited daily connection requests (up to 50/day)",
    "Priority feed refresh every 10 min",
    "Access to Silver-only project templates",
    "Basic email support (48h SLA)",
  ],
  gold: [
    "Unlimited connections & smart match boosts",
    "Real-time feed refresh + advanced filters",
    "All premium project templates & assets",
    "Mentor DM priority + faster reviews",
    "Early access to new features",
    "Priority support (4h SLA)",
  ],
};

export default function Premium() {
  const [billing, setBilling] = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [sub, setSub] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const location = useLocation();
  const qp = new URLSearchParams(location.search);
  const status = qp.get("status");
  const sessionId = qp.get("session_id");

  // Load available plans
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/plans`, { withCredentials: true });
        if (mounted) setPlans(res?.data?.plans || []);
      } catch {
        setError("Could not load plan data. Using defaults.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Check membership
  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${BASE_URL}/me/subscription`, { withCredentials: true });
        setIsPremium(!!r?.data?.isPremium);
        setSub(r?.data?.subscription || null);
      } catch {
        // not logged in or no sub — ignore
      }
    })();
  }, []);

  // clear error when toggling billing
  useEffect(() => {
    setError("");
    setLoadingPlan(null);
  }, [billing]);

  const priceMap = useMemo(() => {
    const map = { silver: {}, gold: {} };
    for (const p of plans) {
      map[p.plan] = map[p.plan] || {};
      map[p.plan][p.billing] = p.amountInINR;
    }
    return map;
  }, [plans]);

  const featureMap = useMemo(() => {
    const m = { ...fallbackPerks };
    for (const p of plans) {
      if (Array.isArray(p.features) && p.features.length) {
        m[p.plan] = p.features;
      }
    }
    return m;
  }, [plans]);

  const hasPrice = (plan) => Boolean(priceMap?.[plan]?.[billing]);

  // Better error helper to explain *why* checkout didn't start
  const explainCheckoutError = (e, available) => {
    // server message if present
    const serverMsg = e?.response?.data?.message || e?.message;

    if (!available) {
      return `This plan for ${billing} isn’t available yet.`;
    }
    if (e?.response?.status === 401 || /unauth/i.test(serverMsg || "")) {
      return "Please log in to continue to checkout.";
    }
    if (/Plan not configured/i.test(serverMsg || "")) {
      return "Plan not configured for this billing cycle. Please choose a different billing option.";
    }
    if (/stripe/i.test((serverMsg || "").toLowerCase())) {
      return "Stripe configuration issue. Please contact support or try again later.";
    }
    if (!navigator.onLine) {
      return "You appear to be offline. Check your connection and try again.";
    }
    // default fallback + include short server reason if we have one
    return serverMsg
      ? `Could not start checkout: ${serverMsg}`
      : "Could not start checkout. Please try again.";
  };

  const startCheckout = async (plan) => {
    const available = hasPrice(plan);
    try {
      setError("");
      setLoadingPlan(plan);

      // guard: if price not available we don't even call server
      if (!available) {
        setError(`This plan for ${billing} isn’t available yet.`);
        return;
      }

      const res = await axios.post(
        `${BASE_URL}/stripe/checkout`,
        { plan, billing },
        { withCredentials: true }
      );

      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError("Could not start checkout. Missing redirect URL from server.");
      }
    } catch (e) {
      setError(explainCheckoutError(e, available));
    } finally {
      setLoadingPlan(null);
    }
  };

  const openBillingPortal = async () => {
    try {
      setPortalLoading(true);
      setError("");
      const res = await axios.post(`${BASE_URL}/stripe/portal`, {}, { withCredentials: true });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError("Could not open billing portal. Please try again later.");
      }
    } catch {
      setError("Could not open billing portal. Please try again later.");
    } finally {
      setPortalLoading(false);
    }
  };

  const Price = ({ plan }) => {
    const amount = priceMap?.[plan]?.[billing];
    return (
      <div className="mb-4">
        <div className="text-4xl font-extrabold tracking-tight">
          {amount ? (
            <>
              ₹{amount}
              <span className="text-base font-medium opacity-70"> / {billing}</span>
            </>
          ) : (
            <span className="opacity-60">—</span>
          )}
        </div>
        {billing === "yearly" && (
          <div className="text-xs opacity-70 mt-1">~2 months free vs monthly</div>
        )}
      </div>
    );
  };

  // Card: equal height & tidy layout; removed external icons
  const PlanCard = ({ plan, title, highlight }) => {
    const available = hasPrice(plan);

    return (
      <div
        className={[
          "card h-full w-full shadow-xl border overflow-hidden",
          highlight ? "border-primary/50" : "border-base-200",
          "bg-base-100",
          "flex" // make card itself a flex container for consistent stretching
        ].join(" ")}
      >
        <div className="card-body p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <h3 className="card-title text-2xl">{title}</h3>
            {highlight && (
              <div className="badge badge-primary badge-lg">Popular</div>
            )}
          </div>

          <Price plan={plan} />

          <ul className="space-y-2 mb-4 flex-1">
            {(featureMap[plan] || []).map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-0.5">✔️</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <button
              className={`btn w-full ${available ? "btn-primary" : "btn-disabled"}`}
              onClick={() => available && startCheckout(plan)}
              disabled={loadingPlan !== null || loading || !available}
              title={!available ? `This plan for ${billing} isn’t available yet` : ""}
            >
              {!available
                ? "Coming soon"
                : loadingPlan === plan
                ? (
                  <>
                    <span className="loading loading-spinner" />
                    Redirecting…
                  </>
                )
                : `Choose ${title}`}
            </button>

            {!available && (
              <div className="text-xs opacity-70 mt-2">
                This plan for {billing} isn’t available yet.
              </div>
            )}

            <div className="text-xs opacity-70 mt-2">
              Auto-renews. Cancel anytime from Profile &gt; Billing.
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
      <header className="text-center mb-8 sm:mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Go Premium</h1>
        <p className="mt-2 opacity-80">
          Unlock faster discovery, smarter matching, and priority support.
        </p>

        {/* Billing toggle */}
        <div className="join mt-5">
          <button
            className={`btn join-item ${billing === "monthly" ? "btn-active" : "btn-ghost"}`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            className={`btn join-item ${billing === "yearly" ? "btn-active" : "btn-ghost"}`}
            onClick={() => setBilling("yearly")}
            title="Save with annual billing"
          >
            Yearly
          </button>
        </div>
      </header>

      {/* Notices from Stripe return */}
      {status === "success" && sessionId && (
        <div className="alert alert-success mb-6">
          <span>Payment successful. Session: {sessionId.slice(0, 12)}…</span>
        </div>
      )}
      {status === "cancel" && (
        <div className="alert alert-warning mb-6">
          <span>Checkout canceled. You can try again anytime.</span>
        </div>
      )}

      {/* Global error */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* If already premium, show professional confirmation instead of plan cards */}
      {isPremium ? (
        <>
          <div className="card bg-base-100 border border-base-200 shadow-xl">
            <div className="card-body text-center">
              <h2 className="text-2xl font-bold">You’re already a Premium member 🎉</h2>
              {sub && (
                <p className="mt-2 opacity-80 text-sm">
                  Plan: <b className="capitalize">{sub.plan}</b> · Billing: <b>{sub.billing}</b> · Status:{" "}
                  <b className="capitalize">{sub.status}</b>
                </p>
              )}
              <p className="mt-2 opacity-80">
                Thank you for supporting <b>CodeMate</b>. Your account includes all Premium benefits such as
                smarter matching, real-time feed enhancements, and priority support.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  className={`btn btn-primary ${portalLoading ? "btn-disabled" : ""}`}
                  onClick={openBillingPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <>
                      <span className="loading loading-spinner" />
                      Opening billing…
                    </>
                  ) : (
                    "Manage subscription"
                  )}
                </button>
                <a href="/feed" className="btn btn-ghost">Back to Feed</a>
              </div>
              <div className="text-xs opacity-70 mt-3">
                Need help? Reach us from <b>Profile &gt; Support</b>.
              </div>
            </div>
          </div>

          {/* Keep benefits visible below, even for premium users */}
          <section className="mt-12">
            <div className="card bg-base-100 border border-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="text-xl font-bold mb-3">Premium benefits at a glance</h2>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-base-200/60">
                    <h3 className="font-semibold mb-1">Smarter Matching</h3>
                    <p className="opacity-80">
                      Your profile gets boosted in relevant searches and recommendations.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-base-200/60">
                    <h3 className="font-semibold mb-1">Faster Workflow</h3>
                    <p className="opacity-80">
                      Real-time feed, advanced filters, and premium templates speed things up.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-base-200/60">
                    <h3 className="font-semibold mb-1">Priority Support</h3>
                    <p className="opacity-80">
                      Get help sooner with prioritized responses and early feature access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : loading ? (
        // Loading skeletons: equal-height placeholders
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card h-full bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body flex flex-col">
                <div className="skeleton h-7 w-48 mb-3" />
                <div className="skeleton h-10 w-40 mb-4" />
                <div className="space-y-2 mb-4 flex-1">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                  <div className="skeleton h-4 w-4/6" />
                </div>
                <div className="skeleton h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Plan cards: equal height/width, no external icons
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <PlanCard plan="silver" title="Silver" />
          <PlanCard plan="gold" title="Gold" highlight />
        </div>
      )}

      {/* Benefits section (only for non-premium) */}
      {!isPremium && (
        <section className="mt-12">
          <div className="card bg-base-100 border border-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-3">What you get with Premium</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-base-200/60">
                  <h3 className="font-semibold mb-1">Smarter Matching</h3>
                  <p className="opacity-80">
                    Your profile gets boosted in relevant searches and recommendations.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-base-200/60">
                  <h3 className="font-semibold mb-1">Faster Workflow</h3>
                  <p className="opacity-80">
                    Real-time feed, advanced filters, and premium templates speed things up.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-base-200/60">
                  <h3 className="font-semibold mb-1">Priority Support</h3>
                  <p className="opacity-80">
                    Get help sooner with prioritized responses and early feature access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="mt-10 text-center text-xs opacity-70">
        Prices shown are INR and loaded dynamically. Connect Stripe before going live.
      </footer>
    </div>
  );
}
