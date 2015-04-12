window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.render = function(container, resultCountsContainer, suggestions, useFilter) {
	// If no filter provided, render the first 15 available offers
	container = jQuery(container).removeClass('loading');

	var offers = suggestions.getOffers(useFilter);
	var template = _.template(offerAsHTML());

	var htmlOffers = _.map(offers, template);
	container.html(htmlOffers);
	setResultCounts();

	function setResultCounts() {
		var resultText;

		resultCountsContainer.removeClass('loading empty result');

		if (offers.length === 0) {
			resultCountsContainer.addClass('empty');
		} else {
			if (offers.length === 1) {
				resultText = "1 offer found";
			} else {
				resultText = offers.length + " offers found";
			}
			resultCountsContainer.addClass('result').find('.result h2').text(resultText);
		}
	}

	function offerAsHTML() {
		return [
			"<div class='col-md-12 mk-white-bg'>",
				"<div class='col-md-6' data-entry-id='<%= id %>'>",
					"<img src='/mexperience/images/<%= creative %>' class='full-img' width='100%'' alt='<%- brand %>' >",
				"</div>",
				"<div class='col-md-6'>",
					"<h4 class='mk-blue text-capitalize'><%- brand %></h4>",
					"<p class='text-capitalize'><%- locality %>, <%- city %>, <%- country %></p>",
					"<h4><%- offer %></h4>",
					"<button type='submit' class='btn btn-secondary btn-block' data-toggle='modal' data-target='#exampleModal'>DOWNLOAD VOUCHER</button>",
				"</div>",
			"</div>"
		].join('');
	}
};