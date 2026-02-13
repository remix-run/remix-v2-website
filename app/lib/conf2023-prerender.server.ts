/**
 * Minimal module for prerender config only. Fetches 2023 speaker slugs from
 * Sessionize without pulling in app dependencies (e.g. ~/ui/primitives/utils).
 */

const SESSIONIZE_ENDPOINT = "https://sessionize.com/api/v2/s8ds2hnu";

function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .join("-");
}

function getNameFull(speaker: {
  firstName?: string;
  lastName?: string;
  questionAnswers?: Array<{ question: string; answer: string }>;
}): string {
  let preferredName = speaker.questionAnswers?.find(
    (qa) => qa.question === "Preferred Name",
  )?.answer;
  let nameLast = speaker.lastName ? String(speaker.lastName).trim() : "";
  let nameFirst: string;
  if (preferredName) {
    nameFirst = preferredName.includes(nameLast)
      ? preferredName.slice(0, preferredName.indexOf(nameLast)).trim()
      : preferredName.trim();
  } else {
    nameFirst = speaker.firstName ? String(speaker.firstName).trim() : "";
  }
  return [nameFirst, nameLast].filter(Boolean).join(" ");
}

export async function getConf2023SpeakerPaths(): Promise<string[]> {
  try {
    let res = await fetch(`${SESSIONIZE_ENDPOINT}/view/Speakers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Sessionize responded ${res.status}`);
    let json: unknown = await res.json();
    if (!json || !Array.isArray(json)) throw new Error("Expected array");
    return json.map((s: { firstName?: string; lastName?: string; questionAnswers?: Array<{ question: string; answer: string }> }) => {
      let nameFull = getNameFull(s);
      return `/conf/2023/speakers/${slugify(nameFull)}`;
    });
  } catch (err) {
    console.warn(
      "[prerender] Could not fetch 2023 speakers from Sessionize; skipping speaker pages:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
