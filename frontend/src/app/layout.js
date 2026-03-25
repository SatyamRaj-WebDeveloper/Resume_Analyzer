import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Initialize the new, premium font
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'AI Resume Pro',
  description: 'Optimize your resume for the ATS.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply the font globally to the entire body */}
      <body className={`${jakarta.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}