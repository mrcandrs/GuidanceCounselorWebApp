using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GuidanceOfficeAPI.Data;
using GuidanceOfficeAPI.Models;
using GuidanceOfficeAPI.Dtos;

namespace GuidanceOfficeAPI.Controllers
{
    [ApiController]
    [Route("api/endorsement-custody")]
    public class EndorsementCustodyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EndorsementCustodyController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/endorsement-custody
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EndorsementCustodyFormDto>>> GetEndorsementCustodyForms()
        {
            try
            {
                var forms = await _context.EndorsementCustodyForms
                    .Include(f => f.Student)
                    .Include(f => f.Counselor)
                    .OrderByDescending(f => f.Date)
                    .Select(f => new EndorsementCustodyFormDto
                    {
                        CustodyId = f.CustodyId,
                        StudentId = f.StudentId,
                        CounselorId = f.CounselorId,
                        Date = f.Date,
                        GradeYearLevel = f.GradeYearLevel,
                        Section = f.Section,
                        Concerns = f.Concerns,
                        Interventions = f.Interventions,
                        Recommendations = f.Recommendations,
                        Referrals = f.Referrals,
                        EndorsedBy = f.EndorsedBy,
                        EndorsedTo = f.EndorsedTo,
                        CreatedAt = f.CreatedAt,
                        Student = f.Student != null ? new StudentDto
                        {
                            StudentId = f.Student.StudentId,
                            FullName = f.Student.FullName,
                            StudentNumber = f.Student.StudentNumber
                        } : null,
                        Counselor = f.Counselor != null ? new CounselorDto
                        {
                            CounselorId = f.Counselor.CounselorId,
                            Name = f.Counselor.Name,
                            Email = f.Counselor.Email
                        } : null
                    })
                    .ToListAsync();

                return Ok(forms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching endorsement custody forms", error = ex.Message });
            }
        }

        // GET: api/endorsement-custody/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EndorsementCustodyFormDto>> GetEndorsementCustodyForm(int id)
        {
            try
            {
                var form = await _context.EndorsementCustodyForms
                    .Include(f => f.Student)
                    .Include(f => f.Counselor)
                    .Where(f => f.CustodyId == id)
                    .Select(f => new EndorsementCustodyFormDto
                    {
                        CustodyId = f.CustodyId,
                        StudentId = f.StudentId,
                        CounselorId = f.CounselorId,
                        Date = f.Date,
                        GradeYearLevel = f.GradeYearLevel,
                        Section = f.Section,
                        Concerns = f.Concerns,
                        Interventions = f.Interventions,
                        Recommendations = f.Recommendations,
                        Referrals = f.Referrals,
                        EndorsedBy = f.EndorsedBy,
                        EndorsedTo = f.EndorsedTo,
                        CreatedAt = f.CreatedAt,
                        Student = f.Student != null ? new StudentDto
                        {
                            StudentId = f.Student.StudentId,
                            FullName = f.Student.FullName,
                            StudentNumber = f.Student.StudentNumber
                        } : null,
                        Counselor = f.Counselor != null ? new CounselorDto
                        {
                            CounselorId = f.Counselor.CounselorId,
                            Name = f.Counselor.Name,
                            Email = f.Counselor.Email
                        } : null
                    })
                    .FirstOrDefaultAsync();

                if (form == null)
                {
                    return NotFound(new { message = "Endorsement custody form not found" });
                }

                return Ok(form);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching endorsement custody form", error = ex.Message });
            }
        }

        // POST: api/endorsement-custody
        [HttpPost]
        public async Task<ActionResult<EndorsementCustodyFormDto>> CreateEndorsementCustodyForm(CreateEndorsementCustodyFormDto createDto)
        {
            try
            {
                // Get counselor ID from JWT token
                var counselorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                // Verify student exists
                var studentExists = await _context.Students.AnyAsync(s => s.StudentId == createDto.StudentId);
                if (!studentExists)
                {
                    return BadRequest(new { message = "Student not found" });
                }

                var form = new EndorsementCustodyForm
                {
                    StudentId = createDto.StudentId,
                    CounselorId = counselorId,
                    Date = createDto.Date,
                    GradeYearLevel = createDto.GradeYearLevel,
                    Section = createDto.Section,
                    Concerns = createDto.Concerns,
                    Interventions = createDto.Interventions,
                    Recommendations = createDto.Recommendations,
                    Referrals = createDto.Referrals,
                    EndorsedBy = createDto.EndorsedBy,
                    EndorsedTo = createDto.EndorsedTo,
                    CreatedAt = DateTime.Now
                };

                _context.EndorsementCustodyForms.Add(form);
                await _context.SaveChangesAsync();

                // Fetch the created form with related data
                var createdForm = await _context.EndorsementCustodyForms
                    .Include(f => f.Student)
                    .Include(f => f.Counselor)
                    .Where(f => f.CustodyId == form.CustodyId)
                    .Select(f => new EndorsementCustodyFormDto
                    {
                        CustodyId = f.CustodyId,
                        StudentId = f.StudentId,
                        CounselorId = f.CounselorId,
                        Date = f.Date,
                        GradeYearLevel = f.GradeYearLevel,
                        Section = f.Section,
                        Concerns = f.Concerns,
                        Interventions = f.Interventions,
                        Recommendations = f.Recommendations,
                        Referrals = f.Referrals,
                        EndorsedBy = f.EndorsedBy,
                        EndorsedTo = f.EndorsedTo,
                        CreatedAt = f.CreatedAt,
                        Student = f.Student != null ? new StudentDto
                        {
                            StudentId = f.Student.StudentId,
                            FullName = f.Student.FullName,
                            StudentNumber = f.Student.StudentNumber
                        } : null,
                        Counselor = f.Counselor != null ? new CounselorDto
                        {
                            CounselorId = f.Counselor.CounselorId,
                            Name = f.Counselor.Name,
                            Email = f.Counselor.Email
                        } : null
                    })
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetEndorsementCustodyForm),
                    new { id = form.CustodyId }, createdForm);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating endorsement custody form", error = ex.Message });
            }
        }

        // PUT: api/endorsement-custody/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEndorsementCustodyForm(int id, UpdateEndorsementCustodyFormDto updateDto)
        {
            try
            {
                // Get counselor ID from JWT token
                var counselorIdClaim = User.FindFirst("CounselorId")?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                var form = await _context.EndorsementCustodyForms.FindAsync(id);
                if (form == null)
                {
                    return NotFound(new { message = "Endorsement custody form not found" });
                }

                // Verify the form belongs to the authenticated counselor
                if (form.CounselorId != counselorId)
                {
                    return Forbid("You can only update your own forms");
                }

                // Verify student exists if studentId is being changed
                if (form.StudentId != updateDto.StudentId)
                {
                    var studentExists = await _context.Students.AnyAsync(s => s.StudentId == updateDto.StudentId);
                    if (!studentExists)
                    {
                        return BadRequest(new { message = "Student not found" });
                    }
                }

                // Update form properties
                form.StudentId = updateDto.StudentId;
                form.Date = updateDto.Date;
                form.GradeYearLevel = updateDto.GradeYearLevel;
                form.Section = updateDto.Section;
                form.Concerns = updateDto.Concerns;
                form.Interventions = updateDto.Interventions;
                form.Recommendations = updateDto.Recommendations;
                form.Referrals = updateDto.Referrals;
                form.EndorsedBy = updateDto.EndorsedBy;
                form.EndorsedTo = updateDto.EndorsedTo;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating endorsement custody form", error = ex.Message });
            }
        }

        // DELETE: api/endorsement-custody/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEndorsementCustodyForm(int id)
        {
            try
            {
                // Get counselor ID from JWT token
                var counselorIdClaim = User.FindFirst("CounselorId")?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                var form = await _context.EndorsementCustodyForms.FindAsync(id);
                if (form == null)
                {
                    return NotFound(new { message = "Endorsement custody form not found" });
                }

                // Verify the form belongs to the authenticated counselor
                if (form.CounselorId != counselorId)
                {
                    return Forbid("You can only delete your own forms");
                }

                _context.EndorsementCustodyForms.Remove(form);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting endorsement custody form", error = ex.Message });
            }
        }

        // GET: api/endorsement-custody/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<EndorsementCustodyFormDto>>> GetEndorsementCustodyFormsByStudent(int studentId)
        {
            try
            {
                var forms = await _context.EndorsementCustodyForms
                    .Include(f => f.Student)
                    .Include(f => f.Counselor)
                    .Where(f => f.StudentId == studentId)
                    .OrderByDescending(f => f.Date)
                    .Select(f => new EndorsementCustodyFormDto
                    {
                        CustodyId = f.CustodyId,
                        StudentId = f.StudentId,
                        CounselorId = f.CounselorId,
                        Date = f.Date,
                        GradeYearLevel = f.GradeYearLevel,
                        Section = f.Section,
                        Concerns = f.Concerns,
                        Interventions = f.Interventions,
                        Recommendations = f.Recommendations,
                        Referrals = f.Referrals,
                        EndorsedBy = f.EndorsedBy,
                        EndorsedTo = f.EndorsedTo,
                        CreatedAt = f.CreatedAt,
                        Student = f.Student != null ? new StudentDto
                        {
                            StudentId = f.Student.StudentId,
                            FullName = f.Student.FullName,
                            StudentNumber = f.Student.StudentNumber
                        } : null,
                        Counselor = f.Counselor != null ? new CounselorDto
                        {
                            CounselorId = f.Counselor.CounselorId,
                            Name = f.Counselor.Name,
                            Email = f.Counselor.Email
                        } : null
                    })
                    .ToListAsync();

                return Ok(forms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching student endorsement custody forms", error = ex.Message });
            }
        }

        // GET: api/endorsement-custody/student-details/{studentId}
        [HttpGet("student-details/{studentId}")]
        public async Task<ActionResult<object>> GetStudentDetailsFromCareerPlan(int studentId)
        {
            try
            {
                // First, try to get details from the most recent Career Planning Form
                var careerPlanDetails = await _context.CareerPlanningForms
                    .Where(c => c.StudentId == studentId)
                    .OrderByDescending(c => c.SubmittedAt)
                    .Select(c => new {
                        GradeYear = c.GradeYear,
                        Section = c.Section,
                        Program = c.Program,
                        FullName = c.FullName
                    })
                    .FirstOrDefaultAsync();

                if (careerPlanDetails != null)
                {
                    return Ok(new {
                        gradeYearLevel = careerPlanDetails.GradeYear,
                        section = careerPlanDetails.Section,
                        program = careerPlanDetails.Program,
                        fullName = careerPlanDetails.FullName,
                        source = "CareerPlanningForm"
                    });
                }

                // Fallback to Student table if no Career Planning Form exists
                var studentDetails = await _context.Students
                    .Where(s => s.StudentId == studentId)
                    .Select(s => new {
                        GradeYear = s.GradeYear,
                        Program = s.Program,
                        FullName = s.FullName
                    })
                    .FirstOrDefaultAsync();

                if (studentDetails != null)
                {
                    return Ok(new {
                        gradeYearLevel = studentDetails.GradeYear,
                        section = "", // Student table doesn't have section
                        program = studentDetails.Program,
                        fullName = studentDetails.FullName,
                        source = "StudentTable"
                    });
                }

                return NotFound(new { message = "Student details not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching student details", error = ex.Message });
            }
        }

        // GET: api/endorsement-custody/current-counselor
        [HttpGet("current-counselor")]
        public async Task<ActionResult<object>> GetCurrentCounselorDetails()
        {
            try
            {
                // Get counselor ID from JWT token
                var counselorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                var counselor = await _context.Counselors
                    .Where(c => c.CounselorId == counselorId)
                    .Select(c => new {
                        CounselorId = c.CounselorId,
                        Name = c.Name,
                        Email = c.Email
                    })
                    .FirstOrDefaultAsync();

                if (counselor != null)
                {
                    return Ok(new {
                        counselorId = counselor.CounselorId,
                        name = counselor.Name,
                        email = counselor.Email
                    });
                }

                return NotFound(new { message = "Counselor not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching counselor details", error = ex.Message });
            }
        }
    }
}