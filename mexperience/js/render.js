window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.render = (function() {
	return {
		offersSearchResult: function(container, resultCountsContainer, offers) {
			_render("offer-item-search", offers, container);
			_render("offer-results-count", offers, resultCountsContainer, true);
		},
		landingPageOffers: function(container, offers) {
			_render("landing-page-offer", offers, container);
		},
		landingPageExclusives: function(container, offers) {
			_render("landing-page-exclusive", offers, container);
		},
		dataCollectionModal: function() {

		},
		thankYouModal: function() {

		}
	};

	function _render(templateName, offers, container, single) {
		var _container = jQuery(container);

		if (single) {
			return _container.html(
				window.mExperience.utils.getTemplate(templateName)(offers)
			);
		}

		return _container.html(
			_.map(
				offers,
				window.mExperience.utils.getTemplate(templateName)
			).join('')
		)
	}
})();