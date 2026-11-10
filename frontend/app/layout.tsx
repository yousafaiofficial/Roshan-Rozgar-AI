import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Roshan Rozgar AI | Local skills, trusted connections', description: 'Find local skilled workers in Islamabad and Rawalpindi.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
