window.mExperience = window.mExperience || {};

window.mExperience.utils = {
	error: function (message) {
		throw new Error(message);
	},
	pluckAll: function (objects, props) {
		return _.map(objects, _.partialRight(_.pick, props));
	},
	extractByGroup: function(dataset, groupByKey) {
		return _.memoize(function(extractKey) {
			return  _.groupBy(window.mExperience.utils.pluckAll(dataset, [groupByKey, extractKey]), groupByKey);
		});
	},
	getTemplate: function(id) {
		// http://stackoverflow.com/a/10136935/1177441

		var templates = window.mExperience.utils.getTemplate;

		if ( !templates.cache ) {
			templates.cache = {};
		}

		if ( ! templates.cache[id] ) {
			var templateString;
			$.ajax({
				url: "templates/" + id + ".jst",
				method: 'GET',
				async: false,
				success: function(data) {
					templateString = data;
				}
			});

			templates.cache[id] = _.template(templateString);
		}

		return templates.cache[id];
	},
	getQueryParam: function(name) {
		// http://stackoverflow.com/a/5158301/1177441
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
};