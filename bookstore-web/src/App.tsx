/*
 * Learning Suite note for graders: #notcovered Bootstrap features (see BookList.tsx):
 * 1) sticky-top — keeps the cart summary column pinned while scrolling the catalog.
 * 2) placeholder + placeholder-glow — skeleton loading rows in the books table.
 */
import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { BookList } from './components/BookList'
import { CartPage } from './components/CartPage'
import { useCart } from './context/CartContext'
import './App.css'

function AppShell() {
  const { itemCount } = useCart()

  return (
    <div className="app-root min-vh-100 d-flex flex-column">
      <header className="bg-primary text-white py-4 mb-4 shadow-sm">
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md">
              <h1 className="h3 mb-1">Mission 12 Bookstore</h1>
              <p className="mb-0 opacity-75 small">
                Filter by category, page through results, and shop with a session cart.
              </p>
            </div>
            <div className="col-12 col-md-auto">
              <nav
                className="nav nav-pills flex-column flex-sm-row gap-2 justify-content-md-end"
                aria-label="Primary"
              >
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active bg-light text-primary' : 'text-white'}`
                  }
                >
                  Catalog
                </NavLink>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active bg-light text-primary' : 'text-white'}`
                  }
                >
                  Cart
                  {itemCount > 0 ? (
                    <span className="badge rounded-pill text-bg-light text-primary ms-2">
                      {itemCount}
                    </span>
                  ) : null}
                </NavLink>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main className="container flex-grow-1 pb-5">
        <Outlet />
      </main>
      <footer className="border-top py-3 mt-auto bg-light">
        <div className="container text-center small text-secondary">
          IS 413 · ASP.NET Core API &amp; React
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<BookList />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>
    </Routes>
  )
}

export default App
