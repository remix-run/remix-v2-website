import * as React from "react";
import { Outlet, useLocation } from "react-router";
import { Link, NavLink } from "~/ui/link";
import { Wordmark } from "~/ui/logo";
import { Discord, GitHub, Twitter, YouTube } from "~/ui/icons";
import { DetailsMenu, DetailsPopup } from "~/ui/details-menu";
import cx from "clsx";
import "~/styles/conf/2023/conf.css";
import { ConfSignUp } from "~/ui/conf-subscribe";

export const handle = { forceTheme: "dark" };

const menuItems: Array<HeaderLinkProps> = [
  {
    to: "/conf/2023#speakers",
    children: "Speakers",
  },
  {
    to: "schedule",
    children: "Schedule",
  },
];

export default function ConfTwentyTwentyThree() {
  return (
    <div className="__layout flex h-full flex-1 flex-col bg-black text-white">
      <Header />
      <main className="flex flex-1 flex-col" tabIndex={-1}>
        <Outlet />
      </main>
      <aside>
        <ConfSignUp />
      </aside>
      <Footer />
    </div>
  );
}

function Header() {
  let location = useLocation();
  let isConfHome =
    location.pathname === "/conf" || location.pathname === "/conf/2023";
  return (
    <header className="absolute left-0 right-0 top-0 z-10 text-white">
      <div className="flex items-start justify-between gap-8 px-6 py-9 lg:px-12">
        <NavLink
          to={isConfHome ? "/conf/2023" : "."}
          prefetch="intent"
          aria-label="Remix"
          className="opacity-80 transition-opacity duration-200 hover:opacity-100"
        >
          <Wordmark />
        </NavLink>

        <nav className="flex" aria-label="Main">
          <ul className="hidden list-none items-center gap-4 md:flex md:gap-5 lg:gap-8">
            {menuItems.map((item) => (
              <li key={item.to + String(item.children)}>
                <HeaderLink
                  {...item}
                  className="opacity-80 transition-opacity duration-200 hover:opacity-100"
                />
              </li>
            ))}
          </ul>
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="__footer flex items-center justify-between px-6 py-9 text-base text-white lg:px-12">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-16">
        <Link to="/" aria-label="Remix home" prefetch="intent">
          <Wordmark height={16} aria-hidden />
        </Link>
        <Link
          prefetch="intent"
          to="coc"
          className="block font-semibold leading-none"
        >
          Code of Conduct
        </Link>
      </div>
      <nav className="flex gap-6 text-white" aria-label="Find us on the web">
        <a href="https://github.com/remix-run" aria-label="GitHub">
          <GitHub aria-hidden />
        </a>
        <a href="https://twitter.com/remix_run" aria-label="Twitter">
          <Twitter aria-hidden />
        </a>
        <a href="https://youtube.com/remix_run" aria-label="YouTube">
          <YouTube aria-hidden />
        </a>
        <a href="https://rmx.as/discord" aria-label="Discord">
          <Discord aria-hidden />
        </a>
      </nav>
    </footer>
  );
}

interface HeaderLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: "none" | "intent";
}

const HeaderLink = React.forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ to, children, className, prefetch = "none", ...props }, ref) => {
    let external = to.startsWith("https://");

    if (external) {
      return (
        <a
          ref={ref}
          className={cx("text-base font-semibold", className)}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <NavLink
        ref={ref}
        prefetch={prefetch}
        className={cx("text-base font-semibold", className)}
        to={to}
        {...props}
      >
        {children}
      </NavLink>
    );
  },
);

HeaderLink.displayName = "HeaderLink";

function MobileNav() {
  return (
    <div className="flex items-center gap-4 md:hidden">
      <DetailsMenu>
        <summary
          className="_no-triangle flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border-2 border-white border-opacity-60 hover:border-opacity-100 hover:bg-black"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </summary>
        <DetailsPopup>
          <nav className="flex flex-col gap-1 py-2">
            {menuItems.map((item) => (
              <HeaderLink
                key={item.to + String(item.children)}
                {...item}
                className="block px-4 py-2 text-white text-opacity-90 hover:bg-gray-700 hover:text-white hover:text-opacity-100"
              />
            ))}
          </nav>
        </DetailsPopup>
      </DetailsMenu>
    </div>
  );
}
