"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    fetch("/api/articles")
      .then(res => res.json())
      .then(data => setFeatured(data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      fetch(`/api/search?q=${q}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(err => console.error(err));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Hero Section */}
      <section style={heroSection}>
        <div className="container animate-fade">
          <h1 style={heroTitle}>Legal Clarity for Every Citizen</h1>
          <p style={heroSub}>Indian Laws, Taxation, and Business Compliance—Simplified by AI.</p>
          
          <div style={searchContainer}>
            <input 
              type="text" 
              placeholder="Search for articles, laws, or tax help..." 
              style={searchInput}
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchResults.length > 0 && (
              <div style={searchResultsBox}>
                {searchResults.map(res => (
                  <Link key={res.id} href={`/article/${res.id}`} style={searchResultItem}>
                    <div>
                      <strong>{res.title}</strong>
                      <p style={{fontSize:'0.8rem', color:'#666'}}>{res.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container" style={sectionMargin}>
        <h2 style={sectionTitle}>Explore by Category</h2>
        <div style={categoryGrid}>
          {categories.map(cat => (
            <Link href={`/category/${cat}`} key={cat} className="card" style={categoryCard}>
              <div style={iconPlaceholder}>{cat[0]}</div>
              <h3 style={{fontSize:'1.1rem'}}>{cat}</h3>
              <p style={{fontSize:'0.85rem', color:'#666', marginTop:'10px'}}>
                Learn about {cat.toLowerCase()} in simple language.
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="container" style={sectionMargin}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
          <h2 style={sectionTitle}>Featured Articles</h2>
          <Link href="/articles" style={{color:'var(--primary-blue)', fontWeight:600}}>View All &rarr;</Link>
        </div>
        <div style={featuredGrid}>
          {featured.map(art => (
            <div key={art.id} className="card" style={featuredCard}>
              <span style={categoryLabel}>{art.category}</span>
              <h3 style={artTitle}>{art.title}</h3>
              <p style={artSummary}>{art.summary}</p>
              <Link href={`/article/${art.id}`} style={readMore}>Read Guide &rarr;</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Styles
const pageStyle = { minHeight: '80vh' };
const heroSection = {
  background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)',
  color: 'white',
  padding: '100px 0',
  textAlign: 'center',
};
const heroTitle = { fontSize: '3rem', fontWeight: '800', marginBottom: '20px' };
const heroSub = { fontSize: '1.2rem', opacity: '0.9', marginBottom: '40px' };
const searchContainer = { maxWidth: '700px', margin: '0 auto', position: 'relative' };
const searchInput = { 
  width: '100%', padding: '20px 30px', borderRadius: '40px', border: 'none', 
  fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', outline: 'none'
};
const searchResultsBox = {
  position: 'absolute', top: '75px', left: '0', right: '0', backgroundColor: 'white',
  borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 10,
  textAlign: 'left', overflow: 'hidden', color: '#333'
};
const searchResultItem = { display: 'block', padding: '15px 25px', borderBottom: '1px solid #eee' };

const sectionMargin = { marginTop: '80px' };
const sectionTitle = { fontSize: '1.8rem', color: 'var(--primary-blue)', marginBottom: '30px' };
const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' };
const categoryCard = { textAlign: 'center', cursor: 'pointer' };
const iconPlaceholder = { 
  width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#eef2f6',
  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
  fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-blue)'
};

const featuredGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' };
const featuredCard = { display: 'flex', flexDirection: 'column', gap: '15px' };
const categoryLabel = { fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--saffron)' };
const artTitle = { fontSize: '1.3rem', fontWeight: '700' };
const artSummary = { fontSize: '0.95rem', color: 'var(--text-muted)' };
const readMore = { fontWeight: '600', color: 'var(--primary-blue)', marginTop: 'auto' };
