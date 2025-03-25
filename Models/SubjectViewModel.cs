// Models/SubjectViewModel.cs
using System.Collections.Generic;

namespace BooksApp.Models
{
    public class SubjectViewModel
    {
        public string SubjectName { get; set; }
        public List<string> SubtopicNames { get; set; } = new List<string>();
    }
}