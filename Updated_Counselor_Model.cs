using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GuidanceOfficeAPI.Models
{
    public class Counselor
    {
        [Key]
        public int CounselorId { get; set; }

        [Required, MaxLength(255)]
        public string Email { get; set; }

        [Required, MaxLength(255)]
        public string Name { get; set; }

        [Required, MaxLength(255)]
        public string Password { get; set; }

        public byte[]? ProfileImage { get; set; } // Profile image as byte array

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLogin { get; set; }

        // Navigation properties
        public virtual ICollection<CounselorSession> Sessions { get; set; } = new List<CounselorSession>();
    }
}
