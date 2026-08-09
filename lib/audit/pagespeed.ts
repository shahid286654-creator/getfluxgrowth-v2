import "server-only";

// Thin client for Google's PageSpeed Insights v5 API. Works without an
// API key (Google's shared unauthenticated quota), but honors
// GOOGLE_PAGESPEED_API_KEY if set for higher/more reliable quota.
//
// Only categories Lighthouse can genuinely measure are surfaced here --
// there is no automated signal for "calls to action" or "trust signals",
// so those stay manual-entry-only in the UI rather than being faked.

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

type LighthouseAudit = {
  score: number | null;
  scoreDisplayMode?: string;
  title?: string;
};

type LighthouseCategory = {
  score: number | null;
  auditRefs?: { id: string }[];
};

type PageSpeedResponse = {
  lighthouseResult?: {
    categories?: Record<string, LighthouseCategory>;
    audits?: Record<string, LighthouseAudit>;
  };
  error?: { message?: string };
};

export type PageSpeedStrategyResult = {
  performanceScore: number | null;
  performanceIssues: string[];
  accessibilityScore: number | null;
  accessibilityIssues: string[];
  bestPracticesScore: number | null;
  bestPracticesIssues: string[];
  seoScore: number | null;
  seoIssues: string[];
  speedIndexScore: number | null;
};

function collectFailingAudits(
  auditRefs: { id: string }[] | undefined,
  audits: Record<string, LighthouseAudit>
): string[] {
  if (!auditRefs) return [];
  return auditRefs
    .map((ref) => audits[ref.id])
    .filter(
      (audit): audit is LighthouseAudit & { title: string } =>
        Boolean(audit) &&
        typeof audit.score === "number" &&
        audit.score < 0.9 &&
        audit.scoreDisplayMode !== "notApplicable" &&
        audit.scoreDisplayMode !== "informative" &&
        Boolean(audit.title)
    )
    .map((audit) => audit.title)
    .slice(0, 6);
}

async function fetchPageSpeed(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<PageSpeedStrategyResult> {
  const params = new URLSearchParams({ url, strategy });
  params.append("category", "performance");
  params.append("category", "accessibility");
  params.append("category", "best-practices");
  params.append("category", "seo");

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY?.trim();
  if (apiKey) params.set("key", apiKey);

  let res: Response;
  try {
    res = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    throw new Error("Couldn't reach PageSpeed Insights. Check your network connection and try again.");
  }

  const json = (await res.json().catch(() => null)) as PageSpeedResponse | null;

  if (!res.ok) {
    throw new Error(json?.error?.message ?? `PageSpeed request failed (${res.status}).`);
  }

  const lighthouse = json?.lighthouseResult;
  if (!lighthouse) {
    throw new Error("PageSpeed returned no result for this URL. Double-check it's publicly reachable.");
  }

  const categories = lighthouse.categories ?? {};
  const audits = lighthouse.audits ?? {};

  const toScore = (ratio: number | null | undefined) =>
    typeof ratio === "number" ? Math.round(ratio * 100) : null;

  return {
    performanceScore: toScore(categories.performance?.score),
    performanceIssues: collectFailingAudits(categories.performance?.auditRefs, audits),
    accessibilityScore: toScore(categories.accessibility?.score),
    accessibilityIssues: collectFailingAudits(categories.accessibility?.auditRefs, audits),
    bestPracticesScore: toScore(categories["best-practices"]?.score),
    bestPracticesIssues: collectFailingAudits(categories["best-practices"]?.auditRefs, audits),
    seoScore: toScore(categories.seo?.score),
    seoIssues: collectFailingAudits(categories.seo?.auditRefs, audits),
    speedIndexScore: toScore(audits["speed-index"]?.score),
  };
}

export async function runPageSpeedAudit(url: string) {
  const [desktop, mobile] = await Promise.all([
    fetchPageSpeed(url, "desktop"),
    fetchPageSpeed(url, "mobile"),
  ]);

  return { desktop, mobile };
}
