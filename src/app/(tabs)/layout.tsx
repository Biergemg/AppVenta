import SedeGate from "@/components/SedeGate";
import BottomNav from "@/components/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SedeGate>
      {children}
      <BottomNav />
    </SedeGate>
  );
}
