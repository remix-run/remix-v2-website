import * as React from "react";
import { Discord } from "~/ui/icons";
import { Link } from "~/ui/link";

export function ConfSignUp() {
  return (
    <section className="my-6" id="conf-newsletter-signup">
      <div className="container">
        <section className="section-signup relative">
          <div className="relative mx-auto md:max-w-xl md:py-40">
            <h2 className="h2 mb-3 font-mono text-3xl font-bold text-yellow-brand">
              Stay Updated
            </h2>
            <div className="mb-6 flex items-center gap-4">
              <a
                href="https://rmx.as/discord"
                aria-label="Discord"
                title="Join Discord"
              >
                <Discord aria-hidden />
              </a>
              <p className="text-lg opacity-80 md:text-xl">
                <a className="underline" href="https://rmx.as/discord">
                  Join the Remix community on Discord
                </a>{" "}
                to keep up with what&apos;s going on with the conference and the
                Remix Community as a whole.
              </p>
            </div>
            <p className="mb-6 text-lg opacity-80 md:text-xl">
              For newsletter updates,{" "}
              <Link
                to="https://remix.run/newsletter"
                className="underline"
                prefetch="none"
              >
                subscribe at remix.run
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
