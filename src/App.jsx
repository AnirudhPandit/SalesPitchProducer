import { useMemo, useState } from 'react';

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

const jsonHeaders = { 'Content-Type': 'application/json' };

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function App() {
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false);
  const [isStudioCollapsed, setIsStudioCollapsed] = useState(false);
  const [sourceQuery, setSourceQuery] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(sourceFilters[0]);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const sourceCount = useMemo(() => messages.filter((m) => m.role === 'source').length, [messages]);

  const addMessage = (role, text, extra = {}) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text, ...extra }
    ]);
  };

  const handleAction = async (action, metadata = {}) => {
    try {
      setStatus(`Running ${action}...`);
      const data = await postJson('/api/action', { action, metadata });
      addMessage('system', data.message || `${action} executed`, { action });
      setStatus(`Completed ${action}`);
    } catch (error) {
      setStatus(`Action failed: ${error.message}`);
    }
  };

  const handleSourceSearch = async (event) => {
    event.preventDefault();
    if (!sourceQuery.trim()) return;

    try {
      setIsLoading(true);
      setStatus('Searching sources...');

      const payload = {
        type: 'source_search',
        query: sourceQuery,
        filter: selectedFilter,
        notebookId: 'untitled-notebook'
      };

      const data = await postJson('/api/model/query', payload);
      addMessage('source', `Search: ${sourceQuery} (${selectedFilter})`);
      addMessage('model', data.response || 'No response returned by model.', { raw: data });
      setSourceQuery('');
      setStatus('Source search complete');
    } catch (error) {
      setStatus(`Search failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    if (!chatPrompt.trim()) return;

    const prompt = chatPrompt;
    setChatPrompt('');
    addMessage('user', prompt);

    try {
      setIsLoading(true);
      setStatus('Waiting for model response...');

      const payload = {
        type: 'chat',
        notebookId: 'untitled-notebook',
        prompt,
        context: {
          sourceFilter: selectedFilter,
          sourceCount
        }
      };

      const data = await postJson('/api/model/query', payload);
      addMessage('model', data.response || 'No response returned by model.', { raw: data });
      setStatus('Response received');
    } catch (error) {
      setStatus(`Chat failed: ${error.message}`);
      addMessage('system', `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (files) => {
    if (!files.length) return;

    try {
      setIsLoading(true);
      setStatus(`Uploading ${files.length} file(s)...`);

      const filePayload = await Promise.all(
        Array.from(files).map(async (file) => ({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          contentBase64: await readFileAsBase64(file)
        }))
      );

      const payload = {
        type: 'upload',
        notebookId: 'untitled-notebook',
        files: filePayload
      };

      const data = await postJson('/api/model/upload', payload);
      addMessage('source', `Uploaded ${files.length} file(s)`);
      addMessage('model', data.response || 'Upload processed.', { raw: data });
      setStatus('Upload complete');
    } catch (error) {
      setStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFileUpload(event.dataTransfer.files);
  };

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="title-wrap">
          <div className="logo-mark" aria-hidden="true">◍</div>
          <h1>Untitled notebook</h1>
        </div>

        <div className="top-actions">
          <button className="create-btn" onClick={() => handleAction('create_notebook')}>+ Create notebook</button>
          <button className="ghost-btn" onClick={() => handleAction('share_notebook')}>Share</button>
          <button className="ghost-btn" onClick={() => handleAction('open_settings')}>Settings</button>
          <button className="icon-btn" aria-label="apps" onClick={() => handleAction('open_apps')}>⋮⋮</button>
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
              <button className="add-sources" onClick={() => handleAction('add_sources')}>＋ Add sources</button>

              <form className="search-card compact" onSubmit={handleSourceSearch}>
                <label htmlFor="sources-search">Search the web for new sources</label>
                <input
                  id="sources-search"
                  value={sourceQuery}
                  onChange={(event) => setSourceQuery(event.target.value)}
                  placeholder="Try: manufacturing AI copilots"
                />
                <div className="chip-row">
                  {sourceFilters.map((item) => (
                    <button
                      type="button"
                      className={`chip ${selectedFilter === item ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(item)}
                      key={item}
                    >
                      {item}
                    </button>
                  ))}
                  <button type="submit" className="small-btn">Search</button>
                </div>
              </form>

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
            <button className="mini-icon" onClick={() => handleAction('chat_options')}>⋮</button>
          </div>

          <div className="hero-card">
            <button className="close-btn" onClick={() => handleAction('dismiss_card')}>×</button>
            <h3>
              Create Audio and Video Overviews from <span>your notes</span>
            </h3>

            <form className="search-card" onSubmit={handleSourceSearch}>
              <label htmlFor="chat-search">Search the web for new sources</label>
              <input
                id="chat-search"
                value={sourceQuery}
                onChange={(event) => setSourceQuery(event.target.value)}
                placeholder="Type a source query"
              />
              <div className="chip-row">
                {sourceFilters.map((item) => (
                  <button
                    type="button"
                    className={`chip ${selectedFilter === item ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(item)}
                    key={`chat-${item}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </form>

            <div
              className={`upload-box ${dragActive ? 'drag-active' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              <p className="upload-title">or drop your files</p>
              <p className="upload-sub">pdf, images, docs, audio</p>
              <div className="upload-actions">
                <label className="pill file-pill">
                  Upload files
                  <input type="file" multiple onChange={(event) => handleFileUpload(event.target.files)} />
                </label>
                {uploadOptions.slice(1).map((option) => (
                  <button className="pill" key={option} onClick={() => handleAction(option.toLowerCase().replace(' ', '_'))}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="messages-log">
            {messages.map((message) => (
              <article key={message.id} className={`msg ${message.role}`}>
                <strong>{message.role}</strong>
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          <form className="chat-input-row" onSubmit={handleChatSubmit}>
            <input
              value={chatPrompt}
              onChange={(event) => setChatPrompt(event.target.value)}
              placeholder="Start typing..."
            />
            <span>{sourceCount} sources</span>
            <button className="send-btn" type="submit" disabled={isLoading}>➜</button>
          </form>
          <p className="footnote">{status}</p>
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
                  <button className="studio-tile" key={tool} onClick={() => handleAction('run_studio_tool', { tool })}>{tool}</button>
                ))}
              </div>

              <div className="studio-empty">
                <h3>Studio output will be saved here.</h3>
                <p>After adding sources, click to add Audio Overview, study guide, mind map and more.</p>
              </div>

              <button className="note-btn" onClick={() => handleAction('add_note')}>Add note</button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
