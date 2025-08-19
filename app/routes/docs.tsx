import * as React from "react";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigation,
  useResolvedPath,
  matchPath,
  useNavigate,
  href,
} from "react-router";
import cx from "clsx";
import { DocSearch } from "~/ui/docsearch";

import "~/styles/docs.css";
import { Wordmark } from "~/ui/logo";
import { DetailsMenu, DetailsPopup } from "~/ui/details-menu";

import iconsHref from "~/icons.svg";
import {
  useColorScheme,
  setColorScheme,
  type ColorScheme,
} from "~/lib/color-scheme";
import { Doc, getMenu } from "~/lib/docs";
import { useHydrated } from "~/ui/primitives/utils";

export const loader = async () => {
  return {
    menu: await getMenu(),
  };
};

export default function DocsLayout() {
  let navigation = useNavigation();
  let navigating =
    navigation.state === "loading" && navigation.formData == null;

  let location = useLocation();
  let detailsRef = React.useRef<HTMLDetailsElement>(null);

  React.useEffect(() => {
    let details = detailsRef.current;
    if (details && details.hasAttribute("open")) {
      details.removeAttribute("open");
    }
  }, [location]);

  let docsContainer = React.useRef<HTMLDivElement>(null);
  useCodeBlockCopyButton(docsContainer);

  return (
    <div className="[--header-height:theme(spacing.16)] [--nav-width:theme(spacing.72)]">
      <div className="sticky top-0 z-20">
        <Header />
        <VersionWarningMobile />
        <NavMenuMobile />
      </div>
      <div>
        <InnerContainer>
          <div className="block lg:flex">
            <NavMenuDesktop />
            <div
              ref={docsContainer}
              className={cx(
                // add scroll margin to focused elements so that they aren't
                // obscured by the sticky header
                "[&_*:focus]:scroll-mt-[8rem] lg:[&_*:focus]:scroll-mt-[5rem]",
                // Account for the left navbar
                "min-h-[80vh] lg:ml-3 lg:w-[calc(100%-var(--nav-width))]",
                "lg:pl-6 xl:pl-10 2xl:pl-12",
                navigating ? "opacity-25 transition-opacity delay-300" : "",
              )}
            >
              <Outlet />
              <div className="pt-8 sm:pt-10 lg:pt-12">
                <Footer />
              </div>
            </div>
          </div>
        </InnerContainer>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="flex justify-between gap-4 border-t border-t-gray-50 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-300">
      <div className="sm:flex sm:items-center sm:gap-2 lg:gap-4">
        <div>
          &copy;{" "}
          <a className="hover:underline" href="https://remix.run">
            Shopify, Inc.
          </a>
        </div>
        <div className="hidden sm:block">•</div>
        <div>
          Docs and examples licensed under{" "}
          <a
            className="hover:underline"
            href="https://opensource.org/licenses/MIT"
          >
            MIT
          </a>
        </div>
      </div>
      <div>
        <EditLink />
      </div>
    </div>
  );
}

function Header() {
  let navigate = useNavigate();

  return (
    <div
      className={cx(
        "relative border-b border-gray-100/50 bg-white text-black dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
        // This hides some of the underlying text when the user scrolls to the
        // bottom which results in the overscroll bounce
        "before:absolute before:bottom-0 before:left-0 before:hidden before:h-[500%] before:w-full before:bg-inherit lg:before:block",
      )}
    >
      <InnerContainer>
        <div className="relative z-20 flex h-[--header-height] w-full items-center justify-between py-3">
          <div className="flex w-full items-center justify-between gap-4 sm:gap-8 md:w-auto">
            <Link
              className="flex"
              onContextMenu={(event) => {
                event.preventDefault();
                navigate("/brand");
              }}
              to="/"
            >
              <Wordmark />
            </Link>
            <div className="flex items-center gap-2">
              <ColorSchemeToggle />
              <DocSearchSection className="lg:hidden" />
              <HeaderMenuMobile className="md:hidden" />
            </div>
          </div>
          <VersionWarningDesktop />
          <div className="flex gap-8">
            <div className="hidden items-center md:flex">
              <HeaderMenuLink to={href("/docs")}>Docs</HeaderMenuLink>
              <HeaderMenuLink to="https://remix.run/blog">Blog</HeaderMenuLink>
            </div>
            <div className="flex items-center gap-2">
              <HeaderLink
                href="https://github.com/remix-run/remix/tree/v2"
                svgId="github"
                label="View code on GitHub"
                title="View code on GitHub"
                svgSize="24x24"
              />
              <HeaderLink
                href="https://rmx.as/discord"
                svgId="discord"
                label="Chat on Discord"
                title="Chat on Discord"
                svgSize="24x24"
              />
            </div>
          </div>
        </div>
      </InnerContainer>
    </div>
  );
}

