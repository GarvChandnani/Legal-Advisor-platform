"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function ArticlePage({ params }) {
  const { id } = use(params);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container" style={{padding:'100px 0'}}>Loading article...</div>;
  if (!article) return <div className="container" style={{padding:'100px 0'}}>Article not found.</div>;

  return (
    <div className="container animate-fade" style={{marginTop:'40px'}}>
      <nav style={breadcrumb}>
        <Link href="/">Home</Link> &raquo; 
        <Link href={`/category/${article.category}`}>{article.category}</Link> &raquo; 
        <span>{article.title}</span>
      </nav>

      <div style={articleLayout}>
        {/* Main Content */}
        <article style={mainArticle}>
          <span style={categoryLabel}>{article.category}</span>
          <h1 style={titleStyle}>{article.title}</h1>
          
          <div style={summaryBox}>
            <strong>Summary:</strong> {article.summary}
          </div>

          <div style={contentSection}>
            <h2>Overview</h2>
            <p>{article.content}</p>
          </div>

          {article.steps && (
            <div style={stepSection}>
              <h2>Step-by-Step Guide</h2>
              <ul style={stepList}>
                {article.steps.map((step, i) => (
                  <li key={i} style={stepItem}>
                    <div style={counter}>{i + 1}</div>
                    <div>{step}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={disclaimerBox}>
            This information is for educational purposes only and does not constitute official legal advice.
          </div>
        </article>

        {/* Sidebar */}
        <aside style={sidebar}>
          <div className="card" style={{position:'sticky', top:'100px'}}>
            <h3 style={{marginBottom:'15px', color:'var(--primary-blue)'}}>Related Articles</h3>
            <div style={relatedList}>
              {article.related && article.related.length > 0 ? (
                article.related.map(rel => (
                  <Link href={`/article/${rel.id}`} key={rel.id} style={relatedItem}>
                    <strong>{rel.title}</strong>
                    <p style={{fontSize:'0.75rem', color:'#666'}}>{rel.category}</p>
                  </Link>
                ))
              ) : (
                <p style={{fontSize:'0.85rem', color:'#888'}}>No related articles found.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Styles
const breadcrumb = { fontSize: '0.85rem', color: '#666', marginBottom: '30px', display: 'flex', gap: '8px' };
const articleLayout = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '40px' };
const mainArticle = { backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: 'var(--shadow-sm)' };
const categoryLabel = { color: 'var(--saffron)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-blue)', margin: '15px 0' };
const summaryBox = { backgroundColor: '#f0f5fa', padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--primary-blue)', margin: '30px 0', fontSize: '1.1rem', fontStyle: 'italic' };
const contentSection = { fontSize: '1.1rem', color: '#444', lineHeight: '1.8' };
const stepSection = { marginTop: '40px' };
const stepList = { marginTop: '20px', padding: 0 };
const stepItem = { display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' };
const counter = { 
  minWidth: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', 
  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
};
const disclaimerBox = { marginTop: '60px', padding: '20px', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#999', textAlign: 'center' };

const sidebar = { display: 'flex', flexDirection: 'column', gap: '20px' };
const relatedList = { display: 'flex', flexDirection: 'column', gap: '15px' };
const relatedItem = { display: 'block', padding: '10px 0', borderBottom: '1px solid #eee' };
