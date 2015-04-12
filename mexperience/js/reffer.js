
function ShowSuccessForm() {
$("#exampleModal").modal('hide')
$("#thankyouModal").modal('show');

}

function SendRequest(CampId) {

        var CampaignId = CampId;
        var Name = $("#name").val();
        var Email = $("#email").val();
        var CountryCallingCode = $("#countryCallingCode option:selected").val();
        var CellNo = $("#mobile").val();

        Referrer = Name;
		
			CallPageMethod("", onSuccess, onFail,
                "CampaignId", CampaignId,
                "Name", Name,
                "Email", Email,
                "CountryCallingCode", CountryCallingCode,
                "CellNo", CellNo
                );
				
			ClearForm();	
			ShowSuccessForm();
}

function ClearForm(){
		$("#name").val('');
        $("#email").val('');
        $("#countryCallingCode").find('option[value="91"]').prop('selected', true); 
        $("#mobile").val('');
}

function onSuccess(response) {
}

function onFail(response) {
}

function CallPageMethod(methodName, onSuccess, onFail) {
    var args = '';
    var timestamp = new Date();

        var postData = "<?xml version=\"1.0\"?>";
        postData += "<request>";
        postData += "<CampaignId>%%CampaignId%%</CampaignId>";
        postData += "<Name>%%Name%%</Name>";
        postData += "<Email>%%Email%%</Email>";
        postData += "<CountryCallingCode>%%CountryCallingCode%%</CountryCallingCode>";
        postData += "<CellNo>%%CellNo%%</CellNo>";
        postData += "</request>";

		postData = "data=" + postData;

    var l = arguments.length;
    if (l > 3) {

        for (var i = 3; i < l - 1; i += 2) {

            if (arguments[i] == 'CampaignId')
                postData = postData.replace('%%CampaignId%%', arguments[i + 1]);
            else if (arguments[i] == 'Name')
                postData = postData.replace('%%Name%%', arguments[i + 1]);
            else if (arguments[i] == 'Email')
                postData = postData.replace('%%Email%%', arguments[i + 1]);
            else if (arguments[i] == 'CountryCallingCode')
                postData = postData.replace('%%CountryCallingCode%%', arguments[i + 1]);
            else if (arguments[i] == 'CellNo')
                postData = postData.replace('%%CellNo%%', arguments[i + 1]);

        }

    }
	
	
   $.ajax({
        type: "GET",
        url: "https://getkonekt.com/konekt/service/KonektAPI.asmx/RequestHandler",
        data: postData,
        dataType: "xml",
        success: onSuccess,
        fail: onFail
    });

}


function jsonpcallback() {

}



function trim(stringToTrim) {
    return stringToTrim.replace(/^\s+|\s+$/g, "");
}
function ltrim(stringToTrim) {
    return stringToTrim.replace(/^\s+/, "");
}
function rtrim(stringToTrim) {
    return stringToTrim.replace(/\s+$/, "");
}

function ValidateEmail(elementValue) {
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(elementValue);
}



