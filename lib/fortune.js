var fortuneCookies = [
	"Conquer your fears!",
	"Guinness gives you strength!",
	"Lucky in love, unlucky at cards.",
	"Rivers need springs.",
	"Do not fear what you do not know.",
	"Whenever possible, keep it simple.",
	"Don't go to bed angry."
	];

exports.getFortune = function() {
	var idx = Math.floor(Math.random() * fortuneCookies.length);
	return fortuneCookies[idx];
};
