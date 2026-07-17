import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/client";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "مدرسة جمال عبدالناصر العسكرية الثانوية بنين",
  description: "نظام إدارة المدرسة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={cn("h-full", "antialiased ", notoKufiArabic.className, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <TRPCReactProvider>
          {children}
          <Toaster richColors position="top-center" dir="rtl" />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
