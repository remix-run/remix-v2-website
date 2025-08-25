import React from "react";
import { Outlet } from "react-router";
import { DocSearchModal } from "~/ui/docsearch";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export default function ExtrasLayout() {
  return (
    <Layout>
      <Outlet />
      <Footer />
    </Layout>
  );
}

// Force this layout HydrateFallback to render on initial load so we can
// eliminate the footer and avoid needing to fill height with a skeleton
export function clientLoader() {
  return null;
}
clientLoader.hydrate = true;

export function HydrateFallback() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <main>
        {show ? (
          <div className="container flex flex-1 flex-col items-center md:mt-8">
            <p>Loading resources....</p>
          </div>
        ) : null}
      </main>
    </Layout>
  );
}

function Layout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <div className="flex h-full flex-1 flex-col">
      <DocSearchModal />
      <Header />
      {children}
    </div>
  );
}
