namespace BookstoreApi.Models;

public class PagedBooksResponse
{
    public IReadOnlyList<Book> Books { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public string SortTitle { get; init; } = "asc";

    // Echoes what we filtered by (blank = everything).
    public string CategoryFilter { get; init; } = string.Empty;
}
