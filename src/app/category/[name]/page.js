"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function CategoryPage({ params }) {
  const { name } = use(params);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles?category=${name}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [name]);

  if (loading) return <div className="container" style={{padding:'100px 0'}}>Loading category...</div>;

  return (
    <div className="container animate-fade" style={{marginTop:'40px'}}>
      <nav style={breadcrumb}>
        <Link href="/">Home</Link> &raquo; 
        <span>{name}</span>
      </nav>

      <h1 style={titleStyle}>{name}</h1>
      <p style={subTitle}>All articles and guides related to {name.toLowerCase()}.</p>

      <div style={articleGrid}>
        {articles.length > 0 ? (
          articles.map(art => (
            <div key={art.id} className="card" style={artCard}>
              <h3 style={{fontSize:'1.3rem', marginBottom:'10px'}}>{art.title}</h3>
              <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'20px'}}>{art.summary}</p>
              <Link href={`/article/${art.id}`} style={readMore}>Read Article &rarr;</Link>
            </div>
          ))
        ) : (
          <p>No articles found in this category.</p>
        )}
      </div>
    </div>
  );
}

const breadcrumb = { fontSize: '0.85rem', color: '#666', marginBottom: '30px', display: 'flex', gap: '8px' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-blue)' };
const subTitle = { fontSize: '1.2rem', color: '#666', marginBottom: '50px' };
const articleGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' };
const artCard = { display: 'flex', flexDirection: 'column' };
const readMore = { fontWeight: '600', color: 'var(--primary-blue)', marginTop: 'auto' };
