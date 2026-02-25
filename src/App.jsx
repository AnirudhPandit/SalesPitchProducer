const recentNotes = [
  'Q2 Growth Strategy Brainstorm',
  'Enterprise ICP Research',
  'Sales Narrative Draft V4'
];

const prompts = [
  {
    title: 'Generate GTM pitch',
    subtitle: 'Based on product docs + customer insights'
  },
  {
    title: 'Rewrite for CFO audience',
    subtitle: 'Keep value framing and shorten to 90 seconds'
  },
  {
    title: 'Extract objection handlers',
    subtitle: 'Create a concise table with rebuttals'
  }
];

function App() {
  return (
    <div className="page-shell">
      <aside className="sidebar">
        <div className="brand">SalesPitchProducer</div>
        <button className="new-note-btn">+ New Notebook</button>

        <nav className="nav-group">
          <p className="group-label">Recent</p>
          {recentNotes.map((note) => (
            <button className="nav-item" key={note}>
              {note}
            </button>
          ))}
        </nav>

        <div className="storage-pill">8 of 20 notebooks used</div>
      </aside>

      <main className="main-panel">
        <header className="top-bar">
          <div className="search-pill">Search notebooks, sources, and chats…</div>
          <div className="profile-dot" aria-label="profile" />
        </header>

        <section className="hero">
          <p className="eyebrow">Notebook-style AI workspace</p>
          <h1>Turn product knowledge into high-converting sales stories</h1>
          <p className="hero-subtext">
            Organize docs, call transcripts, and market research into a single notebook.
            Ask questions, draft pitches, and generate role-specific messaging in seconds.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">Create a notebook</button>
            <button className="secondary-btn">Import sources</button>
          </div>
        </section>

        <section className="prompt-grid">
          {prompts.map((prompt) => (
            <article className="prompt-card" key={prompt.title}>
              <h2>{prompt.title}</h2>
              <p>{prompt.subtitle}</p>
            </article>
          ))}
        </section>

        <section className="chat-preview">
          <div className="bubble user">Create a pitch for our AI copilot focused on manufacturing leaders.</div>
          <div className="bubble ai">
            Here is a 60-second narrative: “Plant managers are overwhelmed by disconnected dashboards...
            ”
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
