import "../styles/theme.css";
import "../styles/output.css"
import "../styles/index.scss"
import { ThemeProvider, moonDesignLight } from "@heathmont/moon-themes"
import { SnackbarProvider } from "notistack"

function MyApp({ Component, pageProps }) {
	return (
		<SnackbarProvider anchorOrigin={{
			vertical: 'top',
			horizontal: 'right',
		  }} maxSnack={3}>
			<ThemeProvider theme={moonDesignLight}>
				<Component {...pageProps} />
			</ThemeProvider>
		</SnackbarProvider>
	)
}

export default MyApp
