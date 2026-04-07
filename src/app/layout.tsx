import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata = {
  title: "ClickUp Clone",
  description: "A project management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
