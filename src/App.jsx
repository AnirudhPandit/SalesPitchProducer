import { useState } from 'react';

const sourceFilters = ['Web', 'Fast research'];

const studioTools = [
  'Audio Overview',
  'Video Overview',
  'Mind Map',
  'Reports',
  'Flashcards',
  'Quiz',
  'Infographic',
  'Slide deck',
  'Data table'
];

const uploadOptions = ['Upload files', 'Websites', 'Drive', 'Copied text'];

function App() {
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
  const [isStudioCollapsed, setIsStudioCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="title-wrap">
          <div className="logo-mark" aria-hidden="true">◍</div>
          <h1>Untitled notebook</h1>
        </div>

        <div className="top-actions">
          <button className="create-btn">+ Create notebook</button>
          <button className="ghost-btn">Share</button>
          <button className="ghost-btn">Settings</button>
          <button className="icon-btn" aria-label="apps">⋮⋮</button>
          <div className="avatar" aria-label="profile" />
        </div>
      </header>

      <main className="workspace-grid">
        <section className={`panel sources-panel ${isSourcesCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <h2>Sources</h2>
            <button
              className="mini-icon"
              onClick={() => setIsSourcesCollapsed((prev) => !prev)}
              aria-label={isSourcesCollapsed ? 'Expand Sources panel' : 'Collapse Sources panel'}
            >
              {isSourcesCollapsed ? '▢' : '◫'}
            </button>
          </div>

          {!isSourcesCollapsed && (
            <>
              <button className="add-sources">＋ Add sources</button>

              <div className="search-card compact">
                <p>Search the web for new sources</p>
                <div className="chip-row">
                  {sourceFilters.map((item) => (
                    <button className="chip" key={item}>{item}</button>
                  ))}
                </div>
              </div>

              <div className="sources-empty">
                <div className="empty-icon">📄</div>
                <h3>Saved sources will appear here</h3>
                <p>
                  Click Add source above to add PDFs, websites, text, videos or audio files.
                </p>
              </div>
            </>
          )}
        </section>

        <section className="panel chat-panel">
          <div className="panel-header">
            <h2>Chat</h2>
            <button className="mini-icon">⋮</button>
          </div>

          <div className="hero-card">
            <button className="close-btn">×</button>
            <h3>
              Create Audio and Video Overviews from <span>your notes</span>
            </h3>

            <div className="search-card">
              <p>Search the web for new sources</p>
              <div className="chip-row">
                {sourceFilters.map((item) => (
                  <button className="chip" key={`chat-${item}`}>{item}</button>
                ))}
              </div>
            </div>

            <div className="upload-box">
              <p className="upload-title">or drop your files</p>
              <p className="upload-sub">pdf, images, docs, audio</p>
              <div className="upload-actions">
                {uploadOptions.map((option) => (
                  <button className="pill" key={option}>{option}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="chat-input-row">
            <p>Start typing...</p>
            <span>0 sources</span>
            <button className="send-btn">➜</button>
          </div>
          <p className="footnote">NotebookLM can be inaccurate; please double-check responses.</p>
        </section>

        <section className={`panel studio-panel ${isStudioCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <h2>Studio</h2>
            <button
              className="mini-icon"
              onClick={() => setIsStudioCollapsed((prev) => !prev)}
              aria-label={isStudioCollapsed ? 'Expand Studio panel' : 'Collapse Studio panel'}
            >
              {isStudioCollapsed ? '▢' : '◫'}
            </button>
          </div>

          {!isStudioCollapsed && (
            <>
              <div className="studio-banner">
                Create an Audio Overview in: हिंदी, বাংলা, ગુજરાતી, ಕನ್ನಡ, മലയാളം, मराठी, ਪੰਜਾਬੀ, தமிழ், తెలుగు
              </div>

              <div className="studio-grid">
                {studioTools.map((tool) => (
                  <button className="studio-tile" key={tool}>{tool}</button>
                ))}
              </div>

              <div className="studio-empty">
                <h3>Studio output will be saved here.</h3>
                <p>After adding sources, click to add Audio Overview, study guide, mind map and more.</p>
              </div>

              <button className="note-btn">Add note</button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;