import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drinks da 20210 - Arraiá IFMS",
  description: "Sistema de pedidos para a barraca de drinks da turma 20210 - Arraiá IFMS",
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: '500x500',
        type: 'image/png',
      },
      {
        url: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon.png',
        sizes: '16x16',
        type: 'image/png',
      }
    ],
    shortcut: ['/favicon.png'],
    apple: [
      {
        url: '/favicon.png',
        sizes: '500x500',
        type: 'image/png',
      }
    ],
    other: [
      {
        rel: 'icon',
        url: '/favicon.png',
      }
    ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
