import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata = {
  title: "SARTHI – Digital Capacity Building & Learning Management Portal",
  description: "SARTHI – Digital Capacity Building & Learning Management Portal of India Meteorological Department (IMD), Ministry of Earth Sciences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-wf-site="68e8faad0906611bc5b881dc">
      <head>
        <link href="https://cdn.prod.website-files.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="/css/eduraflow-template.webflow.shared.b247299fc.css" rel="stylesheet" type="text/css" />
        <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon" />
        <link href="/images/app-icon.png" rel="apple-touch-icon" />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
