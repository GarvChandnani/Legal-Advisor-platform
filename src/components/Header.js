import Link from 'next/link';

const Header = () => {
  return (
    <header style={headerStyle}>
      <div className="container" style={topBar}>
        <div style={logoSection}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/800px-Emblem_of_India.svg.png" 
            alt="Emblem of India" 
            style={emblemStyle} 
          />
          <div style={brandText}>
            <h1 style={mainTitle}>LEGAL ADVISOR</h1>
            <p style={subTitle}>Government of India Information Portal</p>
          </div>
        </div>
        
        <nav style={navStyle}>
          <Link href="/">Home</Link>
          <Link href="/categories">Legal Categories</Link>
          <Link href="/about">About Task</Link>
          <div style={searchMini}>
            <input type="text" placeholder="Search laws, taxes..." style={inputStyle} />
          </div>
        </nav>
      </div>
      <div style={tricolorBar}></div>
    </header>
  );
};

const headerStyle = {
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
};

const topBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 'var(--header-height)',
};

const logoSection = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const emblemStyle = {
  height: '50px',
};

const brandText = {
  borderLeft: '1px solid #ddd',
  paddingLeft: '15px',
};

const mainTitle = {
  fontSize: '1.2rem',
  fontWeight: '800',
  color: 'var(--primary-blue)',
  letterSpacing: '1px',
};

const subTitle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: '600',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '25px',
  fontWeight: '600',
  fontSize: '0.9rem',
  color: 'var(--primary-blue)',
};

const tricolorBar = {
  height: '4px',
  background: 'linear-gradient(to right, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
};

const searchMini = {
  backgroundColor: '#f0f2f5',
  borderRadius: '20px',
  padding: '5px 15px',
};

const inputStyle = {
  border: 'none',
  background: 'transparent',
  outline: 'none',
  fontSize: '0.85rem',
};

export default Header;
