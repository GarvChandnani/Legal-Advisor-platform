import "./globals.css";
import Header from "../components/Header";
import LawBot from "../components/LawBot";

export const metadata = {
  title: "Legal Advisor App | Official Indian Law Portal",
  description: "Simplified legal, tax, and business information for Indian citizens powered by NLP.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          {children}
        </main>
        <footer style={footerStyle}>
          <div className="container">
            <div style={footerGrid}>
              <div>
                <h3>Legal Advisor</h3>
                <p>Digital India initiative to simplify legal complexities.</p>
              </div>
              <div>
                <h4>Categories</h4>
                <ul style={{fontSize:'0.85rem', color:'#ccc'}}>
                  <li>Indian Laws</li>
                  <li>Taxation</li>
                  <li>Business Compliance</li>
                </ul>
              </div>
            </div>
            <div style={copyright}>
              &copy; 2026 Legal Advisor App. All rights reserved. 
              <br/>
              <span style={{color:'#888'}}>This application provides general legal information for educational purposes only.</span>
            </div>
          </div>
        </footer>
        <LawBot />
      </body>
    </html>
  );
}

const footerStyle = {
  backgroundColor: '#1a2b3c',
  color: 'white',
  padding: '60px 0 20px',
  marginTop: '80px',
};

const footerGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '40px',
  marginBottom: '40px',
  borderBottom: '1px solid #334455',
  paddingBottom: '40px',
};

const copyright = {
  textAlign: 'center',
  fontSize: '0.8rem',
  color: '#ccc',
};
