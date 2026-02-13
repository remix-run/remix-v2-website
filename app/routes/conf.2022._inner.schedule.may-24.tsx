import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "May 24th at Remix Conf" },
    {
      name: "description",
      content: "May 24th is The Workshop and Welcome day at Remix.",
    },
  ];
};

export default function May24Schedule() {
  return (
    <div>
      <p>
        This is the day before the big event. We&apos;ll be holding two{" "}
        <Link className="underline" to="../workshops">
          workshops
        </Link>{" "}
        as well as a welcome reception, both at the{" "}
        <Link className="underline" to="../venue">
          Venue
        </Link>
        . Come hang out with fellow Remix attendees, grab a snack, and get
        registered to avoid the morning lines!
      </p>
      <table className="mt-10 w-full border-collapse">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-3">10:00am - 4:00pm</td>
            <td className="border p-3">
              <Link className="underline" to="../workshops">
                Workshops
              </Link>
            </td>
          </tr>
          <tr>
            <td className="border p-3">6:00pm - 9:00pm</td>
            <td className="border p-3">Welcome Reception</td>
          </tr>
          <tr>
            <td className="border p-3">6:00pm - 9:00pm</td>
            <td className="border p-3">
              &quot;Hack && Hang&quot; with Cockroach Labs and Netlify
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-10">
        <small>
          During the welcome reception, we will be recording the talks of all
          backup speakers. We&apos;re still deciding whether you&apos;ll be
          invited to attend those talks, but you&apos;ll definitely be able to
          watch them after the conference!
        </small>
      </div>
    </div>
  );
}
