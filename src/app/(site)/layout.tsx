import { NewsSiteShell } from "@/components/NewsSiteShell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <NewsSiteShell>{children}</NewsSiteShell>;
}
