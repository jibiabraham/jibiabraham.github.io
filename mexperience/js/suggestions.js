window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.suggestions = function (options) {
	var offersSelf = this;
	var inputKeys = ['cuisine', 'city', 'locality'];
	var offersData = [];
	var suggestionEngines = {};
	var typeaheads = {};
	var localitiesInCity = {};

	// Setup default values for plugin
	this.options = _.defaults(options || {}, {
		sourceUrl: "https://spreadsheets.google.com/feeds/list/19aMSbuRSvaOOOjTCuXcIP3Wt-0WyZMtssi4H2DD--EM/od6/public/values?alt=json&callback=?",
		cuisine: "",
		city: "",
		locality: ""
	});

	normaliseInputElements();
	verifyInputElements();

	var _ready = jQuery.Deferred();

	// This is where the data for offers will be fetched from
	this.sourceUrl = this.options.sourceUrl;

	// Let the user know when the plugin is ready to be used
	this.ready = function() {
		return _ready.promise();
	};

	this.getOffers = getFilteredOffers;

	initialize();

	function initialize() {
		fetchOffers().then(function(offers) {
			offersData = offers;

			suggestionEngines.cuisines = suggestionEngine('cuisine', tokens(offersData, 'cuisines'));
			suggestionEngines.cities = suggestionEngine('city', tokens(offersData, 'city'));
			suggestionEngines.localities = suggestionEngine('locality', []);

			_.forEach(suggestionEngines, function(engine) {
				engine.initialize();
			});

			typeaheads.cuisines = initTypeahead(offersSelf.options.cuisine, {
				name: 'cuisines',
				displayKey: 'value',
				source: suggestionEngines.cuisines.ttAdapter()
			});

			typeaheads.cities = initTypeahead(offersSelf.options.city, {
				name: 'cities',
				displayKey: 'value',
				source: suggestionEngines.cities.ttAdapter()
			}).on('typeahead:selected', setLocalities);

			typeaheads.localities = initTypeahead(offersSelf.options.locality, {
				name: 'localities',
				displayKey: 'value',
				source: suggestionEngines.localities.ttAdapter()
			});

			_ready.resolve();
		});
	}

	function getFilteredOffers(useFilters) {
		if (!useFilters) {
			return _.sortBy(offersData, 'brand');
		}

		var TypeaheadDataKeyMap = {
			cuisines: 'cuisines',
			cities: 'city',
			localities: 'locality'
		};

		return _.filter(offersData, function(offer) {
			return _.every(typeaheads, function(typeahead, key) {
				var selectedValue = _.trim(typeahead.typeahead('val'));
				if (selectedValue.length) {
					return _.contains(offer[TypeaheadDataKeyMap[key]], selectedValue);
				}
				return true;
			});
		});
	}

	function setLocalities(event, suggestion) {
		localitiesInCity = !_.isEmpty(localitiesInCity) ? localitiesInCity : _.groupBy(pluckAll(offersData, ['city', 'locality']), 'city');

		var selectedCity = suggestion.value, localities = localitiesInCity[selectedCity];
		if (!_.isString(localities[0])) {
			localitiesInCity[selectedCity] = tokens(localities, 'locality');
			localities = localitiesInCity[selectedCity];
		}

		suggestionEngines.localities.clear();
		suggestionEngines.localities.local = localities;
		suggestionEngines.localities.initialize(true);
		typeaheads.localities.typeahead('val', '');
	}

	function normaliseInputElements() {
		_.forEach(inputKeys, function(key) {
			offersSelf.options[key] = jQuery(offersSelf.options[key]);
		});
	}

	function verifyInputElements() {
		return _.every(inputKeys, function(key) {
			return offersSelf.options[key] instanceof jQuery;
		}) || throwError("One or more the search inputs have not been configured");
	}

	function fetchOffers() {
		return $.ajax({
			url: offersSelf.sourceUrl,
			dataType: "jsonp",
			contentType: "application/json; charset=utf-8"
		}).then(fetchAsArray);
	}

	function fetchAsArray(spreadsheetJSON) {
		var entries = spreadsheetJSON && spreadsheetJSON.feed.entry;
		if (!entries || !entries.length)
			throwError("Could not fetch offer data. Please check the sourceUrl. Are there entries in the spreadsheet?");

		var entryGetter = getEntryFromSheet(entries);
		return _.map(entries, function(entry, index) {
			return {
				id: index,
				brand: entryGetter('brand', index, true),
				country: entryGetter('country', index, true),
				city: entryGetter('city', index, true),
				locality: entryGetter('locality', index, true),
				cuisines: _.map(entryGetter('cuisines', index, true).split(','), function(cuisine) {
					return _.trim(cuisine);
				}),
				offer: entryGetter('offer', index),
				creative: entryGetter('creative', index)
			};
		});
	}

	function getEntryFromSheet(entries) {
		return function(key, index, lowercase) {
			var value = _.trim(entries[index]["gsx$" + key].$t);
			return lowercase ? value.toLowerCase() : value;
		}
	}

	function tokens(data, key) {
		return _(data).
			pluck(key).
			flatten().
			unique().
			sort().
			map(function(key) { return {value: key}; }).
			value();
	}

	function suggestionEngine(name, locals) {
		return new Bloodhound({
			name: name,
			local: locals,
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace
		});
	}

	function initTypeahead(base, dataset) {
		return jQuery(base).typeahead({
			hint: true,
			highlight: true,
			minLength: 0
		}, dataset);
	}

	function throwError(message) {
		throw new Error(message);
	}

	function pluckAll(objects, props) {
		return _.map(objects,_.partialRight(_.pick, props));
	}
}