import { useEffect, useState } from 'react'

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

interface PagedBooksResponse {
  books: Book[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  sortTitle: string
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const

export function BookList() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortTitle, setSortTitle] = useState<'asc' | 'desc'>('asc')
  const [data, setData] = useState<PagedBooksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortTitle,
    })
    fetch(`/api/Books?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load books (${res.status})`)
        return res.json() as Promise<PagedBooksResponse>
      })
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Something went wrong')
      )
      .finally(() => setLoading(false))
  }, [page, pageSize, sortTitle])

  const onPageSizeChange = (value: number) => {
    setPageSize(value)
    setPage(1)
  }

  const toggleTitleSort = () => {
    setSortTitle((s) => (s === 'asc' ? 'desc' : 'asc'))
    setPage(1)
  }

  return (
    <div className="book-list card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <h2 className="h4 mb-0">Catalog</h2>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <label className="mb-0 small text-secondary" htmlFor="page-size">
              Per page
            </label>
            <select
              id="page-size"
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={toggleTitleSort}
              title="Sort by book title"
            >
              Title {sortTitle === 'asc' ? 'A–Z' : 'Z–A'}
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-secondary mb-0" role="status">
            Loading books…
          </p>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Author</th>
                    <th scope="col">Publisher</th>
                    <th scope="col">ISBN</th>
                    <th scope="col">Classification</th>
                    <th scope="col">Category</th>
                    <th scope="col" className="text-end">
                      Pages
                    </th>
                    <th scope="col" className="text-end">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.books.map((b) => (
                    <tr key={b.bookId}>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.publisher}</td>
                      <td>
                        <code className="small">{b.isbn}</code>
                      </td>
                      <td>{b.classification}</td>
                      <td>{b.category}</td>
                      <td className="text-end">{b.pageCount.toLocaleString()}</td>
                      <td className="text-end">
                        {b.price.toLocaleString(undefined, {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2 border-top">
              <p className="small text-secondary mb-0">
                Showing{' '}
                {data.totalCount === 0
                  ? '0'
                  : `${(data.page - 1) * data.pageSize + 1}–${Math.min(
                      data.page * data.pageSize,
                      data.totalCount
                    )}`}{' '}
                of {data.totalCount} books
              </p>
              {data.totalPages > 1 && (
                <nav aria-label="Book pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${data.page <= 1 ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={data.page <= 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <li
                          key={n}
                          className={`page-item ${n === data.page ? 'active' : ''}`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setPage(n)}
                            aria-current={n === data.page ? 'page' : undefined}
                          >
                            {n}
                          </button>
                        </li>
                      )
                    )}
                    <li
                      className={`page-item ${
                        data.page >= data.totalPages ? 'disabled' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={() =>
                          setPage((p) => Math.min(data.totalPages, p + 1))
                        }
                        disabled={data.page >= data.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
