window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.DataSource = function () {
	var _sourceUrl;

	var utils = window.mExperience.utils;

	var self = {
		initialize: function(sourceUrl) {
			// Return a promise object
			return fetchOffers(sourceUrl);
		},
		refresh: refresh,
		data: []
	};
	return self;

	function refresh() {
		if (_sourceUrl) {
			return fetchOffers(_sourceUrl);
		}
		utils.error("Data plugin has not been initialzed yet. Please use the initialize method before you try to refresh data.");
	}

	function fetchOffers(sourceUrl) {
		// Cache the sourceUrl value for refreshing data if necessary
		_sourceUrl = sourceUrl;

		return $.ajax({
			url: sourceUrl,
			dataType: "jsonp",
			contentType: "application/json; charset=utf-8"
		}).then(function(spreadsheetJSON) {
			var arrayOfOffers = fetchAsArray(spreadsheetJSON);

			// Cache the data for further use
			self.data = arrayOfOffers;

			// Allow for dependency injection if required
			return self;
		});
	}

	function fetchAsArray(spreadsheetJSON) {
		var entries = spreadsheetJSON && spreadsheetJSON.feed.entry;

		if (!entries || !entries.length) {
			utils.error("Could not fetch offer data. Please check the sourceUrl. Are there entries in the spreadsheet?");
		}

		var entryGetter = getEntryFromSheet(entries);
		return _.map(entries, function(entry, index) {
			return {
				id: entryGetter('id', index),
				brand: entryGetter('brand', index, true),
				country: entryGetter('country', index, true),
				city: entryGetter('city', index, true),
				locality: entryGetter('locality', index, true),
				cuisines: _.map(entryGetter('cuisines', index, true).split(','), function(cuisine) {
					return _.trim(cuisine);
				}),
				offer: entryGetter('offer', index),
				creative: entryGetter('creative', index),
				exclusive: entryGetter('exclusive', index, true),
				promoted: entryGetter('promoted', index, true)
			};
		});
	}

	function getEntryFromSheet(entries) {
		return function(key, index, lowercase) {
			var value = _.trim(entries[index]["gsx$" + key].$t);
			return lowercase ? value.toLowerCase() : value;
		}
	}
};