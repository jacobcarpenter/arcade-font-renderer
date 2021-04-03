import Head from 'next/head';
import { Editor } from '../components/Editor';

export default function Home() {
	return (
		<div>
			<Head>
				<title>arcade-font-renderer</title>
				<link rel="preconnect" href="https://fonts.gstatic.com" />
				{/* ensure default font load is initiated before promise is awaited */}
				<link
					href="https://fonts.googleapis.com/css2?family=Audiowide&amp;display=swap"
					rel="stylesheet"
				/>
			</Head>

			<Editor />
		</div>
	);
}
