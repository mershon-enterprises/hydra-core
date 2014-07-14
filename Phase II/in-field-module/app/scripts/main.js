"use strict";

function runTest() {
    var url = $("#ajax-test-url").val();
    if (url === "") {
        return;
    }

    $.ajax(
        url,
        {
            "cache": false,
            "dataType": "text",
            "complete": function(jqXHR, textStatus) {
                $("#ajax-test-status").text(textStatus);
                $("#ajax-test-result").text(jqXHR.responseText);
            }
        }
    );
}

$(document).ready(function() {
    $("#ajax-test-go").click(runTest);
});
