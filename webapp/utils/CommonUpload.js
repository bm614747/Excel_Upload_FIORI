sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (JSNOModel, MessageBox) {
    "use strict";

    return {
		/**
		 * Initialization of events for upload
		 * @param {object} 
		 *	oRef - Reference of where the commonuploadUI.fragment.xml used.
		 *	sService - oData Service name
		 *	sUploadEntity - Create stream entity name for upload
		 * 
		 * 
		 */
        init: function (initData) {
            this.initData = initData;
            if (initData.oRef) {
                initData.oRef.getView().setModel(new JSNOModel([]), "EXCEL_RESULTS_MODEL");
                //change event
                initData.oRef.byId("idFileUploader").attachChange(function (oEvent) {
                    if (oEvent.getParameter("files") && oEvent.getParameter("files")[0]) {
                        this.getView().setBusy(true);
                        this.addHeaderParameters();
                        oEvent.getSource().upload();
                    }
                }.bind(initData.oRef));

                //upload complete method
                initData.oRef.byId("idFileUploader").attachUploadComplete(function (oEvent) {
                    var content = (new window.DOMParser()).parseFromString(oEvent.getParameter("responseRaw"), "text/xml");
                    //var message = content.childNodes[0].children[1].innerHTML;
                    // if (oEvent.getParameter("status") !== 201) {
                        if (content.getElementsByTagName("errordetails").length > 0) {
                            var aMessages = [];
                            //content.getElementsByTagName("errordetails")[0].children.forEach(function(item) {
                            for (var i = 0; i < content.getElementsByTagName("errordetails")[0].children.length; i++) {
                                var item = content.getElementsByTagName("errordetails")[0].children[i];
                                aMessages.push({
                                    message: item.getElementsByTagName("message")[0].innerHTML,
                                    severity: item.getElementsByTagName("severity")[0].innerHTML
                                });
                            }
                            this.parseMessages(aMessages);
                        }
                    // }
                    this.byId("idFileUploader").clear();
                    this.byId("idFileUploader").removeAllHeaderParameters();
                    this.getView().setBusy(false);
                }.bind(initData.oRef));

                //Add header parameters and sets the uplodUrl
                initData.oRef.addHeaderParameters = function () {
                    //this.getCSRFToken();
                    var oCustomerHeaderToken = new sap.ui.unified.FileUploaderParameter({
                        name: "x-csrf-token",
                        value: this.getView().getModel().getSecurityToken()//this.token
                    });
                    this.byId("idFileUploader").addHeaderParameter(oCustomerHeaderToken);
                    var sUploadURL = "/sap/opu/odata/sap/" + initData.sService + "/" + initData.sUploadEntity;
                    this.byId("idFileUploader").setUploadUrl(sUploadURL);
                }.bind(initData.oRef);

                //Fetches the CSRF Token
                initData.oRef.getCSRFToken = function () {
                    $.ajax({
                        url: "/sap/opu/odata/sap/" + initData.sService,
                        type: "GET",
                        async: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                        }.bind(this),
                        complete: function (xhr) {
                            this.token = xhr.getResponseHeader("X-CSRF-Token");
                        }.bind(this)
                    });
                }.bind(initData.oRef);

                initData.oRef.parseMessages = function (messages) {
                    var aExcelData = [];
                    messages.forEach(function (item, i) {
                        var obj = {};
                        if (item.message.split("@@").length > 1) {
                            obj.severity = item.severity;
                            obj.message = item.message.split("@@")[1];
                            obj.rowNumber = item.message.split("@@")[0].split("||")[0];
                            obj.businessObj = "Business Partner " + i;
                            aExcelData.push(obj);
                        }
                    });
                    this.getView().getModel("EXCEL_RESULTS_MODEL").setData(aExcelData);
                }.bind(initData.oRef);

            }
        }
    };
});