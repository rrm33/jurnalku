import "./globals.css";

export const metadata = {
  title: "Jurnal Mengajar",
  description: "Aplikasi Jurnal Mengajar",
  manifest: "/manifest.json",
  themeColor: "#0ea5e9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="apple-touch-icon" href="/globe.svg" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
