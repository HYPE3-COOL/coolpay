import React from "react";

import '@mantine/core/styles.css';
import "../styles/icomoon.css";
import "../styles/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html >
  );
}
