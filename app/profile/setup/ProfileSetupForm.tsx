"use client";

import { useFormState, useFormStatus } from "react-dom";

type ActionState = {
  error: string | null;
};

const initialState: ActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Saving..." : "Finish"}
    </button>
  );
}

type ProfileSetupFormProps = {
  email: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export default function ProfileSetupForm({
  email,
  action,
}: ProfileSetupFormProps) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-zinc-900">
          Motion On Campus
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Profile setup for {email}</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-zinc-800">
            Name
            <input
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="Jordan Lee"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            Age
            <input
              name="age"
              type="number"
              min={17}
              max={99}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="20"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            Graduation Year
            <input
              name="graduation_year"
              type="number"
              min={2024}
              max={2100}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="2027"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800">
            Major
            <input
              name="major"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="Computer Science"
            />
          </label>
        </div>

        {state.error ? (
          <p className="mt-4 text-sm text-red-600">{state.error}</p>
        ) : null}

        <div className="mt-6">
          <SubmitButton />
        </div>
      </form>
    </main>
  );
}
