import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'

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
  categoryFilter: string
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const

function parsePositiveInt(s: string | null, fallback: number): number {
  if (s === null || s === '') return fallback
  const n = parseInt(s, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem, lines, itemCount, grandTotal, lineSubtotal } = useCart()

  const page = parsePositiveInt(searchParams.get('page'), 1)
  const rawSize = parsePositiveInt(searchParams.get('pageSize'), 5)
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawSize as (typeof PAGE_SIZE_OPTIONS)[number])
    ? rawSize
    : 5
  const sortTitle =
    searchParams.get('sortTitle') === 'desc' ? 'desc' : 'asc'
  const category = searchParams.get('category') ?? ''

  const [categories, setCategories] = useState<string[]>([])
  const [data, setData] = useState<PagedBooksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartNotice, setCartNotice] = useState<string | null>(null)

  const patchParams = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue
        if (value === '' && key === 'category') {
          next.delete('category')
        } else if (value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    fetch('/api/Books/categories')
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load categories (${res.status})`)
        return res.json() as Promise<string[]>
      })
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortTitle,
    })
    if (category.trim()) params.set('category', category.trim())
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
  }, [page, pageSize, sortTitle, category])

  useEffect(() => {
    if (!data || data.totalPages < 1) return
    if (page > data.totalPages) {
      patchParams({ page: data.totalPages })
    }
  }, [data, page, patchParams])

  const onPageSizeChange = (value: number) => {
    patchParams({ pageSize: value, page: 1 })
  }

  const toggleTitleSort = () => {
    patchParams({ sortTitle: sortTitle === 'asc' ? 'desc' : 'asc', page: 1 })
  }

  const onCategoryChange = (value: string) => {
    patchParams({ category: value, page: 1 })
  }

  const catalogSearchString = useMemo(() => searchParams.toString(), [searchParams])

  const addToCart = (book: Book) => {
    addItem(
      { bookId: book.bookId, title: book.title, price: book.price },
      catalogSearchString
    )
    setCartNotice(`“${book.title}” added to your cart.`)
    window.setTimeout(() => setCartNotice(null), 3200)
  }

  const formatMoney = (n: number) =>
    n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

  const cartPreview = useMemo(() => {
    return lines.slice(0, 4)
  }, [lines])

  const extraCartLines = Math.max(0, lines.length - cartPreview.length)

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-8 order-2 order-lg-1">
        <div className="book-list card shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h2 className="h4 mb-0">Catalog</h2>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <label className="mb-0 small text-secondary" htmlFor="category-filter">
                  Category
                </label>
                <select
                  id="category-filter"
                  className="form-select form-select-sm"
                  style={{ width: 'auto', minWidth: '10rem' }}
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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

            {cartNotice && (
              <div
                className="alert alert-success alert-dismissible fade show"
                role="status"
              >
                {cartNotice}
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Dismiss"
                  onClick={() => setCartNotice(null)}
                />
              </div>
            )}

            {loading && (
              <p className="text-secondary mb-2" role="status">
                Loading books…
              </p>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {!error && (
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
                      <th scope="col" className="text-end" style={{ width: '8rem' }}>
                        Cart
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading &&
                      Array.from({ length: pageSize }).map((_, i) => (
                        <tr key={`sk-${i}`}>
                          <td>
                            <span className="placeholder placeholder-glow w-100 d-block">
                              &nbsp;
                            </span>
                          </td>
                          <td>
                            <span className="placeholder placeholder-glow w-100 d-block">
                              &nbsp;
                            </span>
                          </td>
                          <td>
                            <span className="placeholder placeholder-glow w-100 d-block">
                              &nbsp;
                            </span>
                          </td>
                          <td>
                            <span className="placeholder placeholder-glow w-100 d-block">
                              &nbsp;
                            </span>
                          </td>
                          <td>
                            <span className="placeholder placeholder-glow w-100 d-block">
                              &nbsp;
                            </span>
                          </td>
                          <td>
                            <span className="placeholder placeholder-glow w-100 d-block">
                              &nbsp;
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="placeholder placeholder-glow d-inline-block" style={{ width: '3rem' }}>
                              &nbsp;
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="placeholder placeholder-glow d-inline-block" style={{ width: '4rem' }}>
                              &nbsp;
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="placeholder placeholder-glow d-inline-block" style={{ width: '5rem' }}>
                              &nbsp;
                            </span>
                          </td>
                        </tr>
                      ))}
                    {!loading &&
                      data &&
                      data.books.map((b) => (
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
                          <td className="text-end">{formatMoney(b.price)}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => addToCart(b)}
                            >
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && data && (
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
                  {category.trim() ? (
                    <span>
                      {' '}
                      in <span className="fw-semibold">{category.trim()}</span>
                    </span>
                  ) : null}
                </p>
                {data.totalPages > 1 && (
                  <nav aria-label="Book pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${data.page <= 1 ? 'disabled' : ''}`}>
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => patchParams({ page: Math.max(1, page - 1) })}
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
                              onClick={() => patchParams({ page: n })}
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
                            patchParams({
                              page: Math.min(data.totalPages, page + 1),
                            })
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
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4 order-1 order-lg-2">
        {/* #notcovered: sticky-top — keeps cart summary visible while scrolling the catalog */}
        <div className="sticky-top" style={{ top: '1rem' }}>
          <div className="card border-primary shadow-sm">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="h6 mb-0">Cart summary</h3>
            </div>
            <div className="card-body">
              {lines.length === 0 ? (
                <p className="text-secondary small mb-3">
                  Your cart is empty. Add books from the catalog.
                </p>
              ) : (
                <>
                  <ul className="list-group list-group-flush mb-3">
                    {cartPreview.map((line) => (
                      <li
                        key={line.bookId}
                        className="list-group-item d-flex justify-content-between align-items-start px-0"
                      >
                        <div className="me-2">
                          <div className="fw-semibold small">{line.title}</div>
                          <div className="text-secondary small">
                            {line.quantity} × {formatMoney(line.unitPrice)} ={' '}
                            {formatMoney(lineSubtotal(line))}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {extraCartLines > 0 && (
                    <p className="small text-secondary mb-2">
                      + {extraCartLines} more line{extraCartLines === 1 ? '' : 's'} in
                      your cart
                    </p>
                  )}
                  <p className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary small">Items</span>
                    <span className="fw-semibold">{itemCount}</span>
                  </p>
                  <p className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-secondary small">Estimated total</span>
                    <span className="h5 mb-0 text-primary">{formatMoney(grandTotal)}</span>
                  </p>
                </>
              )}
              <Link
                to="/cart"
                className={`btn w-100 ${lines.length === 0 ? 'btn-outline-primary' : 'btn-primary'}`}
              >
                View cart
                {itemCount > 0 ? (
                  <span className="badge text-bg-light text-primary ms-2">
                    {itemCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
