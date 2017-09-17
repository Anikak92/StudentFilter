using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Configuration;
using Test.Models;
using System.Text.RegularExpressions;


namespace Test.Controllers
{
	public struct search_result
	{
		public string competence { get; set; }
		public mark[] marks { get; set; }
		public struct mark
		{
			public string Student { get; set; }
			public byte Score { get; set; }
		}
	}
	public class HomeController : Controller
	{

		TestContext db = new TestContext();

		[HttpPost]
		public ActionResult Filter(string func) {


			//string func = "[Java>40]&[PHP>40]";
			List<string> comps = new List<string>();
			var mat=Regex.Matches(func, @"(?<=\[)(.+?)(?=\])");

			IQueryable<int>[] set = new IQueryable<int>[mat.Count+1];
			set[0] = db.Student.Select(c => c.StudentId);
			for (int i = 0; i < mat.Count; i++)
			{

				string comp = mat[i].Value.Split('>')[0];
				comps.Add(comp);
				int value = Convert.ToInt32(mat[i].Value.Split('>')[1]);
				set[i + 1] = db.Mark.Where(c => c.Competence.Type == comp && c.Score > value).Select(c => c.StudentId);

			}

			var func_result = RPN.Calculate(set, replace_index(func)).ToList();
			search_result[] results = new search_result[mat.Count];
			if (func_result.Count == 0) return null;
			//var result = db.Mark.Where(u => func_result.Contains(u.StudentId) && comps.Contains(u.Competence.Type)).Select(c=>new { Competence=c.Competence.Type,Student=c.Student.FIO,Score=c.Score});
			for (int i=0; i < comps.Count; i++)
			{
				var temp = comps[i];
				
				var s= db.Mark.Where(u => func_result.Contains(u.StudentId) && u.Competence.Type== temp).ToArray().Select(c => new search_result.mark{Student = c.Student.FIO, Score = c.Score }).ToArray();
				results[i].competence = temp;
				results[i].marks = s;
			}
			return Json(results, JsonRequestBehavior.AllowGet);
		}

		public ActionResult Index()
		{

			ViewBag.Competences = db.Competence.Select(m => new SelectListItem(){ Text = m.Type }); 
			return View();
		}

		string replace_index(string str)
		{
			str=Regex.Replace(str, @"\[(.+?)\]", "+");
			int flag = 0, index = 1;
			while (flag > -1)
			{
				flag = str.IndexOf("+");
				if (flag != -1)
				{
					str = str.Remove(flag, 1).Insert(flag, index.ToString());
					index++;
				}
			}
			str=str.Replace("!", "0!");
			return str;
		}

	}
}
