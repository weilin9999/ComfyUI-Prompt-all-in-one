$(function (){
    var switchTab = function (tab) {
        $("#tab-headers .tab-header-item").removeClass("active");
        $("#tab-headers .tab-header-item[data-tab='" + tab + "']").addClass("active");
        $("#tabs > .tabitem").hide();
        $("#" + tab).show();
    };

    $("#tab-headers").on("click", ".tab-header-item", function(){
        var tab = $(this).data("tab");
        switchTab(tab);
    });

    switchTab("tab_txt2img");
});