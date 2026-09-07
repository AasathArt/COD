"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signUp } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create Free Account"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signUp, { error: undefined as string | undefined });

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-blue">CODFlow</h1>
          <p className="mt-1 text-sm text-neutral-500">Orders. Deliveries. Profit.</p>
        </div>

        <form action={formAction} className="card space-y-4">
          <h2 className="text-lg font-semibold">Create your account</h2>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input name="fullName" type="text" required className="input-field" placeholder="Fathima Nazreen" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" required className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input name="password" type="password" required minLength={8} className="input-field" placeholder="At least 8 characters" />
          </div>

          <SubmitButton />
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-blue">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
