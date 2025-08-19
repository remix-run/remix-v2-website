import { Outlet } from "react-router";
import { DocSearchModal } from "~/ui/docsearch";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export default function ExtrasLayout() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <DocSearchModal />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