function DocSearchSection({ className }: { className?: string }) {
  return (
    <div className={cx("relative lg:sticky lg:top-0 lg:z-10", className)}>
      <div className="absolute -top-24 hidden h-24 w-full bg-white dark:bg-gray-900 lg:block" />
      <div
        className={cx(
          "relative lg:bg-white lg:dark:bg-gray-900",
          // This hides some of the underlying text when the user scrolls to the
          // bottom which results in the overscroll bounce
          "before:absolute before:bottom-0 before:left-0 before:-z-10 before:hidden before:h-[200%] before:w-full before:bg-inherit lg:before:block",
        )}
      >
        <DocSearch />
      </div>
    </div>
  );
}

function ColorSchemeToggle() {
  // This is the same default, hover, focus style as the VersionSelect
  let baseClasses =
    "bg-gray-100 hover:bg-gray-200 [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  // A little hacky, but avoids reinventing all the close logic (like clicking outside the menu)
  const detailsRef = React.useRef<HTMLDetailsElement>(null);

  const handleColorSchemeChange = (value: ColorScheme) => {
    setColorScheme(value);
    // Close the details menu after selection
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <DetailsMenu ref={detailsRef} className="relative cursor-pointer">
      <summary
        className={cx(
          baseClasses,
          "_no-triangle grid h-10 w-10 place-items-center rounded-full",
        )}
      >
        <svg className="hidden h-5 w-5 dark:inline">
          <use href={`${iconsHref}#moon`} />
        </svg>
        <svg className="h-5 w-5 dark:hidden">
          <use href={`${iconsHref}#sun`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="flex flex-col gap-px">
          <ColorSchemeButton
            svgId="sun"
            label="Light"
            value="light"
            onClick={() => handleColorSchemeChange("light")}
          />
          <ColorSchemeButton
            svgId="moon"
            label="Dark"
            value="dark"
            onClick={() => handleColorSchemeChange("dark")}
          />
          <ColorSchemeButton
            svgId="monitor"
            label="System"
            value="system"
            onClick={() => handleColorSchemeChange("system")}
          />
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

let ColorSchemeButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button"> & {
    svgId: string;
    label: string;
    value: string;
  }
>(({ svgId, label, value, ...props }, forwardedRef) => {
  let colorScheme = useColorScheme();

  // Avoids hydration issues that kept buttons permanently disabled
  // this is fine though since you can't use this feature with out JS anyway
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return null;
  }

  return (
    <button
      {...props}
      ref={forwardedRef}
      type="button"
      disabled={colorScheme === value}
      className={cx(
        "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm transition-colors duration-100",
        colorScheme === value
          ? "bg-blue-200 text-black dark:bg-blue-800 dark:text-gray-100"
          : "text-gray-700 hover:bg-blue-200/50 hover:text-black dark:text-gray-300 dark:hover:bg-blue-800/50 dark:hover:text-gray-100",
      )}
    >
      <svg className="h-4 w-4">
        <use href={`${iconsHref}#${svgId}`} />
      </svg>{" "}
      {label}
    </button>
  );
});

ColorSchemeButton.displayName = "ColorSchemeButton";

function VersionWarningMobile() {
  return (
    <div className="text-center lg:hidden">
      <div className="bg-blue-brand p-2 text-xs text-white">
        <ReactRouterV7Message />
      </div>
    </div>
  );
}

function VersionWarningDesktop() {
  return (
    <div className="hidden lg:block">
      <div className="animate-[bounce_500ms_2.5] bg-blue-brand p-2 text-xs text-white">
        <ReactRouterV7Message />
      </div>
    </div>
  );
}

function ReactRouterV7Message() {
  return (
    <>
      React Router v7 has been released.{" "}
      <a href="https://reactrouter.com/home" className="underline">
        View the docs
      </a>
    </>
  );
}

function HeaderMenuLink({
  className = "",
  to,
  children,
  external = false,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  let isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        className,
        "p-2 py-2.5 text-sm leading-none underline-offset-4 hover:underline md:p-3",
        isActive
          ? "text-black underline decoration-black dark:text-gray-200 dark:decoration-gray-200"
          : "text-gray-500 decoration-gray-200 dark:text-gray-300 dark:decoration-gray-500",
        {
          ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
      )}
    >
      {children}
    </Link>
  );
}

