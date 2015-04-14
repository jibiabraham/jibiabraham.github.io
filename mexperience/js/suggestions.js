window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.Suggestions = function (options) {
	// Internal handle to utils
	var utils = window.mExperience.utils;

	var _ready = jQuery.Deferred();

	var inputKeys = ['cuisine', 'city', 'locality'];
	var offersData = [];
	var suggestionEngines = {};
	var typeaheads = {};

	// Internal caches
	var caches = {};

	// Setup default values for plugin
	var options = _.defaults(options || {}, {
		// Use mExperience.data.initialize as the option value for data if needed
		// Expects a promise that resolves to {data: [array of data]}
		data: $.Deferred().promise(),
		cuisine: "",
		city: "",
		locality: ""
	});

	normaliseInputElements();
	verifyInputElements();
	initialize();

	return {
		// Let the user know when the plugin is ready to be used
		ready: function() {
			return _ready.promise();
		},
		getOffers: getFilteredOffers,
		setState: setState,
		refresh: initialize,
		typeaheads: typeaheads
	};

	function initialize() {
		options.data.then(function(wrapper) {
			resetCaches();

			offersData = wrapper.data;

			// Set internal caches
			setCaches();

			// Setup the suggestion engines for each searchable category
			suggestionEngines.cuisines = suggestionEngine('cuisine', tokens(offersData, 'cuisines'));
			suggestionEngines.cities = suggestionEngine('city', tokens(offersData, 'city'));
			suggestionEngines.localities = suggestionEngine('locality', []);

			_.forEach(suggestionEngines, function(engine) {
				// Initialize each engine
				engine.initialize();
			});

			// Setup the typeaheads for each suggestion engine
			typeaheads.cuisines = initTypeahead(options.cuisine, {
				name: 'cuisines',
				displayKey: 'value',
				source: suggestionEngines.cuisines.ttAdapter()
			});

			typeaheads.cities = initTypeahead(options.city, {
				name: 'cities',
				displayKey: 'value',
				source: suggestionEngines.cities.ttAdapter()
			}).on('typeahead:selected', setLocalities);

			typeaheads.localities = initTypeahead(options.locality, {
				name: 'localities',
				displayKey: 'value',
				source: suggestionEngines.localities.ttAdapter()
			});

			// Declare that the plugin is ready to work
			// Use the ready() fn to wait on the plugin
			_ready.resolve();
		});
	}

	// Convenience method to extract offers that match all selected filters
	// Will return all offers if no filters are asked to be used
	function getFilteredOffers(filter) {
		if (!filter || filter === true) {
			return _.sortBy(offersData, 'brand');
		}

		// There is small discrepancy between keys found on offer object and the
		// keys used on the typeaheads (singluar/plural)
		// Resolve that difference manually here
		var TypeaheadDataKeyMap = {
			cuisines: 'cuisines',
			cities: 'city',
			localities: 'locality'
		};

		return _.filter(offersData, function(offer) {
			if (_.isFunction(filter)) {
				return filter(offer);
			}

			return _.every(typeaheads, function(typeahead, key) {
				var selectedValue = _.trim(typeahead.typeahead('val'));
				if (selectedValue.length) {
					return _.contains(offer[TypeaheadDataKeyMap[key]], selectedValue);
				}
				return true;
			});
		});
	}

	function setState(values) {
		_ready.then(function() {
			resetCaches();
			setCaches();

			typeaheads.cuisines.typeahead('val', values[0] || "");
			typeaheads.cities.typeahead('val', values[1] || "");
			typeaheads.localities.typeahead('val', values[2] || "");

			suggestionEngines.cities.get(values[1], function(suggestions) {
				if (!suggestions.length) return;

				var exactMatch = _.find(suggestions, function(suggestion) {
					return values[1].toLowerCase() === suggestion.value;
				});

				setLocalities({}, exactMatch || suggestions[0]);
			});
		});
	}

	function setCaches() {
		caches.localitiesByCity = {
			dataset: utils.extractByGroup(offersData, 'city'),
			tokens: _.memoize(function(city) {
				return tokens(caches.localitiesByCity.dataset('locality')[city], 'locality');
			})
		};
	}

	function resetCaches() {
		if (_.isEmpty(caches)) return;

		delete caches.localitiesByCity.dataset.cache;
		delete caches.localitiesByCity.tokens.cache;
	}

	function setLocalities(event, suggestion) {
		var selectedCity = suggestion.value;

		suggestionEngines.localities.clear();
		suggestionEngines.localities.local = caches.localitiesByCity.tokens(selectedCity);
		suggestionEngines.localities.initialize(true);
		typeaheads.localities.typeahead('val', '');
	}

	// Make sure that input elements are resolved to jQuery objects
	function normaliseInputElements() {
		_.forEach(inputKeys, function(key) {
			options[key] = jQuery(options[key]);
		});
	}

	// Make sure that all provided input elements exist
	function verifyInputElements() {
		return _.every(inputKeys, function(key) {
			return options[key] instanceof jQuery;
		}) || utils.error("One or more the search inputs have not been found. Please re-check the options provided");
	}

	// Convenience function for extracting suggestion data for bloodhound
	function tokens(data, key) {
		return _(data).
			pluck(key).
			flatten().
			unique().
			sort().
			map(function(key) { return {value: key}; }).
			value();
	}

	// Wrapper function for creating the suggestion engine
	function suggestionEngine(name, locals) {
		return new Bloodhound({
			name: name,
			local: locals,
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
			queryTokenizer: Bloodhound.tokenizers.whitespace
		});
	}

	// Wrapper function for setting up a typeaahead and it's suggestion engine
	function initTypeahead(base, dataset) {
		return jQuery(base).typeahead({
			hint: true,
			highlight: true,
			minLength: 0
		}, dataset);
	}
}