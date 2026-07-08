function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZAE_FM_SSOD_INV_SPLIT_CUST_P_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}