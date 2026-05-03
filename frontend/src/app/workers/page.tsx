import { Shell } from "@/components/Shell";
import { WorkersClient } from "./WorkersClient";
import { LOTS } from "@/lib/data";

export default function WorkersPage() {
  return (
    <Shell>
      <WorkersClient lots={LOTS} />
    </Shell>
  );
}
