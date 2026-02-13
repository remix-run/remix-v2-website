import { Link, Outlet, useLocation } from "react-router";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Conf Schedule" },
    { name: "description", content: "What's happening and when at Remix Conf" },
  ];
};

const days: Array<{ name: string; slug: string; displayDate: string }> = [
  { name: "Workshops", slug: "may-24", displayDate: "May 24th" },
  { name: "Conference", slug: "may-25", displayDate: "May 25th" },
  { name: "Activities", slug: "may-26", displayDate: "May 26th" },
];

export default function Schedule() {
  let location = useLocation();
  let pathname = location.pathname;
  let currentDay = pathname.split("/").pop() ?? "may-25";

  return (
    <div className="text-white">
      <h1 className="font-display mb-16 text-3xl font-extrabold sm:text-5xl xl:text-7xl">
        Remix Conf Schedule
      </h1>
      <div className="container flex flex-col gap-10 text-lg lg:text-xl">
        <p>Get ready for some amazing UX/DX goodness at Remix Conf!</p>

        <nav className="flex flex-wrap justify-around gap-2 border-b border-white pb-4">
          {days.map(({ name, slug, displayDate }) => (
            <Link
              key={slug}
              to={slug}
              prefetch="intent"
              className={`block w-full rounded px-4 py-2 text-center lg:w-auto ${
                currentDay === slug
                  ? "bg-white text-blue-800 font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="hidden lg:inline">{displayDate}: </span>
              {name}
            </Link>
          ))}
        </nav>

        <div className="my-8 md:my-12 xl:my-14">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
