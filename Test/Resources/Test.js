var search_result;
var panel_close = function (sender) { sender.parentElement.remove(); };
var change_panel_mark = function (sender) {
	s = $(sender).closest(".panel")[0];
	$(s).find("[name='Deflection']")[0].max = sender.value;
};
var search = function () {
	$("#errors").html('');
	$("#result").html('');
	$("#list").html('');
	waiter.start();
	func = get_function();
	error = validation(func);
	if (error != "") {
		$("#errors").append("<span style='color:red'>" + error + "</span>")
		waiter.stop();
	}
	else {
		var data = "{'func':'" + func + "'}";
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			dataType: 'json',
			data: data,
			url: "http://" + window.location.host + "/" + window.location.pathname.split("/")[1]+"/Home/Filter",
			success: function (data)
			{
				search_result = data;
				student_list(data);
				draw_plots(data);
				waiter.stop();
			},
			error: function (data) { $("#errors").append("<span style=''>По данным параметрам поиск не дал результата</span>"); waiter.stop(); }
		});
	}
}
var student_list = function (data)
{
	function fill_list(element, index, array) {
		str += '<li>' + element.Student + '</li>';
	}
	var str='<ol>';
	data[0].marks.forEach(fill_list);
	str += '</ol>'
	$("#list").append(str);

}
var get_function = function () {
	var s = "";
	var divs = $("#editor>div");
	for (i = 0; i < divs.length; i++) {
		if (divs[i].getAttribute("val") != "+") s += divs[i].getAttribute("val");
		else {
			comp = $(divs[i]).find("[name='Competences']")[0].value;
			val = $(divs[i]).find("[name='Mark']")[0].value - $(divs[i]).find("[name='Deflection']")[0].value
			s += "[" + comp + ">" + val + "]";
		}
	}
	return s;
}
var validation = function (str) {
	str = str.replace(/\[(.+?)\]/g, "+");
	var error = "";
	if (str.match(/\)\)|\|\||\&\&|\+\+|!!|\+!|\+\(|\&\||\&\)|\|\&|\|\)|!\&|!\||!\)|\(\&|\(\||\(\)|\)\+|\)\!|\)\(/g) != null) {
		error += "Ошибка: проверьте правильность функции <br/>";
	}
	if (str.match(/^[\&\|\)]/g) != null) {
		error += "Ошибка: блоки 'и','или',')' не могут стоять в начале функции<br/>";
	}
	if (str.match(/[\!\|\(\&]$/g) != null) {
		error += "Ошибка: блоки 'не','и','или','(' не могут стоять в конце функции<br/>";
	}
	if ((str.match(/\(/g) != null && str.match(/\)/g) != null && str.match(/\(/g).length != str.match(/\)/g).length) ||
		(str.match(/\(/g) != null && str.match(/\)/g) == null) ||
		(str.match(/\(/g) == null && str.match(/\)/g) != null)) {
		error += "Проверьте правильность расставления скобок <br/>";
	}
	return error;
}
var add_panel = function (val) {
	if (val == undefined) val = "+";
	else val = this.getAttribute("val");

	var style = "panel ", content;
	switch (val) {
		case "+": {
			style += "param"; content = $("#hiddenHtml").html();
			break;
		}
		case "&": { style += "logic"; content = "и"; break; }
		case "|": { style += "logic"; content = "или"; break; }
		case "!": { style += "logic"; content = "не"; break; }
		case "(": { style += "logic"; content = "("; break; }
		case ")": { style += "logic"; content = ")"; break; }
	}

	$("#editor").append(
		"<div class='" + style + "' val='" + val + "'>" + content + "<a onclick='panel_close(this)' /></div>");
}
var remove_panels = function () {
	$("#editor").children().remove();
	$("#result").children().remove();
	$("#errors").children().remove();
};
var new_plot = function (val, norm_value, deflection_value, node_id) {

	var norm = []; var deflection = []; var marks = []; var student = [];
	for (var i = -1; i < val.marks.length + 1; i += 1) {
		norm.push([i, norm_value]);
		deflection.push([i, norm_value - deflection_value]);
		if (i >= 0 && i < val.marks.length) {
			marks.push([i, val.marks[i].Score]);
			student.push([i, val.marks[i].Student]);
		}
	}
	var pl = $.plot("#" + node_id, [{
		data: norm,
		label: "Граница ",
		color: "#888888",
		dashes: { show: true },
	}, {
		data: deflection,
		label: "Отклонение",
		dashes: { show: true },
		color: "#6e528d"
	}, {
		data: marks,
		label: "Оценка",
		color: "#000000",
		points: { show: true }
	}],
{

	xaxis: {
		ticks: student,
		min: -1,
		max: val.marks.length,
		rotateTicks: 135,
		zoomRange: [-1, val.marks.length + 1],
		panRange: [-1, val.marks.length]
	},
	grid: {
		hoverable: true
	},
	yaxis: {
		ticks: 10,
		min: 0,
		max: 105,
		zoomRange: [0, 105],
		panRange: [0, 105]

	},
	zoom: {
		interactive: true
	},
	pan: {
		interactive: true
	}
});
	$("#" + node_id).bind("plothover", function (event, pos, item) {
		str = "";
		$("#hoverdata").text(str);
		if (item && item.seriesIndex == 2) {
			var x = item.datapoint[0].toFixed(0),
				y = item.datapoint[1].toFixed(0);

			$("#tooltip").html(search_result[event.target.id.substr(4)].marks[x].Student + " - " + y)
				.css({ top: item.pageY + 5, left: item.pageX + 5 })
				.fadeIn(200);
		} else {
			$("#tooltip").hide();
		}

	});
	return pl;
}
var draw_plots = function (val) {
	$("#result").children().remove();
	var panel_divs = $("div [id='editor'] [val='+']");

	for (i = 0; i < val.length; i++) {
		$("#result").append("<div><h2>" + val[i].competence + "</h2><div id='plot" + i + "' class='demo-placeholder'></div></div>");
		new_plot(val[i], $(panel_divs[i]).find("[name='Mark']")[0].value, $(panel_divs[i]).find("[name='Deflection']")[0].value, "plot" + i);
	}
}

$(document).ready(
function () {
	$("#editor").sortable({
		distance: 10
	});
	$("#button_panel a").on("click", add_panel);
	$("#search_button").on("click", search);
	$("#del_button").on("click", remove_panels);
	$("<div id='tooltip'></div>").css({
		position: "absolute",
		display: "none",
		border: "1px solid #fdd",
		padding: "2px",
		"background-color": "#fee",
		opacity: 0.80
	}).appendTo("body");
	add_panel();
});

var waiter =
	{
		isCreated: false,
		isVisible: false,
		start: function () {
			if (this.isCreated == false) {
				$("body").prepend("<div id='waiter' ></div>");
				this.isCreated = true;
			};
			if (this.isVisible == false) {
				$("#waiter").show();
				this.isVisible = true;
			}
		},
		stop: function () {
			if (this.isCreated && this.isVisible) {
				$("#waiter").hide();
				this.isVisible = false;
			}
		}

	};
