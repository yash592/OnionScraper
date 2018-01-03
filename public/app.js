alert("connected!");

$(document).on("click", "button", function() {

	console.log("clicked!")

	$("#notes").empty();

	var thisId = $(this).attr("data-id");

	$.ajax({
		method: "POST",
		url: "/savedHeadlines" + thisId
	}).done(function(data) {
		console.log(data);
	})
})