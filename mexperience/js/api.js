window.mExperience = window.mExperience || {};
window.mExperience.offers = window.mExperience.offers || {};

window.mExperience.offers.api = (function() {
    return {
        registerCustomer: function(campaignId, container) {
            var postData = {
                CampaignId: campaignId
            };

            jQuery(container).find('input, select').toArray().map(function(el) {
                var tag = el.getAttribute('name'), value = el.value;
                postData[tag] = value;
            });

            return $.ajax({
                method: "POST",
                url: "mexppost.aspx",
                data: JSON.stringify(postData),
                contentType: "application/json",
                dataType: "json"
            });

        }
    }
})();