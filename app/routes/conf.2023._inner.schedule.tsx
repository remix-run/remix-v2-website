import { NavLink, useLoaderData, useLocation } from "react-router";
import type { MetaFunction } from "react-router";
import { data } from "react-router";
import cx from "clsx";
import { formatDate, getSchedules } from "~/lib/conf2023.server";
import { slugify } from "~/ui/primitives/utils";

export async function loader() {
  let schedules: Awaited<ReturnType<typeof getSchedules>>;
  try {
    schedules = await getSchedules();
  } catch {
    schedules = [];
  }

  let formatter = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  });
  return data(
    {
      schedules: schedules
        .filter((s) => s.date != null)
        .map((schedule) => {
          let date = schedule.date!;
          return {
            ...schedule,
            dateSlug: slugify(
              formatDate(date, {
                month: "short",
                day: "numeric",
              }),
            ),
            dateISO: date.toISO(),
            dateFormatted: formatDate(date, {
              weekday: "long",
              month: "long",
              day: "numeric",
            }),
            dateFormattedShort: formatDate(date, {
              month: "short",
              day: "numeric",
            }),
            sessions: schedule.sessions.map((session) => {
            let startsAt = session.startsAt ? session.startsAt : null;
            let endsAt = session.endsAt ? session.endsAt : null;
            return {
              ...session,
              speakersFormatted: formatter.format(
                session.speakers.map((speaker) => speaker.nameFull),
              ) as string,
              startsAtISO: startsAt?.toISO() || null,
              startsAtFormatted: startsAt
                ? formatDate(startsAt, {
                    hour: "numeric",
                    minute: "numeric",
                    timeZone: "America/Denver",
                  })
                : null,
              endsAtISO: endsAt?.toISO() || null,
              endsAtFormatted: endsAt
                ? formatDate(endsAt, {
                    hour: "numeric",
                    minute: "numeric",
                    timeZone: "America/Denver",
                  })
                : null,
            };
          }),
        };
      }),
    },
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Conf Schedule" },
    { name: "description", content: "What's happening and when at Remix Conf" },
  ];
};

export default function Schedule() {
  let { schedules: days } = useLoaderData<typeof loader>();
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  let requestedDay = searchParams.get("date");
  let selectedDayIndex = days.findIndex(
    ({ dateSlug }) => dateSlug === requestedDay,
  );
  let activeIndex = selectedDayIndex === -1 ? 0 : selectedDayIndex;
  let activeDay = days[activeIndex];

  return (
    <div className="text-white">
      <h1 className="font-display mb-16 text-3xl font-extrabold sm:text-5xl xl:text-7xl">
        Remix Conf Schedule
      </h1>
      <div className="flex flex-col gap-10 text-lg lg:text-xl">
        <nav
          className="flex justify-around -mb-px"
          role="tablist"
          aria-label="Schedule days"
        >
          {days.map(({ dateSlug, dateFormatted, dateFormattedShort }, i) => (
            <NavLink
              key={dateSlug}
              to={{ search: `date=${dateSlug}` }}
              replace
              className={({ isActive }) =>
                cx(
                  "w-full whitespace-nowrap border-b-2 border-b-gray-800 px-4 py-2",
                  isActive && "border-b-pink-brand font-bold",
                )
              }
            >
              <div className="w-full">
                <div className="hidden md:block">{dateFormatted}</div>
                <div className="md:hidden">{dateFormattedShort}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="pt-10">
          {activeDay ? (
            <div>
              <table className="mt-10 w-full border-collapse">
                <thead className="sr-only">
                  <tr>
                    <th>Time</th>
                    <th>Speakers</th>
                    <th>Event</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody className="flex flex-col gap-6 md:gap-10">
                  {activeDay.sessions.map((session) => {
                    return (
                      <tr
                        key={session.id}
                        className="schedule-row grid flex-none items-start gap-x-3 gap-y-2 md:gap-x-5"
                      >
                        <td className="schedule-row-item schedule-row-item--time text-xs uppercase text-pink-300 md:text-sm">
                          <p className="md:mt-1 md:whitespace-nowrap">
                            <span>{session.startsAtFormatted}</span> –{" "}
                            <span>{session.endsAtFormatted}</span>
                          </p>
                        </td>
                        <td className="schedule-row-item schedule-row-item--img flex flex-wrap items-center justify-center gap-y-1 -space-x-4 md:-space-x-3">
                          {session.speakers.map((speaker, _, speakers) => {
                            let speakerInitials = [
                              speaker.nameFirst?.charAt(0),
                              speaker.nameLast?.charAt(0),
                            ]
                              .filter(Boolean)
                              .join("");
                            return (
                              <div
                                key={speaker.id}
                                className={cx(
                                  "flex items-center justify-center overflow-hidden rounded-full border-[1px] border-gray-600 bg-gray-800 text-center first:-ml-4 md:first:-ml-3",
                                  {
                                    "h-14 w-14 text-lg md:h-24 md:w-24 md:text-2xl":
                                      speakers.length === 1,
                                    "h-10 w-10 text-sm md:h-16 md:w-16 md:text-xl":
                                      speakers.length >= 2,
                                  },
                                )}
                              >
                                {speaker.imgUrl ? (
                                  <img
                                    src={speaker.imgUrl}
                                    alt=""
                                    className="object-contain object-center"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div
                                    aria-hidden
                                    className="font-bold uppercase"
                                  >
                                    {speakerInitials}
                                  </div>
                                )}
                                <span className="sr-only">
                                  Presented by {session.speakersFormatted}
                                </span>
                              </div>
                            );
                          })}
                        </td>
                        <td className="schedule-row-item schedule-row-item--heading flex flex-col">
                          <h3 className="text-lg font-bold md:text-xl">
                            {session.title}
                          </h3>
                          {session.speakersFormatted ? (
                            <span
                              aria-hidden
                              className="text-sm text-gray-300"
                            >
                              Presented by {session.speakersFormatted}
                            </span>
                          ) : null}
                        </td>
                        <td className="schedule-row-item schedule-row-item--description">
                          <div className="flex flex-col gap-2 text-base md:gap-4">
                            {session.description
                              ?.split(/[\n\r]/g)
                              .filter(Boolean)
                              .join("\n")
                              .split("\n")
                              .map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
