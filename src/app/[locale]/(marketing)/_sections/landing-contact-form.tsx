"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { submitContactForm, type ContactFormState } from "../contact/actions";

export function LandingContactForm() {
  const locale = useLocale();
  const [formTimestamp] = useState(() => Date.now());
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    null as ContactFormState | null
  );

  const isFr = locale === "fr";

  useEffect(() => {
    if (state?.success) {
      toast.success(
        isFr
          ? "Message envoyé avec succès. Nous vous répondrons bientôt."
          : "Message sent successfully. We will get back to you soon."
      );
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, isFr]);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Honeypot */}
      <div
        className="absolute top-0 -left-[9999px] h-0 w-0 overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="_ts" value={formTimestamp} />
      <input type="hidden" name="form_locale" value={locale} />
      <input
        type="hidden"
        name="subject"
        value={isFr ? "Contact depuis le site web" : "Contact from website"}
      />

      <div>
        <input
          id="nom"
          name="name"
          placeholder={isFr ? "NOM" : "NAME"}
          required
          type="text"
          className="landing-input"
          disabled={isPending}
        />
      </div>
      <div>
        <input
          id="email"
          name="email"
          placeholder="EMAIL"
          required
          type="email"
          className="landing-input"
          disabled={isPending}
        />
      </div>
      <div>
        <textarea
          id="message"
          name="message"
          placeholder="MESSAGE"
          required
          rows={4}
          className="landing-input resize-none"
          disabled={isPending}
        ></textarea>
      </div>
      <div className="mt-4">
        <button
          className="btn-primary w-full md:w-auto px-12 py-4 text-label-sm font-label-sm uppercase tracking-[0.2em] bg-transparent cursor-pointer disabled:opacity-50"
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? isFr
              ? "ENVOI EN COURS..."
              : "SENDING..."
            : isFr
            ? "ENVOYER"
            : "SEND"}
        </button>
      </div>
    </form>
  );
}
