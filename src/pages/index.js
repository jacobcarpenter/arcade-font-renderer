import Head from 'next/head';
import { Editor } from '../components/Editor';

export default function Home() {
	return (
		<div>
			<Head>
				<title>arcade-font-renderer</title>
			</Head>

			<Editor />
		</div>
	);
}
