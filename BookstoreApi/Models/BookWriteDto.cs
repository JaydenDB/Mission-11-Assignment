using System.ComponentModel.DataAnnotations;

namespace BookstoreApi.Models;

// Fields the admin form sends when creating or replacing a book (no id — the DB assigns it).
public class BookWriteDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Author { get; set; } = string.Empty;

    [Required]
    public string Publisher { get; set; } = string.Empty;

    [Required]
    public string ISBN { get; set; } = string.Empty;

    [Required]
    public string Classification { get; set; } = string.Empty;

    [Required]
    public string Category { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int PageCount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }
}
