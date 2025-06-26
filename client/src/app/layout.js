import ReduxProvider from "@/components/providers/ReduxProvider";
import "./globals.css";

export const metadata = {
  title: "HR System App",
  description: "نظام إدارة الموارد البشرية ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
