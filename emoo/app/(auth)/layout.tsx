export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="flex justify-center items-center min-h-screen">
        {children}
      </body>
    </html>
  );
}