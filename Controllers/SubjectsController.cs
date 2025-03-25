// Controllers/SubjectsController.cs
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BooksApp.Models;

namespace BooksApp.Controllers
{
    public class SubjectsController : Controller
    {
        private readonly BooksDbContext _context;

        public SubjectsController(BooksDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSubjects(string searchTerm = null)
        {
            var query = _context.Subjects.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(s => s.Name.Contains(searchTerm));
            }

            var subjects = await query.ToListAsync();
            return Json(subjects);
        }

        [HttpGet]
        public async Task<IActionResult> GetSubtopics(int subjectId)
        {
            var subtopics = await _context.Subtopics
                .Where(s => s.SubjectId == subjectId)
                .ToListAsync();

            return Json(subtopics);
        }

        [HttpPost]
        public IActionResult AddSubject([FromBody] SubjectViewModel model)
        {
            try
            {
                if (model == null || string.IsNullOrWhiteSpace(model.SubjectName))
                {
                    return Json(new { success = false, message = "Invalid input data" });
                }

                var subject = new Subject
                {
                    Name = model.SubjectName,
                    Subtopics = model.SubtopicNames.Select(s => new Subtopic { Name = s }).ToList()
                };

                _context.Subjects.Add(subject);
                _context.SaveChanges();

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult EditSubject([FromBody] Subject updatedSubject)
        {
            var subject = _context.Subjects.FirstOrDefault(s => s.Id == updatedSubject.Id);

            if (subject == null)
            {
                return Json(new { success = false, message = "Subject not found" });
            }

            subject.Name = updatedSubject.Name;
            _context.SaveChanges();

            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult DeleteSubject([FromBody] Subject deleteRequest)
        {
            var subject = _context.Subjects.FirstOrDefault(s => s.Id == deleteRequest.Id);

            if (subject == null)
            {
                return Json(new { success = false, message = "Subject not found" });
            }

            _context.Subjects.Remove(subject);
            _context.SaveChanges();

            return Json(new { success = true });
        }



    }
}