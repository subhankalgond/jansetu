'use client';

import { useEffect, useMemo, useState } from 'react';
import { schemes, services, type Scheme, type Service } from '@/lib/data';
import { supabase } from '@/lib/supabase';

type IconName = 'arrow' | 'search' | 'bookmark' | 'check' | 'chevron' | 'close' | 'menu' | 'globe' | 'user' | 'spark' | 'external' | 'shield' | 'document' | 'clock' | 'plus' | 'send';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></>,
    search: <><circle cx="11" cy="11" r="6.8"/><path d="m16.2 16.2 4.3 4.3"/></>,
    bookmark: <path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21L12 17.6 6.5 21V4.5Z"/>,
    check: <path d="m5 12.5 4.4 4.4L19 7.3"/>,
    chevron: <path d="m7 9 5 5 5-5"/>,
    close: <><path d="m6 6 12 12"/><path d="M18 6 6 18"/></>,
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    globe: <><circle cx="12" cy="12" r="8.5"/><path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z"/></>,
    user: <><circle cx="12" cy="8" r="3.2"/><path d="M5.2 20c.6-3.3 2.9-5 6.8-5s6.2 1.7 6.8 5"/></>,
    spark: <><path d="m12 3 1.2 5.8L19 10l-5.8 1.2L12 17l-1.2-5.8L5 10l5.8-1.2L12 3Z"/><path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z"/></>,
    external: <><path d="M14 5h5v5"/><path d="m19 5-8 8"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>,
    shield: <><path d="M12 3 19 6v5.2c0 4.5-2.8 7.9-7 9.8-4.2-1.9-7-5.3-7-9.8V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    document: <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h4M8 12h8M8 16h6"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    send: <><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z"/><path d="M10.1 13.9 21 3"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const translations = {
  English: { home: 'Home', schemes: 'Government schemes', services: 'Explore services', how: 'How it works', sign: 'Sign in', start: 'Get started', browse: 'Explore government services', benefits: 'Find my benefits' },
  हिन्दी: { home: 'होम', schemes: 'सरकारी योजनाएँ', services: 'सेवाएँ देखें', how: 'कैसे काम करता है', sign: 'साइन इन', start: 'शुरू करें', browse: 'सरकारी सेवाएँ देखें', benefits: 'मेरे लाभ खोजें' },
  ಕನ್ನಡ: { home: 'ಮುಖಪುಟ', schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', services: 'ಸೇವೆಗಳು', how: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', sign: 'ಸೈನ್ ಇನ್', start: 'ಪ್ರಾರಂಭಿಸಿ', browse: 'ಸರ್ಕಾರಿ ಸೇವೆಗಳನ್ನು ನೋಡಿ', benefits: 'ನನ್ನ ಪ್ರಯೋಜನಗಳನ್ನು ಹುಡುಕಿ' },
};

