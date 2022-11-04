import 'tailwindcss/tailwind.css'
import '../styles.css'
import { ThemeProvider } from 'next-themes'
import Web3Provider from '@/components/Web3Provider'
import Layout from '../components/Layout'

const App = ({ Component, pageProps }) => {
	return (
		<ThemeProvider attribute="class" enableSystem={false} defaultTheme={'dark'}>
			<Web3Provider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
			</Web3Provider>
		</ThemeProvider>
	)
}

export default App
