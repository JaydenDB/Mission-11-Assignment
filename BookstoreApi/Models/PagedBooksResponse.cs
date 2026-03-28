namespace BookstoreApi.Models;

public class PagedBooksResponse
{
    public IReadOnlyList<Book> Books { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public string SortTitle { get; init; } = "asc";

    /// <summary>
    /// When set, results are limited to this category; empty string means all categories.
    /// </summary>
    public string CategoryFilter { get; init; } = string.Empty;
}