export default function Home() {
  const [language, setLanguage] = useState<keyof typeof translations>('English');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signedIn, setSignedIn] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'schemes' | 'services' | 'dashboard'>('home');
  const [schemeSearch, setSchemeSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; sources?: { label: string; url: string }[] }[]>([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [eligibilityStep, setEligibilityStep] = useState(0);
  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, string>>({});
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [trackedApps, setTrackedApps] = useState<{ name: string; ref: string; status: string }[]>([]);
  const t = translations[language];

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem('jansetu-saved') || '[]'));
      setTrackedApps(JSON.parse(localStorage.getItem('jansetu-tracker') || '[]'));
      setLanguage((localStorage.getItem('jansetu-language') as keyof typeof translations) || 'English');
    } catch { /* local storage is optional */ }
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  const navigate = (view: typeof activeView) => { setActiveView(view); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggleSaved = (id: string) => {
    if (!signedIn) { setAuthOpen(true); return; }
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next); localStorage.setItem('jansetu-saved', JSON.stringify(next));
  };
  const setLang = (value: keyof typeof translations) => { setLanguage(value); localStorage.setItem('jansetu-language', value); };
  const signOut = async () => { if (supabase) await supabase.auth.signOut(); setSignedIn(false); setActiveView('home'); };
  const filteredSchemes = useMemo(() => schemes.filter((scheme) => (category === 'All' || scheme.category === category) && `${scheme.name} ${scheme.description} ${scheme.tags.join(' ')}`.toLowerCase().includes(schemeSearch.toLowerCase())), [category, schemeSearch]);
  const filteredServices = useMemo(() => services.filter((service) => `${service.name} ${service.description} ${service.category}`.toLowerCase().includes(serviceSearch.toLowerCase())), [serviceSearch]);

  const askAssistant = async (preset?: string) => {
    const question = (preset || assistantInput).trim();
    if (!question || assistantLoading) return;
    setAssistantInput(''); setAssistantOpen(true); setMessages((old) => [...old, { role: 'user', text: question }]); setAssistantLoading(true);
    try {
      const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, language, context: messages.slice(-6) }) });
      const data = await response.json();
      setMessages((old) => [...old, { role: 'assistant', text: data.answer || 'I could not complete that request. Please try again.', sources: data.sources }]);
    } catch { setMessages((old) => [...old, { role: 'assistant', text: 'The assistant is temporarily unavailable. You can still browse verified services and schemes below.' }]); }
    finally { setAssistantLoading(false); }
  };

  return <main>
    <header className="site-header">
      <button className="brand" onClick={() => navigate('home')} aria-label="JanSetu AI home"><span className="brand-mark">ज</span><span><strong>JanSetu</strong><em>AI</em><small>जनसेतु</small></span></button>
      <nav className={`main-nav ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
        <button className={activeView === 'home' ? 'active' : ''} onClick={() => navigate('home')}>{t.home}</button>
        <button className={activeView === 'services' ? 'active' : ''} onClick={() => navigate('services')}>{t.services}</button>
        <button className={activeView === 'schemes' ? 'active' : ''} onClick={() => navigate('schemes')}>{t.schemes}</button>
        <button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>{t.how}</button>
        <div className="language-select"><Icon name="globe" size={16}/><select aria-label="Choose language" value={language} onChange={(e) => setLang(e.target.value as keyof typeof translations)}><option>English</option><option>हिन्दी</option><option>ಕನ್ನಡ</option></select><Icon name="chevron" size={14}/></div>
        <button className="nav-signin" onClick={() => signedIn ? navigate('dashboard') : (setAuthMode('signin'), setAuthOpen(true))}>{signedIn ? 'My account' : t.sign}</button>
        <button className="button button-dark button-small" onClick={() => signedIn ? navigate('dashboard') : (setAuthMode('signup'), setAuthOpen(true))}>{signedIn ? 'Dashboard' : t.start}<Icon name="arrow" size={16}/></button>
      </nav>
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation"><Icon name={mobileOpen ? 'close' : 'menu'} /></button>
    </header>

    {activeView === 'home' && <HomeView t={t} language={language} navigate={navigate} askAssistant={askAssistant} />}
    {activeView === 'schemes' && <DirectoryView kind="schemes" search={schemeSearch} setSearch={setSchemeSearch} category={category} setCategory={setCategory} items={filteredSchemes} onOpen={(item) => setSelectedScheme(item as Scheme)} onSave={toggleSaved} saved={saved} />}
    {activeView === 'services' && <DirectoryView kind="services" search={serviceSearch} setSearch={setServiceSearch} items={filteredServices} onOpen={(item) => setSelectedService(item as Service)} />}
    {activeView === 'dashboard' && <Dashboard saved={saved} onOpenScheme={(item) => setSelectedScheme(item)} onSave={toggleSaved} trackedApps={trackedApps} onAdd={() => setTrackerOpen(true)} onSignOut={signOut} />}

    {selectedScheme && <SchemeModal scheme={selectedScheme} saved={saved.includes(selectedScheme.id)} onSave={() => toggleSaved(selectedScheme.id)} onClose={() => setSelectedScheme(null)} />}
    {selectedService && <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />}
    {authOpen && <AuthModal mode={authMode} onClose={() => setAuthOpen(false)} onSuccess={() => { setSignedIn(true); setAuthOpen(false); }} />}
    {trackerOpen && <TrackerModal onClose={() => setTrackerOpen(false)} onSave={(app) => { const next = [...trackedApps, app]; setTrackedApps(next); localStorage.setItem('jansetu-tracker', JSON.stringify(next)); setTrackerOpen(false); }} />}
    <Assistant open={assistantOpen} setOpen={setAssistantOpen} input={assistantInput} setInput={setAssistantInput} messages={messages} loading={assistantLoading} ask={askAssistant} />
    <footer className="site-footer"><div className="footer-main"><div><button className="brand footer-brand" onClick={() => navigate('home')}><span className="brand-mark">ज</span><span><strong>JanSetu</strong><em>AI</em><small>जनसेतु</small></span></button><p>A simpler way to understand and access<br/>India’s public systems.</p></div><div className="footer-links"><div><b>Explore</b><button onClick={() => navigate('schemes')}>Government schemes</button><button onClick={() => navigate('services')}>Public services</button><button onClick={() => setAssistantOpen(true)}>Ask JanSetu AI</button></div><div><b>Trust</b><button onClick={() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' })}>Privacy & safety</button><button onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button><a href="https://www.india.gov.in/" target="_blank" rel="noreferrer">India.gov.in <Icon name="external" size={13}/></a></div></div></div><div className="footer-bottom"><span>© 2026 JanSetu AI</span><span>Information is for guidance. Always verify details on official government portals.</span></div></footer>
  </main>;
}

function HomeView({ t, language, navigate, askAssistant }: { t: typeof translations.English; language: string; navigate: (v: 'home' | 'schemes' | 'services' | 'dashboard') => void; askAssistant: (q?: string) => void }) {
  const [query, setQuery] = useState('');
  return <>
    <section className="hero page-width"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/>A public service guide for India</div><h1>Government services.<br/><i>Simplified for everyone.</i></h1><p className="hero-lede">Discover public services, find benefits you’re eligible for, and navigate government processes with confidence. Everything you need, connected in one place.</p><div className="hero-actions"><button className="button button-dark" onClick={() => navigate('services')}>{t.browse}<Icon name="arrow" size={17}/></button><button className="text-button" onClick={() => document.getElementById('eligibility')?.scrollIntoView({ behavior: 'smooth' })}>{t.benefits}<Icon name="arrow" size={17}/></button></div></div><div className="hero-art" aria-label="Illustration of connected civic services"><div className="art-sun"/><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-building"><span/><span/><span/><span/><span/><div className="building-roof"/></div><div className="art-path"><span className="path-dot dot-one"/><span className="path-dot dot-two"/><span className="path-dot dot-three"/></div><div className="art-caption"><span className="caption-rule"/>One place to begin<br/><b>भारत · India</b></div></div></section>
    <section className="assistant-strip page-width"><div className="assistant-intro"><div className="assistant-symbol"><Icon name="spark" size={22}/></div><div><span className="section-kicker">JanSetu AI assistant</span><h2>How can we help you today?</h2></div></div><form className="assistant-form" onSubmit={(e) => { e.preventDefault(); askAssistant(query); }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try: I am a student from Karnataka. What can I apply for?" aria-label="Ask JanSetu AI"/><button className="send-button" aria-label="Send question"><Icon name="send" size={17}/></button></form><p className="assistant-note"><span className="status-dot"/> Ask in English, हिन्दी or ಕನ್ನಡ <span>·</span> Answers link back to official sources</p></section>
    <section className="section page-width popular"><div className="section-heading"><div><span className="section-kicker">Start here</span><h2>Popular ways to get help</h2></div><button className="text-button" onClick={() => navigate('services')}>View all services <Icon name="arrow" size={16}/></button></div><div className="popular-grid"><QuickCard number="01" title="Find a government service" text="Understand what you need and where to apply." onClick={() => navigate('services')} /><QuickCard number="02" title="Discover your benefits" text="See schemes that may fit your life situation." onClick={() => document.getElementById('eligibility')?.scrollIntoView({ behavior: 'smooth' })} /><QuickCard number="03" title="Prepare your documents" text="Get a clear checklist before you begin." onClick={() => setTimeout(() => navigate('services'), 0)} /></div></section>
    <EligibilitySection />
    <section className="section dark-section" id="how"><div className="page-width"><div className="dark-intro"><span className="section-kicker light">A calmer way through complexity</span><h2>Public systems,<br/><i>made human.</i></h2><p>We turn dense official information into clear next steps—while keeping you close to the source.</p></div><div className="steps"><Step n="01" title="Tell us what you need" text="Ask a question in your own words, or browse by life situation."/><Step n="02" title="Understand your options" text="See plain-language guidance, requirements and relevant schemes."/><Step n="03" title="Take the next step" text="Use the official link, save your checklist and keep track."/></div></div></section>
    <section className="section page-width trust" id="privacy"><div className="trust-copy"><span className="section-kicker">Built around trust</span><h2>Helpful by design.<br/><i>Careful by default.</i></h2><p>JanSetu helps you understand public information. Applications, approvals and decisions always remain with the relevant government department.</p><div className="trust-points"><div><Icon name="shield" size={22}/><span><b>Your information stays yours</b><small>We don’t ask for Aadhaar to browse.</small></span></div><div><Icon name="document" size={22}/><span><b>Official sources, clearly linked</b><small>Check every important detail at the source.</small></span></div></div></div><div className="trust-card"><div className="trust-card-top"><Icon name="shield" size={25}/><span>Our promise</span></div><blockquote>“You should never need to be an expert in government to get the help you deserve.”</blockquote><div className="trust-card-line"/><small>JanSetu · जनसेतु</small></div></section>
    <section className="regional-band"><div className="page-width regional-inner"><span className="regional-script">ನಮಸ್ಕಾರ&nbsp;&nbsp; नमस्ते</span><div><span className="section-kicker">In the language you think in</span><h2>Public information<br/>should feel <i>close to home.</i></h2><p>Start in English, हिन्दी or ಕನ್ನಡ. We’re building for every Indian language, one careful translation at a time.</p></div><button className="button button-outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Choose your language <Icon name="arrow" size={16}/></button></div></section>
  </>;
}

function QuickCard({ number, title, text, onClick }: { number: string; title: string; text: string; onClick: () => void }) { return <button className="quick-card" onClick={onClick}><span className="card-number">{number}</span><span className="card-icon"><Icon name="arrow" size={17}/></span><strong>{title}</strong><p>{text}</p><span className="card-link">Explore <Icon name="arrow" size={14}/></span></button>; }
function Step({ n, title, text }: { n: string; title: string; text: string }) { return <div className="step"><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>; }

function EligibilitySection() {
  const [step, setStep] = useState(0); const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = [{ key: 'state', title: 'Where do you live?', options: ['Karnataka', 'Maharashtra', 'Delhi', 'Another state'] }, { key: 'situation', title: 'What best describes you?', options: ['Student', 'Farmer', 'Senior citizen', 'Working professional'] }, { key: 'income', title: 'What is your family income range?', options: ['Below ₹2 lakh', '₹2–5 lakh', 'Above ₹5 lakh', 'Prefer not to say'] }];
  const current = questions[step];
  return <section className="section eligibility-section page-width" id="eligibility"><div className="eligibility-head"><div><span className="section-kicker">A starting point, not a verdict</span><h2>Find what may be<br/><i>meant for you.</i></h2></div><p>Answer a few simple questions. We’ll show potentially relevant schemes and tell you what still needs to be verified.</p></div><div className="eligibility-box"><div className="progress-label"><span>Eligibility finder</span><span>{step < questions.length ? `Step ${step + 1} of ${questions.length}` : 'Your starting point'}</span></div><div className="progress-bar"><span style={{ width: `${Math.min(100, ((step + 1) / questions.length) * 100)}%` }}/></div>{step < questions.length ? <div className="eligibility-question"><h3>{current.title}</h3><div className="option-grid">{current.options.map((option) => <button key={option} className={answers[current.key] === option ? 'selected' : ''} onClick={() => { setAnswers({ ...answers, [current.key]: option }); setTimeout(() => setStep(step + 1), 180); }}>{option}<span>{answers[current.key] === option && <Icon name="check" size={15}/>}</span></button>)}</div></div> : <div className="eligibility-result"><div className="result-mark"><Icon name="check" size={22}/></div><div><h3>Your first matches are ready</h3><p>Based on your answers, explore education, agriculture and social security support. Eligibility is always subject to official verification.</p><div className="result-tags"><span>Potential matches</span><span>{answers.state}</span><span>{answers.situation}</span></div></div><button className="button button-dark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Browse schemes <Icon name="arrow" size={16}/></button></div>}</div></section>;
}

function DirectoryView({ kind, search, setSearch, category, setCategory, items, onOpen, onSave, saved = [] }: { kind: 'schemes' | 'services'; search: string; setSearch: (s: string) => void; category?: string; setCategory?: (s: string) => void; items: (Scheme | Service)[]; onOpen: (item: Scheme | Service) => void; onSave?: (id: string) => void; saved?: string[] }) {
  const isSchemes = kind === 'schemes';
  return <section className="directory page-width"><div className="directory-hero"><span className="section-kicker">JanSetu directory</span><h1>{isSchemes ? <>Find support that<br/><i>fits your life.</i></> : <>The next step,<br/><i>made clear.</i></>}</h1><p>{isSchemes ? 'Explore verified government schemes in plain language. Filter by your situation, then check the official source before you apply.' : 'Search essential public services and understand the documents, steps and official portal you need.'}</p></div><div className="directory-tools"><label className="search-box"><Icon name="search" size={19}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={isSchemes ? 'Search schemes, benefits or categories' : 'Search services'} aria-label={isSchemes ? 'Search schemes' : 'Search services'} /></label>{isSchemes && <div className="filter-row">{['All', 'Education', 'Agriculture', 'Social security', 'Entrepreneurship'].map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory?.(item)}>{item}</button>)}</div>}</div><div className="results-meta"><span>{items.length} {isSchemes ? 'schemes' : 'services'} to explore</span><span className="verified-note"><span className="status-dot"/> Information is linked to official sources</span></div>{items.length ? <div className={`directory-grid ${isSchemes ? 'scheme-grid' : 'service-grid'}`}>{items.map((item) => isSchemes ? <SchemeCard key={item.id} scheme={item as Scheme} saved={saved.includes(item.id)} onSave={() => onSave?.(item.id)} onOpen={() => onOpen(item)} /> : <ServiceCard key={item.id} service={item as Service} onOpen={() => onOpen(item)} />)}</div> : <div className="empty-state"><Icon name="search" size={25}/><h3>No matching {isSchemes ? 'schemes' : 'services'} yet</h3><p>Try a broader search or remove a filter.</p></div>}</section>;
}

function SchemeCard({ scheme, saved, onSave, onOpen }: { scheme: Scheme; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <article className="scheme-card"><div className="card-topline"><span className="level-label">{scheme.level} · {scheme.category}</span><button className={`save-button ${saved ? 'saved' : ''}`} onClick={onSave} aria-label={saved ? 'Remove saved scheme' : 'Save scheme'}><Icon name="bookmark" size={18}/></button></div><button className="card-content" onClick={onOpen}><h3>{scheme.name}</h3><p>{scheme.description}</p><div className="benefit-line"><span>Benefit</span>{scheme.benefit}</div></button><div className="card-footer"><span>{scheme.department}</span><button className="arrow-link" onClick={onOpen}>View details <Icon name="arrow" size={14}/></button></div></article>;
}

function ServiceCard({ service, onOpen }: { service: Service; onOpen: () => void }) {
  return <article className="service-card"><div className="service-icon"><Icon name="document" size={22}/></div><span className="level-label">{service.category}</span><button className="card-content" onClick={onOpen}><h3>{service.name}</h3><p>{service.description}</p></button><div className="service-footer"><span><Icon name="clock" size={14}/>{service.processing || 'Official process'}</span><button className="arrow-link" onClick={onOpen}>How to apply <Icon name="arrow" size={14}/></button></div></article>;
}

function SchemeModal({ scheme, saved, onSave, onClose }: { scheme: Scheme; saved: boolean; onSave: () => void; onClose: () => void }) {
  return <Modal onClose={onClose}><div className="modal-kicker">{scheme.level} government · {scheme.category}</div><div className="modal-title-row"><h2>{scheme.name}</h2><button className={`save-button ${saved ? 'saved' : ''}`} onClick={onSave} aria-label="Save scheme"><Icon name="bookmark" size={19}/></button></div><p className="modal-lede">{scheme.description}</p><div className="modal-grid"><InfoList title="Who may be eligible" items={scheme.eligibility}/><InfoList title="Keep these ready" items={scheme.documents}/></div><div className="benefit-panel"><span>What the scheme offers</span><b>{scheme.benefit}</b></div><div className="source-row"><div><small>Official source</small><a href={scheme.source} target="_blank" rel="noreferrer">{new URL(scheme.source).hostname.replace('www.', '')} <Icon name="external" size={13}/></a></div><div><small>Deadline</small><b>{scheme.deadline || 'Check official source'}</b></div></div><div className="modal-disclaimer"><Icon name="shield" size={18}/><span>Potentially eligible only. The relevant government department makes the final decision.</span></div></Modal>;
}

function ServiceModal({ service, onClose }: { service: Service; onClose: () => void }) {
  return <Modal onClose={onClose}><div className="modal-kicker">{service.category} · {service.department}</div><h2>{service.name}</h2><p className="modal-lede">{service.description}</p><div className="service-detail"><h3>How it works</h3><ol>{service.steps.map((step, i) => <li key={step}><span>{String(i + 1).padStart(2, '0')}</span>{step}</li>)}</ol></div><div className="modal-grid compact"><InfoList title="Documents to prepare" items={service.documents}/><div><h3 className="mini-title">At a glance</h3><div className="glance"><span>Processing time<b>{service.processing || 'Check portal'}</b></span><span>Fees<b>{service.fee || 'Check portal'}</b></span></div></div></div><div className="modal-actions"><a className="button button-dark" href={service.link} target="_blank" rel="noreferrer">Open official portal <Icon name="external" size={16}/></a><span>JanSetu provides guidance. Applications are completed on official portals.</span></div></Modal>;
}

function InfoList({ title, items }: { title: string; items: string[] }) { return <div className="info-list"><h3>{title}</h3><ul>{items.map((item) => <li key={item}><Icon name="check" size={14}/>{item}</li>)}</ul></div>; }
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) { return <div className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal"><button className="modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="close" size={19}/></button>{children}</div></div>; }

function AuthModal({ mode, onClose, onSuccess }: { mode: 'signin' | 'signup'; onClose: () => void; onSuccess: () => void }) {
  const [active, setActive] = useState(mode); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [notice, setNotice] = useState('');
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!email.includes('@') || password.length < 6 || (active === 'signup' && !name.trim())) { setError(active === 'signup' ? 'Enter your name, a valid email and a password of at least 6 characters.' : 'Enter a valid email and password of at least 6 characters.'); return; } setLoading(true); setError(''); if (supabase) { const result = active === 'signin' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }); setLoading(false); if (result.error) { setError(result.error.message); return; } if (active === 'signup' && !result.data.session) { setNotice('Check your email to verify your account, then sign in.'); return; } onSuccess(); return; } setLoading(false); onSuccess(); };
  return <Modal onClose={onClose}><div className="auth-header"><span className="brand-mark">ज</span><span><strong>{active === 'signin' ? 'Welcome back' : 'Join JanSetu'}</strong><small>{active === 'signin' ? 'Your public service companion.' : 'Save, track and get guidance.'}</small></span></div><div className="auth-tabs"><button className={active === 'signin' ? 'active' : ''} onClick={() => { setActive('signin'); setError(''); setNotice(''); }}>Sign in</button><button className={active === 'signup' ? 'active' : ''} onClick={() => { setActive('signup'); setError(''); setNotice(''); }}>Create account</button></div><form onSubmit={submit} className="auth-form">{active === 'signup' && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required/></label>}<label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required/></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={active === 'signin' ? 'current-password' : 'new-password'} minLength={6} required/></label>{error && <p className="form-error">{error}</p>}{notice && <p className="success-message">{notice}</p>}<button className="button button-dark auth-submit" disabled={loading}>{loading ? 'Working…' : active === 'signin' ? 'Sign in' : 'Create account'} {!loading && <Icon name="arrow" size={16}/>}</button></form><p className="auth-note"><Icon name="shield" size={14}/> {supabase ? 'Secured by Supabase Auth. Your password is never stored by JanSetu.' : 'Add Supabase credentials to enable secure hosted authentication.'}</p></Modal>;
}

function TrackerModal({ onClose, onSave }: { onClose: () => void; onSave: (app: { name: string; ref: string; status: string }) => void }) {
  const [name, setName] = useState(''); const [ref, setRef] = useState(''); const [status, setStatus] = useState('Submitted');
  return <Modal onClose={onClose}><div className="modal-kicker">Private to your account</div><h2>Track an application</h2><p className="modal-lede">Keep your own reminder here. JanSetu does not automatically retrieve government application statuses.</p><form className="auth-form" onSubmit={(e) => { e.preventDefault(); if (name && ref) onSave({ name, ref, status }); }}><label>Service name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Income Certificate" required/></label><label>Application or reference number<input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Enter the number" required/></label><label>Current status<select value={status} onChange={(e) => setStatus(e.target.value)}><option>Draft</option><option>Submitted</option><option>Under Review</option><option>Action Required</option><option>Approved</option><option>Completed</option></select></label><button className="button button-dark auth-submit">Save tracker <Icon name="check" size={16}/></button></form></Modal>;
}

function Dashboard({ saved, onOpenScheme, onSave, trackedApps, onAdd, onSignOut }: { saved: string[]; onOpenScheme: (scheme: Scheme) => void; onSave: (id: string) => void; trackedApps: { name: string; ref: string; status: string }[]; onAdd: () => void; onSignOut: () => void }) {
  const savedSchemes = schemes.filter((scheme) => saved.includes(scheme.id));
  return <section className="dashboard page-width"><div className="dashboard-welcome"><div><span className="section-kicker">Your JanSetu space</span><h1>Good morning, <i>citizen.</i></h1><p>A simple place for the things you’re figuring out.</p></div><div className="profile-progress"><div className="progress-ring"><span>40%</span></div><span>Profile<br/>started</span></div></div><div className="dashboard-grid"><div className="dashboard-main"><div className="panel-heading"><div><span className="section-kicker">Saved for later</span><h2>Your schemes</h2></div><span>{savedSchemes.length} saved</span></div>{savedSchemes.length ? <div className="saved-list">{savedSchemes.map((scheme) => <div className="saved-row" key={scheme.id}><div><span className="level-label">{scheme.category}</span><h3>{scheme.name}</h3><p>{scheme.benefit}</p></div><div><button className="arrow-link" onClick={() => onOpenScheme(scheme)}>View <Icon name="arrow" size={14}/></button><button className="remove-link" onClick={() => onSave(scheme.id)}>Remove</button></div></div>)}</div> : <div className="dashboard-empty"><Icon name="bookmark" size={22}/><h3>Nothing saved yet</h3><p>Save a scheme while exploring to find it here.</p></div>}<div className="panel-heading tracker-heading"><div><span className="section-kicker">Keep moving</span><h2>Application tracker</h2></div><button className="button button-outline button-small" onClick={onAdd}><Icon name="plus" size={15}/> Add application</button></div>{trackedApps.length ? <div className="tracking-list">{trackedApps.map((app, i) => <div className="tracking-row" key={`${app.ref}-${i}`}><div className="tracking-icon"><Icon name="document" size={19}/></div><div><h3>{app.name}</h3><p>Ref: {app.ref}</p></div><span className="status-label">{app.status}</span></div>)}</div> : <div className="dashboard-empty tracker-empty"><Icon name="clock" size={22}/><h3>No applications tracked</h3><p>Add an application reference to keep a personal reminder.</p></div>}</div><aside className="dashboard-aside"><div className="aside-ai"><div className="assistant-symbol"><Icon name="spark" size={21}/></div><span className="section-kicker light">Your AI companion</span><h2>Have a question?</h2><p>Ask about a service, document or scheme in your own words.</p><button className="button button-light" onClick={() => document.dispatchEvent(new CustomEvent('open-assistant'))}>Ask JanSetu AI <Icon name="arrow" size={16}/></button></div><div className="aside-tip"><span className="section-kicker">Good to know</span><h3>JanSetu never issues a certificate or decides your eligibility.</h3><p>We help you prepare and point you to the right official place.</p></div></aside></div></section>;
}

function Assistant({ open, setOpen, input, setInput, messages, loading, ask }: { open: boolean; setOpen: (v: boolean) => void; input: string; setInput: (v: string) => void; messages: { role: 'user' | 'assistant'; text: string; sources?: { label: string; url: string }[] }[]; loading: boolean; ask: (q?: string) => void }) {
  useEffect(() => { const handler = () => setOpen(true); document.addEventListener('open-assistant', handler); return () => document.removeEventListener('open-assistant', handler); }, [setOpen]);
  return <><button className={`assistant-fab ${open ? 'hidden' : ''}`} onClick={() => setOpen(true)} aria-label="Open JanSetu AI"><Icon name="spark" size={20}/><span>Ask JanSetu AI</span></button>{open && <aside className="assistant-drawer" aria-label="JanSetu AI assistant"><div className="drawer-head"><div><span className="assistant-symbol"><Icon name="spark" size={19}/></span><span><b>JanSetu AI</b><small>Guidance with sources</small></span></div><button onClick={() => setOpen(false)} aria-label="Close assistant"><Icon name="close" size={18}/></button></div><div className="drawer-messages">{!messages.length && <div className="assistant-welcome"><div className="welcome-orbit"><Icon name="spark" size={24}/></div><h3>What are you trying to do?</h3><p>Ask about a scheme, service, document or application process.</p><div className="prompt-list"><button onClick={() => ask('How can I apply for an income certificate?')}>How do I apply for an income certificate? <Icon name="arrow" size={14}/></button><button onClick={() => ask('I am a student from Karnataka. What scholarships can I explore?')}>I am a student from Karnataka. What can I explore? <Icon name="arrow" size={14}/></button></div></div>}{messages.map((message, i) => <div className={`message ${message.role}`} key={`${message.text}-${i}`}><span>{message.text}</span>{message.sources?.length ? <div className="message-sources"><small>Sources</small>{message.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <Icon name="external" size={12}/></a>)}</div> : null}</div>)}{loading && <div className="message assistant typing"><span/><span/><span/></div>}</div><form className="drawer-form" onSubmit={(e) => { e.preventDefault(); ask(); }}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." aria-label="Message JanSetu AI"/><button aria-label="Send"><Icon name="send" size={16}/></button></form><p className="drawer-disclaimer">AI guidance can be incomplete. Verify important details on the linked official source.</p></aside>}</>;
}
