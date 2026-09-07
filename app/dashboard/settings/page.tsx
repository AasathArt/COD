import { logOut } from "@/app/(auth)/actions";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <div className="card">
        <p className="text-sm text-neutral-500">
          Business profile, couriers, notification preferences, and subscription management are built in
          Phase 5 of the roadmap (see README). For now, you can log out below.
        </p>
      </div>
      <form action={logOut}>
        <button type="submit" className="btn-secondary w-full">Log out</button>
      </form>
    </div>
  );
}
