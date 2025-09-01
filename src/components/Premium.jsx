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

  const startCheckout = async (plan) => {
    try {
      setError("");
      setLoadingPlan(plan);
      const res = await axios.post(
        `${BASE_URL}/stripe/checkout`,
        { plan, billing },
        { withCredentials: true }
      );
      if (res?.data?.url) window.location.href = res.data.url;
      else setError("Could not start checkout. Please try again.");
    } catch (e) {
      const msg = e?.response?.data?.message || "Checkout failed. Try again.";
      if (/Plan not configured/i.test(msg)) {
        // keep calm; the button is disabled when price missing
      } else {
        setError(msg);
      }
    } finally {
      setLoadingPlan(null);
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

  const PlanCard = ({ plan, title, highlight }) => {
    const available = hasPrice(plan);
    return (
      <div
        className={[
          "card w-full shadow-md border",
          highlight ? "border-indigo-400" : "border-base-200",
          "bg-base-100",
        ].join(" ")}
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-2xl">
              {title}{" "}
              {highlight && (
                <span className="badge badge-primary badge-outline ml-2">Popular</span>
              )}
            </h3>
            <img
              src={plan === "gold"
                ? "https://img.icons8.com/emoji/48/1f947.png"
                : "https://img.icons8.com/emoji/48/1f948.png"}
              alt={`${title} badge`}
              className="w-6 h-6"
              loading="lazy"
            />
          </div>

          <Price plan={plan} />

          <ul className="space-y-2 mb-4">
            {(featureMap[plan] || []).map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1">✔️</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <button
            className={`btn w-full ${available ? "btn-primary" : "btn-disabled"}`}
            onClick={() => available && startCheckout(plan)}
            disabled={loadingPlan !== null || loading || !available}
            title={!available ? `This plan for ${billing} isn’t available yet` : ""}
          >
            {!available
              ? "Coming soon"
              : loadingPlan === plan
              ? "Redirecting…"
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
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Go Premium</h1>
        <p className="mt-2 opacity-80">
          Unlock faster discovery, smarter matching, and priority support.
        </p>
        <div className="join mt-5">
          <button
            className={`btn join-item ${billing === "monthly" ? "btn-active" : ""}`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            className={`btn join-item ${billing === "yearly" ? "btn-active" : ""}`}
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

      {/* Only show global error for non-config issues */}
      {error && !/Plan not configured/i.test(error) && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* If already premium, don’t show plans */}
      {isPremium ? (
        <div className="rounded-2xl p-6 border shadow-sm bg-base-100 text-center">
          <h2 className="text-2xl font-bold">You’re already Premium 🎉</h2>
          {sub && (
            <p className="mt-2 opacity-80 text-sm">
              Plan: <b>{sub.plan}</b> · Billing: <b>{sub.billing}</b> · Status:{" "}
              <b>{sub.status}</b>
            </p>
          )}
          <p className="mt-2 opacity-80">
            Thanks for supporting CodeMate. Enjoy all premium benefits!
          </p>
        </div>
      ) : loading ? (
        <div className="text-center opacity-70">Loading plans…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <PlanCard plan="silver" title="Silver" />
          <PlanCard plan="gold" title="Gold" highlight />
        </div>
      )}

      <section className="mt-12">
        <div className="rounded-2xl p-6 border shadow-sm bg-base-100">
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
      </section>

      <footer className="mt-10 text-center text-xs opacity-70">
        Prices shown are INR and loaded dynamically. Connect Stripe before going live.
      </footer>
    </div>
  );
}
