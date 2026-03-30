export const mdxInitialCode = `@_mdx_@;
import { useState } from 'react';

export const title = "SomMark MDX Showcase";

export function Counter({ style }) {
	const [count, setCount] = useState(0);
	const cardStyle = {
		padding: '2.5rem', 
		borderRadius: '2rem', 
		background: '#ffffff',
		border: '1px solid #e2e8f0', 
		boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
		display: 'flex', 
		flexDirection: 'column', 
		alignItems: 'center', 
		gap: '2rem', 
		width: '100%', 
		maxWidth: '360px',
		margin: '0 auto',
		boxSizing: 'border-box',
		...style
	};
	const btnStyle = { 
		padding: '0 2rem', 
		height: '3.5rem', 
		borderRadius: '1rem', 
		background: '#2563eb', 
		color: 'white', 
		border: 'none', 
		fontSize: '0.9rem',
		fontWeight: '800', 
		cursor: 'pointer', 
		boxShadow: '0 10px 15px -3px rgba(37,99,235,0.4)',
		transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
	};
	const subBtnStyle = { 
		width: '3.5rem', 
		height: '3.5rem', 
		borderRadius: '1rem', 
		border: '1px solid #e2e8f0', 
		background: 'white', 
		fontSize: '1.25rem',
		fontWeight: 'bold', 
		color: '#475569',
		cursor: 'pointer',
		transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
	};

	return (
		<div style={cardStyle}>
			<div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Current Count</div>
			<div style={{ fontSize: 'min(15vw, 5.5rem)', fontWeight: '950', color: '#1e293b', letterSpacing: '-0.02em' }}>{count}</div>
			<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
				<button 
					onClick={() => setCount(c => Math.max(0, c - 1))} 
					style={subBtnStyle}
					onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
					onMouseOut={e => e.currentTarget.style.background = 'white'}
				>-</button>
				<button 
					onClick={() => setCount(c => c + 1)} 
					style={btnStyle}
					onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
					onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
				>INCREMENT</button>
			</div>
		</div>
	);
}

export const Alert = ({ type = 'info', style, children }) => {
	const variants = {
		info: { background: '#f0f9ff', border: '2px solid #0ea5e9', color: '#0c4a6e' },
		error: { background: '#fef2f2', border: '2px solid #ef4444', color: '#7f1d1d' }
	};
	return <div style={{ padding: '1.25rem 1.5rem', borderRadius: '1.25rem', marginBottom: '2rem', fontWeight: '600', fontSize: '1rem', lineHeight: '1.5', ...variants[type], ...style }}>{children}</div>;
}

export const Table = ({ children, style }) => (
  <div style={{ border: '1px solid #f1f5f9', borderRadius: '1.25rem', overflowX: 'auto', margin: '2rem 0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', backgroundColor: 'white', ...style }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
      {children}
    </table>
  </div>
);
export const THead = ({ children }) => <thead style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>{children}</thead>;
export const TBody = ({ children }) => <tbody style={{ background: '#ffffff' }}>{children}</tbody>;
export const TR = ({ children }) => <tr style={{ borderBottom: '1px solid #f1f5f9' }}>{children}</tr>;
export const TH = ({ children }) => <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.1em' }}>{children}</th>;
export const TD = ({ children }) => <td style={{ padding: '1rem 1.5rem', color: '#444', fontSize: '0.9rem' }}>{children}</td>;

@_end_@

[div = style: "max-width: 900px; margin: 0 auto; padding: clamp(2rem, 8vw, 6rem) 1.5rem; font-family: -apple-system, system-ui, sans-serif;"]

[h1 = style: "font-size: clamp(2.5rem, 10vw, 5rem); font-weight: 950; letter-spacing: -0.06em; margin-bottom: 1.5rem; color: #0f172a; line-height: 1;"]
{title}
[end]

[Section = style: "display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: clamp(2rem, 5vw, 5rem); margin: 4rem 0; align-items: start;"]
	[div = style: "width: 100%; max-width: 360px; margin: 0 auto;"]
		[Counter][end]
	[end]
    [div]
		[h2 = style: "margin-top: 0; font-size: clamp(1.75rem, 6vw, 2.5rem); font-weight: 950; color: #0f172a; letter-spacing: -0.04em;"]Declarative Syntax[end]
		[p = style: "line-height: 1.7; color: #475569; font-size: 1.1rem;"](SomMark)->(bold) combines the simplicity of Markdown with the power of modern JS logic. Every block is a native citizen of your React application.[end]
		
		(Block-based Control)->(bold)
		(Live State Management)->(bold)
		(Zero-Dependency Styles)->(bold)
	[end]
[end]

[p = style: "font-size: clamp(1.1rem, 4vw, 1.75rem); color: #475569; margin-bottom: 4rem; line-height: 1.4; font-weight: 500;"]
(Structured Contents)->(bold) and (High-Order Logic)->(italic). 
Built for (Clarity)->(bold). Optimized for (Performance)->(bold).
[end]

[Alert = type: info, style: "box-shadow: 0 15px 20px -5px rgba(0,0,0,0.05);"]
(Key Feature)->(bold): SomMark abstracts away the verbosity of HTML/JSX, letting creators focus on content while developers focus on logic.
[end]

[h2 = style: "font-weight: 900; color: #0f172a; font-size: clamp(1.5rem, 5vw, 2rem); margin-bottom: 1.5rem;"]Direct Mapping Engine[end]

[Table]
  [THead]
    [TR]
      [TH]Capability[end]
      [TH]SomMark Implementation[end]
      [TH]Benefit[end]
    [end]
  [end]
  [TBody]
    [TR]
      [TD]Custom UI[end]
      [TD]Nested React Blocks[end]
      [TD]Infinite Extensibility[end]
    [end]
    [TR]
      [TD]Styling[end]
      [TD]Inline Attribute Mapping[end]
      [TD]Zero CSS Bloat[end]
    [end]
    [TR]
      [TD]Interop[end]
      [TD]Multi-Language Transpilation[end]
      [TD]Cross-platform Ready[end]
    [end]
  [end]
[end]

[Section = style: "margin-top: clamp(4rem, 10vw, 10rem); padding-top: 4rem; border-top: 3px solid #f8fafc; text-align: left; color: #cbd5e1; font-weight: 950; letter-spacing: 0.2rem; font-size: 0.75rem;"]
	[p]SOMMARK ENGINE • CONTENT-DRIVEN DESIGN[end]
[end]

[end]
`;
