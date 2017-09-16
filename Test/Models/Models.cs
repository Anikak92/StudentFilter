using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.Data.Linq;
using System.ComponentModel.DataAnnotations;

namespace Test.Models
{
	public class TestContext : DbContext
	{
		public TestContext() : base("TestContext")
        {
			// Указывает EF, что если модель изменилась,
			// нужно воссоздать базу данных с новой структурой
			//Database.SetInitializer(
			//	new DropCreateDatabaseIfModelChanges<TestContext>());
			//Database.SetInitializer<TestContext>(null);

		}
		public DbSet<Marks> Mark{ get; set; }
		public DbSet<Students> Student { get; set; }
		public DbSet<Competences> Competence { get; set; }


	}

	public class Marks
	{
		[Key]
		public int MarkId { get; set; }
		public int StudentId { get; set; }
		public int CompetenceId { get; set; }
		public Byte Score { get; set; }
		public virtual Competences Competence { get; set; }
		public virtual Students Student { get; set; }
	}
	public class Students
	{
		[Key]
		public int StudentId { get; set; }
		public string FIO { get; set; }
		public virtual ICollection<Marks> Marks { get; set; }
	}
	public class Competences
	{
		[Key]
		public int CompetenceId { get; set; }
		public string Type { get; set; }
		public virtual ICollection<Marks> Marks { get; set; }

	}


}