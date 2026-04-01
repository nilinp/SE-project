import type { Metadata } from "next";
import { K2D } from "next/font/google";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";

const k2d = K2D({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EMOO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col min-h-screen bg-(--bg)">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 pb-20 md:pb-0">
          {children}
        </div>
      </div>
      <div className="mt-16 md:mt-16">
        <Footer />
      </div>
    </main>
  );
}