
import "../styles/theme.css";
import "../styles/output.css";
import "../styles/index.scss";
import { ThemeProvider } from 'next-themes'
import {SnackbarProvider} from "notistack";
import {PolkadotProvider} from "../contexts/PolkadotContext";

function MyApp({Component, pageProps}) {
	return (
		<SnackbarProvider anchorOrigin={{vertical: "top", horizontal: "right"}} maxSnack={5}  autoHideDuration={3000} >
			<PolkadotProvider>
				<ThemeProvider defaultTheme={"dark"} enableColorScheme={false} attribute="class" enableSystem={false}>
					<Component {...pageProps} />
				</ThemeProvider>
			</PolkadotProvider>
		</SnackbarProvider>
	);
}

export default MyApp;

