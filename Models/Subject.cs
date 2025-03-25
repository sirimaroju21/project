// Models/Subject.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BooksApp.Models
{
    public class Subject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public virtual ICollection<Subtopic> Subtopics { get; set; }
    }
}