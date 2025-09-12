"use client";

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function LayoutShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAdmin = pathname?.startsWith('/admin');

	if (isAdmin) {
		// No Header/Footer on admin, full-bleed content
		return <>{children}</>;
	}

	return (
		<>
			<Header />
			<main className="pt-32 overflow-x-hidden">
				{children}
			</main>
			<Footer />
		</>
	);
}
