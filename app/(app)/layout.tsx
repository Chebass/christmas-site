import AppHeader from "@/components/AppHeader";
import { NavigationProvider } from "@/components/NavigationProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider header={<AppHeader />}>{children}</NavigationProvider>
  );
}
