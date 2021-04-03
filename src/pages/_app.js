import { createGlobalStyle, css, ThemeProvider } from 'styled-components';

const GlobalStyle = createGlobalStyle(css`
	* {
		box-sizing: border-box;
	}

	body {
		margin: 0;
		padding: 16px;
		min-width: 512px;
		max-width: 640px;

		background-color: #fdeded;

		font-family: sans-serif;
		font-size: 14pt;
	}

	button,
	input,
	textarea {
		font-family: inherit;
		font-size: inherit;
	}
`);

const theme = {
	colors: {
		primary: '#0070f3',
	},
};

export default function App({ Component, pageProps }) {
	return (
		<>
			<GlobalStyle />
			<ThemeProvider theme={theme}>
				<Component {...pageProps} />
			</ThemeProvider>
		</>
	);
}