function HeaderMenuMobile({ className = "" }: { className: string }) {
  // This is the same default, hover, focus style as the VersionSelect
  let baseClasses =
    "bg-gray-100 hover:bg-gray-200 [[open]>&]:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:[[open]>&]:bg-gray-700";

  return (
    <DetailsMenu className={cx("relative cursor-pointer", className)}>
      <summary
        className={cx(
          baseClasses,
          "_no-triangle grid h-10 w-10 place-items-center rounded-full",
        )}
      >
        <svg className="h-5 w-5">
          <use href={`${iconsHref}#menu`} />
        </svg>
      </summary>
      <DetailsPopup>
        <div className="flex flex-col">
          <HeaderMenuLink to={href("/docs")}>Docs</HeaderMenuLink>
          <HeaderMenuLink to="https://remix.run/blog">Blog</HeaderMenuLink>
        </div>
      </DetailsPopup>
    </DetailsMenu>
  );
}

function HeaderLink({
  className = "",
  href,
  svgId,
  label,
  svgSize,
  title,
}: {
  className?: string;
  href: string;
  svgId: string;
  label: string;
  svgSize: string;
  title?: string;
}) {
  let [width, height] = svgSize.split("x");

  return (
    <a
      href={href}
      className={cx(
        `hidden h-10 w-10 place-items-center text-black hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-50 md:grid`,
        className,
      )}
      title={title}
    >
      <span className="sr-only">{label}</span>
      <svg aria-hidden style={{ width: `${width}px`, height: `${height}px` }}>
        <use href={`${iconsHref}#${svgId}`} />
      </svg>
    </a>
  );
}

function NavMenuMobile() {
  let doc = useDoc();
  return (
    <div className="lg:hidden">
      <DetailsMenu className="group relative flex h-full flex-col">
        <summary
          tabIndex={0}
          className="_no-triangle flex cursor-pointer select-none items-center gap-2 border-b border-gray-50 bg-white px-2 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        >
          <div className="flex items-center gap-2">
            <svg aria-hidden className="h-5 w-5 group-open:hidden">
              <use href={`${iconsHref}#chevron-r`} />
            </svg>
            <svg aria-hidden className="hidden h-5 w-5 group-open:block">
              <use href={`${iconsHref}#chevron-d`} />
            </svg>
          </div>
          <div className="whitespace-nowrap font-bold">
            {doc ? doc.attrs.title : "Navigation"}
          </div>
        </summary>
        <div className="absolute h-[66vh] w-full overflow-auto overscroll-contain border-b bg-white p-2 pt-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 dark:shadow-black">
          <Menu />
        </div>
      </DetailsMenu>
    </div>
  );
}

function NavMenuDesktop() {
  return (
    <div
      className={cx(
        "sticky bottom-0 top-16 -ml-3 hidden w-[--nav-width] flex-col gap-3 self-start overflow-auto pb-10 pr-5 pt-5 lg:flex",
        // Account for the height of the top nav
        "h-[calc(100vh-var(--header-height))]",
      )}
    >
      <DocSearchSection />
      <div className="[&_*:focus]:scroll-mt-[6rem]">
        <Menu />
      </div>
    </div>
  );
}

