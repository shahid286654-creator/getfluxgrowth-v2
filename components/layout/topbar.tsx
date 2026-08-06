import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar({
  name,
  email,
  avatarUrl,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <MobileNavSheet />
      <div className="flex-1" />
      <UserMenu name={name} email={email} avatarUrl={avatarUrl} />
    </header>
  );
}
