using GuidanceOfficeAPI.Data;
using GuidanceOfficeAPI.Dtos;
using GuidanceOfficeAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GuidanceOfficeAPI.Controllers
{
    [ApiController]
    [Route("api/counselor")]
    public class CounselorAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public CounselorAuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] CounselorLoginDto dto)
        {
            try
            {
                Console.WriteLine($"Login attempt for {dto.Email}");
                Console.WriteLine($"DeviceId: '{dto.DeviceId}'");
                Console.WriteLine($"SessionId: '{dto.SessionId}'");

                var counselor = await _context.Counselors
                    .FirstOrDefaultAsync(c => c.Email == dto.Email);

                if (counselor == null)
                {
                    Console.WriteLine("Counselor not found.");
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                Console.WriteLine($"Found counselor with ID: {counselor.CounselorId}");

                if (counselor.Password != dto.Password)
                {
                    Console.WriteLine("Invalid password.");
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                // Update last login
                counselor.LastLogin = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // ✅ FIXED: Invalidate all other sessions for this counselor, regardless of device
                // This will invalidate sessions from other tabs on the same device AND other devices
                if (!string.IsNullOrEmpty(dto.SessionId))
                {
                    var otherSessions = await _context.CounselorSessions
                        .Where(s => s.CounselorId == counselor.CounselorId &&
                                   s.SessionIdentifier != dto.SessionId && // ✅ Use SessionIdentifier instead of DeviceId
                                   s.IsActive)
                        .ToListAsync();

                    Console.WriteLine($"Found {otherSessions.Count} other active sessions to invalidate");

                    foreach (var session in otherSessions)
                    {
                        session.IsActive = false;
                        session.InvalidatedAt = DateTime.UtcNow;
                        session.InvalidationReason = "Logged in on another session/device";
                        Console.WriteLine($"  Invalidating session: SessionId='{session.SessionIdentifier}', DeviceId='{session.DeviceId}'");
                    }

                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Invalidated {otherSessions.Count} other sessions for counselor {counselor.CounselorId}");
                }

                // Create new session record
                if (!string.IsNullOrEmpty(dto.DeviceId) && !string.IsNullOrEmpty(dto.SessionId))
                {
                    var newSession = new CounselorSession
                    {
                        CounselorId = counselor.CounselorId,
                        DeviceId = dto.DeviceId,
                        SessionIdentifier = dto.SessionId,
                        CreatedAt = DateTime.UtcNow,
                        LastActivity = DateTime.UtcNow,
                        IsActive = true
                    };

                    _context.CounselorSessions.Add(newSession);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Created new session for counselor {counselor.CounselorId} with SessionId: {dto.SessionId}");
                }

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, counselor.CounselorId.ToString()),
                    new Claim(ClaimTypes.Email, counselor.Email),
                    new Claim(ClaimTypes.Name, counselor.Name)
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(1),
                    signingCredentials: creds
                );

                Console.WriteLine("Login successful.");

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    counselor = new
                    {
                        id = counselor.CounselorId,
                        name = counselor.Name,
                        email = counselor.Email,
                        profileImage = counselor.ProfileImage != null ? Convert.ToBase64String(counselor.ProfileImage) : null
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Login exception: " + ex.Message);
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        // GET: api/counselor/me
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentCounselor()
        {
            try
            {
                var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(idStr)) return Unauthorized(new { message = "Invalid token." });

                int counselorId = int.Parse(idStr);

                var counselor = await _context.Counselors
                    .Where(c => c.CounselorId == counselorId)
                    .Select(c => new
                    {
                        id = c.CounselorId,
                        email = c.Email,
                        name = c.Name,
                        profileImage = c.ProfileImage != null ? Convert.ToBase64String(c.ProfileImage) : null,
                        createdAt = c.CreatedAt,
                        lastLogin = c.LastLogin
                    })
                    .FirstOrDefaultAsync();

                if (counselor == null)
                    return NotFound(new { message = "Counselor not found." });

                return Ok(counselor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("validate-session")]
        public async Task<IActionResult> ValidateSession([FromBody] SessionValidationRequest request)
        {
            try
            {
                // Get counselor ID from JWT token
                var counselorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                // Check if session exists and is valid
                var activeSession = await _context.CounselorSessions
                    .FirstOrDefaultAsync(s =>
                        s.CounselorId == counselorId &&
                        s.SessionIdentifier == request.SessionId &&
                        s.DeviceId == request.DeviceId &&
                        s.IsActive);

                if (activeSession == null)
                {
                    return Ok(new
                    {
                        isValid = false,
                        reason = "Session not found or invalidated"
                    });
                }

                // Check if session has expired (older than 30 minutes)
                var sessionAge = DateTime.UtcNow - activeSession.CreatedAt;
                if (sessionAge.TotalMinutes > 30)
                {
                    // Mark session as inactive
                    activeSession.IsActive = false;
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        isValid = false,
                        reason = "Session expired"
                    });
                }

                // Update last activity
                activeSession.LastActivity = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    isValid = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error validating session",
                    error = ex.Message
                });
            }
        }

        [HttpPost("invalidate-other-sessions")]
        public async Task<IActionResult> InvalidateOtherSessions([FromBody] InvalidateSessionsRequest request)
        {
            try
            {
                // Get counselor ID from JWT token
                var counselorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                // ✅ FIXED: Invalidate all other sessions for this counselor except the current one
                var otherSessions = await _context.CounselorSessions
                    .Where(s => s.CounselorId == counselorId &&
                               s.SessionIdentifier != request.CurrentSessionId && // ✅ Use SessionIdentifier instead of DeviceId
                               s.IsActive)
                    .ToListAsync();

                foreach (var session in otherSessions)
                {
                    session.IsActive = false;
                    session.InvalidatedAt = DateTime.UtcNow;
                    session.InvalidationReason = "Logged in on another session/device";
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Other sessions invalidated successfully",
                    invalidatedCount = otherSessions.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error invalidating sessions",
                    error = ex.Message
                });
            }
        }

        [HttpPost("cleanup-sessions")]
        public async Task<IActionResult> CleanupOldSessions()
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-7);
            var oldSessions = await _context.CounselorSessions
                .Where(s => !s.IsActive && s.CreatedAt < cutoffDate)
                .ToListAsync();

            _context.CounselorSessions.RemoveRange(oldSessions);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Cleaned up {oldSessions.Count} old sessions" });
        }

        // Profile Management Endpoints
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var counselorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                var counselor = await _context.Counselors
                    .FirstOrDefaultAsync(c => c.CounselorId == counselorId);

                if (counselor == null)
                {
                    return NotFound(new { message = "Counselor not found" });
                }

                // Check if email is already taken by another counselor
                if (request.Email != counselor.Email)
                {
                    var existingCounselor = await _context.Counselors
                        .FirstOrDefaultAsync(c => c.Email == request.Email && c.CounselorId != counselorId);

                    if (existingCounselor != null)
                    {
                        return BadRequest(new { message = "Email is already in use by another counselor" });
                    }
                }

                // Update counselor information
                counselor.Name = request.Name;
                counselor.Email = request.Email;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = counselor.CounselorId,
                    name = counselor.Name,
                    email = counselor.Email,
                    profileImage = counselor.ProfileImage != null ? Convert.ToBase64String(counselor.ProfileImage) : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating profile", error = ex.Message });
            }
        }

        [HttpPut("password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
        {
            try
            {
                var counselorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                var counselor = await _context.Counselors
                    .FirstOrDefaultAsync(c => c.CounselorId == counselorId);

                if (counselor == null)
                {
                    return NotFound(new { message = "Counselor not found" });
                }

                // Verify current password
                if (counselor.Password != request.CurrentPassword)
                {
                    return BadRequest(new { message = "Current password is incorrect" });
                }

                // Update password
                counselor.Password = request.NewPassword;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating password", error = ex.Message });
            }
        }

        [HttpPut("photo")]
        public async Task<IActionResult> UpdatePhoto()
        {
            try
            {
                var counselorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(counselorIdClaim) || !int.TryParse(counselorIdClaim, out int counselorId))
                {
                    return Unauthorized(new { message = "Invalid counselor authentication" });
                }

                var counselor = await _context.Counselors
                    .FirstOrDefaultAsync(c => c.CounselorId == counselorId);

                if (counselor == null)
                {
                    return NotFound(new { message = "Counselor not found" });
                }

                var file = Request.Form.Files.FirstOrDefault();
                if (file == null)
                {
                    return BadRequest(new { message = "No file provided" });
                }

                // Validate file type
                if (!file.ContentType.StartsWith("image/"))
                {
                    return BadRequest(new { message = "File must be an image" });
                }

                // Validate file size (5MB limit)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File size must be less than 5MB" });
                }

                // Convert image to byte array
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var imageBytes = memoryStream.ToArray();

                // Update counselor photo
                counselor.ProfileImage = imageBytes;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = counselor.CounselorId,
                    name = counselor.Name,
                    email = counselor.Email,
                    profileImage = Convert.ToBase64String(imageBytes)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating photo", error = ex.Message });
            }
        }
    }

    // Request models
    public class SessionValidationRequest
    {
        [Required]
        public string SessionId { get; set; }
        [Required]
        public string DeviceId { get; set; }
    }

    public class InvalidateSessionsRequest
    {
        [Required]
        public string CurrentDeviceId { get; set; }
        [Required]
        public string CurrentSessionId { get; set; }
    }

    public class UpdateProfileRequest
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
    }

    public class UpdatePasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
