import { BookList } from './components/BookList'
import './App.css'

function App() {
  return (
    <div className="app-root min-vh-100 d-flex flex-column">
      <header className="bg-primary text-white py-4 mb-4 shadow-sm">
        <div className="container">
          <h1 className="h3 mb-1">Mission 11 Bookstore</h1>
          <p className="mb-0 opacity-75 small">
            Browse titles from the catalog — paginated, sortable by title.
          </p>
        </div>
      </header>
      <main className="container flex-grow-1 pb-5">
        <BookList />
      </main>
      <footer className="border-top py-3 mt-auto bg-light">
        <div className="container text-center small text-secondary">
          IS 413 · ASP.NET Core API &amp; React
        </div>
      </footer>
    </div>
  )
}

export default App
