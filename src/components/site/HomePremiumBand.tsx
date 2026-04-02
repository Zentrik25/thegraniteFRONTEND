// HomePremiumBand is intentionally minimal — the BBC homepage
// does not use a dark featured band. This component renders nothing
// and is kept for import compatibility with page.tsx.

interface HomePremiumBandProps {
  articles: unknown[];
  label?: string;
  href?: string;
}

export function HomePremiumBand(_props: HomePremiumBandProps) {
  return null;
}
