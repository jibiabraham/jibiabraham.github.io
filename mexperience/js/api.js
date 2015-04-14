window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.api = (function() {
	return {
		registerCustomer: function(campaignId, container) {
			var values = jQuery(container).find('input').toArray().map(function(el) {
				var tag = el.getAttribute('name'), value = el.value;
				return ["<" + tag + ">", value, "</" + tag + ">"].join('');
			});
			values.push(['<CampaignId>', campaignId, '/' + "</CampaignId>"].join(''));

			values.unshift('<request>');
			values.push('</request>');

			values.unshift('<?xml version=\"1.0\"?>');

			return $.ajax({
				type: "GET",
				url: "https://getkonekt.com/konekt/service/KonektAPI.asmx/RequestHandler",
				data: "data=" + values.join(''),
				dataType: "xml"
			});
		}
	}
})();