sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "excelupload/utils/CommonUpload"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, CommonUpload) {
        "use strict";

        return Controller.extend("excelupload.controller.View1", {
            onInit: function () {
                CommonUpload.init({
                    oRef: this,
                    sService: "ZTEST_DATA_UPLOAD_SRV",
                    sUploadEntity: "ETUploadSet"
                })
            }
        });
    });
