import { useCallback, useEffect, useState } from 'react'

interface Book {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

const emptyFields = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

export function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [fields, setFields] = useState(emptyFields)

  const loadBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/Books/all')
      if (!res.ok) throw new Error(`Could not load books (${res.status})`)
      const data = (await res.json()) as Book[]
      setBooks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBooks()
  }, [loadBooks])

  const startNew = () => {
    setEditingId(null)
    setFields(emptyFields)
  }

  const startEdit = (b: Book) => {
    setEditingId(b.bookId)
    setFields({
      title: b.title,
      author: b.author,
      publisher: b.publisher,
      isbn: b.isbn,
      classification: b.classification,
      category: b.category,
      pageCount: b.pageCount,
      price: b.price,
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const body = {
      title: fields.title.trim(),
      author: fields.author.trim(),
      publisher: fields.publisher.trim(),
      isbn: fields.isbn.trim(),
      classification: fields.classification.trim(),
      category: fields.category.trim(),
      pageCount: Number(fields.pageCount),
      price: Number(fields.price),
    }
    try {
      if (editingId !== null) {
        const res = await fetch(`/api/Books/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Update failed (${res.status})`)
        }
      } else {
        const res = await fetch('/api/Books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Create failed (${res.status})`)
        }
      }
      await loadBooks()
      startNew()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (b: Book) => {
    if (!window.confirm(`Delete “${b.title}”? This cannot be undone.`)) return
    setError(null)
    try {
      const res = await fetch(`/api/Books/${b.bookId}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 404) {
        throw new Error(`Delete failed (${res.status})`)
      }
      if (editingId === b.bookId) startNew()
      await loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h4 mb-3">Manage books</h2>
            <p className="text-secondary small mb-4">
              Add new books, edit existing ones, or remove them from the database.
            </p>

            <form onSubmit={submit} className="border rounded p-3 mb-4 bg-light">
              <h3 className="h6 mb-3">
                {editingId !== null ? `Edit book #${editingId}` : 'Add a book'}
              </h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-title">
                    Title
                  </label>
                  <input
                    id="adm-title"
                    className="form-control form-control-sm"
                    value={fields.title}
                    onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-author">
                    Author
                  </label>
                  <input
                    id="adm-author"
                    className="form-control form-control-sm"
                    value={fields.author}
                    onChange={(e) => setFields((f) => ({ ...f, author: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-publisher">
                    Publisher
                  </label>
                  <input
                    id="adm-publisher"
                    className="form-control form-control-sm"
                    value={fields.publisher}
                    onChange={(e) => setFields((f) => ({ ...f, publisher: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-isbn">
                    ISBN
                  </label>
                  <input
                    id="adm-isbn"
                    className="form-control form-control-sm"
                    value={fields.isbn}
                    onChange={(e) => setFields((f) => ({ ...f, isbn: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-classification">
                    Classification
                  </label>
                  <input
                    id="adm-classification"
                    className="form-control form-control-sm"
                    value={fields.classification}
                    onChange={(e) =>
                      setFields((f) => ({ ...f, classification: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-category">
                    Category
                  </label>
                  <input
                    id="adm-category"
                    className="form-control form-control-sm"
                    value={fields.category}
                    onChange={(e) => setFields((f) => ({ ...f, category: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-pages">
                    Page count
                  </label>
                  <input
                    id="adm-pages"
                    type="number"
                    min={0}
                    className="form-control form-control-sm"
                    value={fields.pageCount || ''}
                    onChange={(e) =>
                      setFields((f) => ({ ...f, pageCount: Number(e.target.value) }))
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor="adm-price">
                    Price
                  </label>
                  <input
                    id="adm-price"
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-control form-control-sm"
                    value={fields.price === 0 ? '' : fields.price}
                    onChange={(e) =>
                      setFields((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving…' : editingId !== null ? 'Update book' : 'Add book'}
                </button>
                {editingId !== null ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={startNew}
                  >
                    Cancel edit
                  </button>
                ) : null}
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={startNew}>
                  Clear form
                </button>
              </div>
            </form>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-secondary mb-0">Loading books…</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-striped align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Title</th>
                      <th scope="col">Author</th>
                      <th scope="col">Category</th>
                      <th scope="col" className="text-end">
                        Price
                      </th>
                      <th scope="col" className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((b) => (
                      <tr key={b.bookId}>
                        <td>{b.bookId}</td>
                        <td>{b.title}</td>
                        <td>{b.author}</td>
                        <td>{b.category}</td>
                        <td className="text-end">
                          {b.price.toLocaleString(undefined, {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
                        <td className="text-end text-nowrap">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm me-1"
                            onClick={() => startEdit(b)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => void remove(b)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {books.length === 0 && (
                  <p className="text-secondary small mb-0 mt-2">No books in the database yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
