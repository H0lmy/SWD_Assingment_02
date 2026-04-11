import './styles/index.css'

export const metadata = {
  title: 'SWD Assignment 01',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
