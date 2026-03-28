import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export function CartPage() {
  const {
    lines,
    returnSearch,
    grandTotal,
    lineSubtotal,
    setQuantity,
    removeLine,
  } = useCart()
  const navigate = useNavigate()

  // Go back to the catalog with the same filters you had when you last hit "Add".
  const continueShopping = () => {
    const qs = returnSearch.trim()
    navigate(qs ? `/?${qs}` : '/')
  }

  const formatMoney = (n: number) =>
    n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h2 className="h4 mb-0">Shopping cart</h2>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={continueShopping}
                >
                  Continue shopping
                </button>
                <Link to="/" className="btn btn-outline-primary btn-sm">
                  Browse catalog
                </Link>
              </div>
            </div>

            {lines.length === 0 ? (
              <p className="text-secondary mb-0">
                Your cart is empty.{' '}
                <Link to="/">Return to the catalog</Link> to add books.
              </p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-striped align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col" className="text-end">
                          Price
                        </th>
                        <th scope="col" className="text-end" style={{ width: '11rem' }}>
                          Qty
                        </th>
                        <th scope="col" className="text-end">
                          Subtotal
                        </th>
                        <th scope="col" className="text-end" style={{ width: '5rem' }}>
                          {' '}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr key={line.bookId}>
                          <td>{line.title}</td>
                          <td className="text-end">{formatMoney(line.unitPrice)}</td>
                          <td className="text-end">
                            <div
                              className="input-group input-group-sm justify-content-end"
                              style={{ maxWidth: '11rem', marginLeft: 'auto' }}
                            >
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setQuantity(line.bookId, line.quantity - 1)
                                }
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                min={1}
                                className="form-control text-end"
                                value={line.quantity}
                                onChange={(e) =>
                                  setQuantity(
                                    line.bookId,
                                    Number(e.target.value)
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setQuantity(line.bookId, line.quantity + 1)
                                }
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-end fw-semibold">
                            {formatMoney(lineSubtotal(line))}
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-danger text-decoration-none p-0"
                              onClick={() => removeLine(line.bookId)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={continueShopping}
                  >
                    Continue shopping
                  </button>
                  <p className="h5 mb-0">
                    Total:{' '}
                    <span className="text-primary">{formatMoney(grandTotal)}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
