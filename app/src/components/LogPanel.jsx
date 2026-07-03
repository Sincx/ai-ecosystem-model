import { useState, useEffect } from 'react'

const STORAGE_KEY_BOOKS    = 'fred_pending_books'
const STORAGE_KEY_PODCASTS = 'fred_pending_podcasts'

const BOOK_GENRES = ['Non-fiction', 'Fiction', 'Memoir', 'Sci-Fi', 'Fantasy', 'Crime', 'Historical Fiction', 'Literary Fiction', 'Business', 'Psychology', 'Science', 'Biography']
const POD_GENRES  = ['Long-form interview', 'Storytelling', 'Educational', 'News', 'Investigative', 'Debate', 'Solo', 'Roundtable']

function loadPending(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function savePending(key, items) {
  localStorage.setItem(key, JSON.stringify(items))
}

function copyText(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  })
}

// Generate the command text to paste into Claude Code
function bookCommand(b) {
  const parts = [b.title, b.author, b.genre, b.tags, b.notes].filter(Boolean).join(' · ')
  return `/add-book ${parts}`
}
function podcastCommand(p) {
  const parts = [p.title, p.host, p.genre, p.tags, p.notes].filter(Boolean).join(' · ')
  return `/add-podcast ${parts}`
}

function PendingList({ items, onRemove, cmdFn, emptyMsg }) {
  const [copiedId, setCopiedId] = useState(null)
  if (!items.length) return <p style={{ color: 'var(--text4)', fontSize: '0.8rem', padding: 'var(--sp4) 0' }}>{emptyMsg}</p>
  return (
    <div className="pending-list">
      {items.map((item, i) => (
        <div key={i} className="pending-item">
          <div className="pending-meta">
            <strong>{item.title}</strong>
            {item.author && <span> · {item.author}</span>}
            {item.host   && <span> · {item.host}</span>}
            {item.genre  && <span className="pending-tag">{item.genre}</span>}
            <span style={{ fontSize: '0.7rem', color: 'var(--text4)', marginLeft: 'auto' }}>{item.date}</span>
          </div>
          <div className="pending-actions">
            <button
              className={`copy-btn copy-btn-sm${copiedId === i ? ' copied' : ''}`}
              onClick={() => copyText(cmdFn(item), (v) => { setCopiedId(v ? i : null) })}
            >
              {copiedId === i ? '✓ Copied' : 'Copy command'}
            </button>
            <button className="copy-btn copy-btn-sm danger" onClick={() => onRemove(i)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function BookForm({ onAdd }) {
  const [title,  setTitle]  = useState('')
  const [author, setAuthor] = useState('')
  const [genre,  setGenre]  = useState('Non-fiction')
  const [tags,   setTags]   = useState('')
  const [notes,  setNotes]  = useState('')
  const [copied, setCopied] = useState(false)

  const entry = { title, author, genre, tags, notes, date: new Date().toISOString().slice(0,10) }
  const cmd = title.trim() ? bookCommand(entry) : ''

  function handleSave() {
    if (!title.trim()) return
    onAdd(entry)
    setTitle(''); setAuthor(''); setTags(''); setNotes('')
  }

  return (
    <div className="log-form">
      <div className="log-form-grid">
        <label>
          <span>Title *</span>
          <input placeholder="e.g. The Big Short" value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <label>
          <span>Author</span>
          <input placeholder="e.g. Michael Lewis" value={author} onChange={e => setAuthor(e.target.value)} />
        </label>
        <label>
          <span>Genre</span>
          <select value={genre} onChange={e => setGenre(e.target.value)}>
            {BOOK_GENRES.map(g => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label>
          <span>Tags</span>
          <input placeholder="e.g. finance, crisis, wall-street" value={tags} onChange={e => setTags(e.target.value)} />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          <span>Notes (optional)</span>
          <input placeholder="Personal notes or rating…" value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
      </div>

      {cmd && (
        <div className="cmd-preview">
          <code>{cmd}</code>
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={() => copyText(cmd, setCopied)}
          >
            {copied ? '✓ Copied' : 'Copy command'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--sp3)', marginTop: 'var(--sp4)' }}>
        <button className="filter-btn active" onClick={handleSave} disabled={!title.trim()}>
          Save to queue
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)', alignSelf: 'center' }}>
          Saves here + paste command into Claude Code to add to wiki
        </span>
      </div>
    </div>
  )
}

function PodcastForm({ onAdd }) {
  const [title,  setTitle]  = useState('')
  const [host,   setHost]   = useState('')
  const [genre,  setGenre]  = useState('Long-form interview')
  const [tags,   setTags]   = useState('')
  const [notes,  setNotes]  = useState('')
  const [copied, setCopied] = useState(false)

  const entry = { title, host, genre, tags, notes, date: new Date().toISOString().slice(0,10) }
  const cmd = title.trim() ? podcastCommand(entry) : ''

  function handleSave() {
    if (!title.trim()) return
    onAdd(entry)
    setTitle(''); setHost(''); setTags(''); setNotes('')
  }

  return (
    <div className="log-form">
      <div className="log-form-grid">
        <label>
          <span>Podcast Title *</span>
          <input placeholder="e.g. Acquired" value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <label>
          <span>Host(s)</span>
          <input placeholder="e.g. Ben Gilbert, David Rosenthal" value={host} onChange={e => setHost(e.target.value)} />
        </label>
        <label>
          <span>Genre</span>
          <select value={genre} onChange={e => setGenre(e.target.value)}>
            {POD_GENRES.map(g => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label>
          <span>Tags</span>
          <input placeholder="e.g. investing, technology, long-form" value={tags} onChange={e => setTags(e.target.value)} />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          <span>Notes (optional)</span>
          <input placeholder="Episode or show notes…" value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
      </div>

      {cmd && (
        <div className="cmd-preview">
          <code>{cmd}</code>
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={() => copyText(cmd, setCopied)}
          >
            {copied ? '✓ Copied' : 'Copy command'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--sp3)', marginTop: 'var(--sp4)' }}>
        <button className="filter-btn active" onClick={handleSave} disabled={!title.trim()}>
          Save to queue
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)', alignSelf: 'center' }}>
          Saves here + paste command into Claude Code to add to wiki
        </span>
      </div>
    </div>
  )
}

export default function LogPanel() {
  const [sub,      setSub]      = useState('books')
  const [books,    setBooks]    = useState(() => loadPending(STORAGE_KEY_BOOKS))
  const [podcasts, setPodcasts] = useState(() => loadPending(STORAGE_KEY_PODCASTS))

  useEffect(() => { savePending(STORAGE_KEY_BOOKS,    books)    }, [books])
  useEffect(() => { savePending(STORAGE_KEY_PODCASTS, podcasts) }, [podcasts])

  function addBook(b)    { setBooks(prev    => [b, ...prev]) }
  function addPodcast(p) { setPodcasts(prev => [p, ...prev]) }
  function removeBook(i)    { setBooks(prev    => prev.filter((_, j) => j !== i)) }
  function removePodcast(i) { setPodcasts(prev => prev.filter((_, j) => j !== i)) }

  return (
    <div className="log-wrap">
      <div className="filter-row" style={{ marginBottom: 'var(--sp6)' }}>
        <span className="filter-label">Log a</span>
        <button className={`filter-btn${sub === 'books' ? ' active' : ''}`} onClick={() => setSub('books')}>
          Book read
        </button>
        <button className={`filter-btn${sub === 'podcasts' ? ' active' : ''}`} onClick={() => setSub('podcasts')}>
          Podcast listened
        </button>
      </div>

      {sub === 'books' && (
        <>
          <div className="card" style={{ marginBottom: 'var(--sp6)' }}>
            <div className="card-label">Add book</div>
            <BookForm onAdd={addBook} />
          </div>
          <div className="card">
            <div className="card-label">Queue ({books.length})</div>
            <PendingList
              items={books}
              onRemove={removeBook}
              cmdFn={bookCommand}
              emptyMsg="No books in queue. Add one above."
            />
          </div>
        </>
      )}

      {sub === 'podcasts' && (
        <>
          <div className="card" style={{ marginBottom: 'var(--sp6)' }}>
            <div className="card-label">Add podcast</div>
            <PodcastForm onAdd={addPodcast} />
          </div>
          <div className="card">
            <div className="card-label">Queue ({podcasts.length})</div>
            <PendingList
              items={podcasts}
              onRemove={removePodcast}
              cmdFn={podcastCommand}
              emptyMsg="No podcasts in queue. Add one above."
            />
          </div>
        </>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--text4)', marginTop: 'var(--sp6)' }}>
        Queue is saved in browser localStorage. Copy the command and paste into Claude Code to write it to your wiki.
        The daily add-book / add-podcast jobs will process it from there.
      </p>
    </div>
  )
}
