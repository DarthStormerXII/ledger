import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { FloatingPostButton } from "./FloatingPostButton";
import { SurfaceController } from "./SurfaceController";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <SurfaceController />
      <Nav />
      {children}
      <Footer />
      <FloatingPostButton />
    </>
  );
}
