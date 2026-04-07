import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
