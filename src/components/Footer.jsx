export default function Footer() {
  return (
    <footer className="site-footer">

      <nav className="footer-nav">
        <a href="#/" className="footer-link">Home</a>
        <span className="dot">•</span>
        <a href="#/contact" className="footer-link">Contact</a>
      </nav>

      <div className="footer-center">
      <span className="madeby">Made with <span className="heart"> ❤ </span> by Anurag.</span>
      </div>

      <div className="footer-right">
      <button className="icon-btn" aria-label="Twitter" title="Twitter (to be linked)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.87-2.36 8.53 8.53 0 0 1-2.7 1.03 4.25 4.25 0 0 0-7.24 3.88A12.06 12.06 0 0 1 3.16 4.9a4.24 4.24 0 0 0 1.32 5.66 4.2 4.2 0 0 1-1.92-.53v.06a4.25 4.25 0 0 0 3.41 4.17c-.46.12-.95.18-1.45.07a4.25 4.25 0 0 0 3.97 2.95A8.53 8.53 0 0 1 2 19.54 12.05 12.05 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.33 8.33 0 0 0 22.46 6Z"/>
          </svg>
        </button>
      <button className="icon-btn" aria-label="GitHub" title="GitHub (to be linked)">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.23 3.39 9.66 8.1 11.23.6.12.82-.26.82-.58v-2.2c-3.3.73-4-1.43-4-1.43-.55-1.43-1.34-1.81-1.34-1.81-1.1-.76.08-.74.08-.74 1.22.08 1.86 1.28 1.86 1.28 1.08 1.86 2.84 1.33 3.54 1.02.1-.8.42-1.34.76-1.64-2.64-.3-5.42-1.36-5.42-6.03 0-1.33.47-2.42 1.25-3.27-.13-.3-.54-1.52.12-3.18 0 0 1.01-.33 3.3 1.25a11.4 11.4 0 0 1 6 0c2.3-1.58 3.3-1.25 3.3-1.25.66 1.66.25 2.88.12 3.18.78.85 1.25 1.94 1.25 3.27 0 4.68-2.78 5.72-5.43 6.02.44.38.82 1.12.82 2.27v3.36c0 .32.22.71.83.58A11.51 11.51 0 0 0 23.5 12.3 11.5 11.5 0 0 0 12 .5Z"/>
        </svg>
      </button>
      </div>
    </footer>
  )
}


