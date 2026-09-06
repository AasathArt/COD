"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { completeOnboarding } from "./actions";

const CATEGORIES = ["Clothing", "Cosmetics", "Electronics", "Food", "Art & Crafts", "Home Products", "Other"];
const VOLUMES = ["1-30", "31-100", "101-300", "300+"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Setting up..." : "Create My Workspace"}
    </button>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [country] = useState("Sri Lanka");
  const [currency] = useState("LKR");
  const [monthlyOrderVolume, setMonthlyOrderVolume] = useState("1-30");

  const [state, formAction] = useFormState(completeOnboarding, { error: undefined as string | undefined });

  const totalSteps = 5;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-brand-blue" : "bg-neutral-200"}`}
            />
          ))}
        </div>

        <form action={formAction} className="card space-y-5">
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold">What&apos;s your business called?</h2>
              <p className="mb-4 text-sm text-neutral-500">This appears on invoices and messages to customers.</p>
              <input
                autoFocus
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="input-field"
                placeholder="e.g. Aasath Handmade Studio"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold">What do you sell?</h2>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                      category === c ? "border-brand-blue bg-blue-50 text-brand-blue" : "border-neutral-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold">Where do you sell?</h2>
              <p className="mb-4 text-sm text-neutral-500">You can add more countries later.</p>
              <input value={country} readOnly className="input-field bg-neutral-50" />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold">Your currency</h2>
              <input value={currency} readOnly className="input-field bg-neutral-50" />
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold">Roughly how many orders per month?</h2>
              <div className="space-y-2">
                {VOLUMES.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setMonthlyOrderVolume(v)}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-medium ${
                      monthlyOrderVolume === v ? "border-brand-blue bg-blue-50 text-brand-blue" : "border-neutral-200"
                    }`}
                  >
                    {v} orders/month
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hidden fields carry the accumulated wizard state to the server action on final submit */}
          <input type="hidden" name="businessName" value={businessName} />
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="country" value={country} />
          <input type="hidden" name="currency" value={currency} />
          <input type="hidden" name="monthlyOrderVolume" value={monthlyOrderVolume} />

          <div className="flex gap-3">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !businessName.trim()}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            ) : (
              <div className="flex-1">
                <SubmitButton />
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
