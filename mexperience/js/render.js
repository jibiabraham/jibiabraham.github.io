window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.render = (function() {
	return {
		offersSearchResult: function(container, resultCountsContainer, offers) {
			_render("offer-item-search", offers, container);
			_render("offer-results-count", {offersCount: offers.length}, resultCountsContainer, true);
		},
		landingPageOffers: function(container, offers) {
			_render("landing-page-offer", offers, container);
		},
		landingPageExclusives: function(container, offers) {
			_render("landing-page-exclusive", offers, container);
		},
		dataCollectionModal: function(campaignId) {
			return jQuery(
				window.mExperience.utils.getTemplate('data-collection-form')({id: campaignId})
			).modal().on('hidden.bs.modal', function() { jQuery(this).off().remove(); });
		},
		thankYouModal: function() {
			return jQuery(
				window.mExperience.utils.getTemplate('thank-you-modal')()
			).modal().on('hidden.bs.modal', function() { jQuery(this).off().remove(); });
		}
	};

	function _render(templateName, data, container, single) {
		var _container = jQuery(container);

		if (single) {
			return _container.html(
				window.mExperience.utils.getTemplate(templateName)(data)
			);
		}

		return _container.html(
			_.map(
				data,
				window.mExperience.utils.getTemplate(templateName)
			).join('')
		)
	}
})();