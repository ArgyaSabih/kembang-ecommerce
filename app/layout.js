import "@/styles/globals.css";
import {GeistBold, GeistRegular, GeistSemiBold, GloockRegular} from "@/utils/fontHelper";

export const metadata = {
  title: "Kembangku",
  description: "Tugas Pengembangan Aplikasi Basis Data",
  icons: "/assets/logo-36x36.png"
};

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body
        className={`${GeistBold.variable} ${GeistRegular.variable} ${GeistSemiBold.variable} ${GloockRegular.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