function Menu() {
  let { menu } = useLoaderData<typeof loader>();

  return menu ? (
    <nav>
      <ul>
        {menu.map((category) => {
          // Technically we can have a category that has content (and thus
          // needs it's own link) _and_ has children, so needs to be a details
          // element. It's ridiculous, but it's possible.
          const menuCategoryType = category.hasContent
            ? category.children.length > 0
              ? "linkAndDetails"
              : "link"
            : "details";

          return (
            <li key={category.attrs.title} className="mb-3">
              {menuCategoryType === "link" ? (
                <MenuSummary as="div">
                  <MenuCategoryLink to={category.slug}>
                    {category.attrs.title}
                  </MenuCategoryLink>
                </MenuSummary>
              ) : (
                <MenuCategoryDetails className="group" slug={category.slug}>
                  <MenuSummary>
                    {menuCategoryType === "linkAndDetails" ? (
                      <MenuCategoryLink to={category.slug}>
                        {category.attrs.title}
                      </MenuCategoryLink>
                    ) : (
                      category.attrs.title
                    )}
                    <svg aria-hidden className="h-5 w-5 group-open:hidden">
                      <use href={`${iconsHref}#chevron-r`} />
                    </svg>
                    <svg
                      aria-hidden
                      className="hidden h-5 w-5 group-open:block"
                    >
                      <use href={`${iconsHref}#chevron-d`} />
                    </svg>
                  </MenuSummary>
                  {category.children.map((doc) => {
                    return (
                      <MenuLink key={doc.slug} to={doc.slug}>
                        {doc.attrs.title} {doc.attrs.new && "🆕"}
                      </MenuLink>
                    );
                  })}
                </MenuCategoryDetails>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  ) : (
    <div className="bold text-gray-300">Failed to load menu</div>
  );
}

let MenuCategoryContext = React.createContext<{ isOpen: boolean }>({
  isOpen: false,
});

type MenuCategoryDetailsType = {
  className?: string;
  slug: string;
  children: React.ReactNode;
};

function MenuCategoryDetails({
  className,
  slug,
  children,
}: MenuCategoryDetailsType) {
  const isActivePath = useIsActivePath(slug);
  // By default only the active path is open
  const [isOpen, setIsOpen] = React.useState(isActivePath);

  // Auto open the details element, useful when navigating from the home page
  React.useEffect(() => {
    if (isActivePath) {
      setIsOpen(true);
    }
  }, [isActivePath]);

  return (
    <MenuCategoryContext.Provider value={{ isOpen }}>
      <details
        className={cx(className, "relative flex cursor-pointer flex-col")}
        open={isOpen}
        onToggle={(e) => {
          // Synchronize the DOM's state with React state to prevent the
          // details element from being closed after navigation and re-evaluation
          // of useIsActivePath
          setIsOpen(e.currentTarget.open);
        }}
      >
        {children}
      </details>
    </MenuCategoryContext.Provider>
  );
}

// This components attempts to keep all of the styles as similar as possible
function MenuSummary({
  children,
  as = "summary",
}: {
  children: React.ReactNode;
  as?: "summary" | "div";
}) {
  const sharedClassName =
    "rounded-2xl px-3 py-3 transition-colors duration-100";
  const wrappedChildren = (
    <div className="flex h-5 w-full items-center justify-between text-base font-semibold leading-[1.125]">
      {children}
    </div>
  );

  if (as === "summary") {
    return (
      <summary
        className={cx(
          sharedClassName,
          "_no-triangle block select-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800 dark:focus-visible:ring-gray-100",
          "hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-700",
        )}
      >
        {wrappedChildren}
      </summary>
    );
  }

  return (
    <div
      className={cx(
        sharedClassName,
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-blue-800 dark:has-[:focus-visible]:ring-gray-100",
      )}
    >
      {wrappedChildren}
    </div>
  );
}

function MenuCategoryLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  let isActive = useIsActivePath(to);

  return (
    <Link
      prefetch="intent"
      to={to}
      className={cx(
        "outline-none focus-visible:text-blue-brand dark:focus-visible:text-blue-400",
        isActive
          ? "text-blue-brand dark:text-blue-brand"
          : "hover:text-blue-brand dark:hover:text-blue-400",
      )}
    >
      {children}
    </Link>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  // Only discover expanded links to keep manifest calls to a reasonable URL length
  let { isOpen } = React.useContext(MenuCategoryContext);
  let isActive = useIsActivePath(to);
  return (
    <Link
      discover={isOpen ? "render" : "none"}
      prefetch="intent"
      to={to}
      className={cx(
        "group relative my-px flex min-h-[2.25rem] items-center rounded-2xl border-transparent px-3 py-2 text-sm",
        "outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-800 dark:focus-visible:ring-gray-100",
        isActive
          ? ["text-black dark:text-gray-100", "bg-blue-200 dark:bg-blue-800"]
          : [
              "text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-gray-100",
              "hover:bg-blue-100 dark:hover:bg-blue-800/50",
            ],
      )}
      children={children}
    />
  );
}

function EditLink() {
  let doc = useDoc();
  if (!doc) {
    return null;
  }

  let repoUrl = "https://github.com/remix-run/remix-v2-website";
  let editUrl = `${repoUrl}/edit/main/data/${doc.slug}.md`;

  return (
    <a className="flex items-center gap-1 hover:underline" href={editUrl}>
      Edit
      <svg aria-hidden className="h-4 w-4">
        <use href={`${iconsHref}#edit`} />
      </svg>
    </a>
  );
}

function InnerContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-auto px-4 sm:px-6 lg:px-8 xl:max-w-[90rem]">
      {children}
    </div>
  );
}

function hasDoc(data: unknown): data is { doc: Doc } {
  return !!data && typeof data === "object" && "doc" in data;
}

function useDoc(): Doc | null {
  let data = useMatches().at(-1)?.data;
  if (!hasDoc(data)) return null;
  return data.doc;
}

function useIsActivePath(to: string) {
  let { pathname } = useResolvedPath(to);
  let navigation = useNavigation();
  let currentLocation = useLocation();
  let navigating =
    navigation.state === "loading" && navigation.formData == null;
  let location = navigating ? navigation.location! : currentLocation;
  let match = matchPath(pathname + "/*", location.pathname);
  return Boolean(match);
}

function useCodeBlockCopyButton(ref: React.RefObject<HTMLDivElement>) {
  let location = useLocation();
  React.useEffect(() => {
    let container = ref.current;
    if (!container) return;

    let codeBlocks = container.querySelectorAll(
      "[data-code-block][data-lang]:not([data-nocopy])",
    );
    let buttons = new Map<
      HTMLButtonElement,
      { listener: (event: MouseEvent) => void; to: number }
    >();

    for (const codeBlock of codeBlocks) {
      let button = document.createElement("button");
      let label = document.createElement("span");
      button.type = "button";
      button.dataset.codeBlockCopy = "";
      button.addEventListener("click", listener);

      label.textContent = "Copy code to clipboard";
      label.classList.add("sr-only");
      button.appendChild(label);
      codeBlock.appendChild(button);
      buttons.set(button, { listener, to: -1 });

      function listener(event: MouseEvent) {
        event.preventDefault();
        let pre = codeBlock.querySelector("pre");
        let text = pre?.textContent;
        if (!text) return;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            button.dataset.copied = "true";
            let to = window.setTimeout(() => {
              window.clearTimeout(to);
              if (button) {
                button.dataset.copied = undefined;
              }
            }, 3000);
            if (buttons.has(button)) {
              buttons.get(button)!.to = to;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
    return () => {
      for (let [button, props] of buttons) {
        button.removeEventListener("click", props.listener);
        button.parentElement?.removeChild(button);
        window.clearTimeout(props.to);
      }
    };
  }, [ref, location.pathname]);
}
