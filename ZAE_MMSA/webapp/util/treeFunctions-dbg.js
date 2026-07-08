sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter"
], function (baseObject, Fragment, Filter) {
	"use strict";

	return baseObject.extend("com.globalintelli.zae_sswe.ext.util.treeFunctions", {

		_valueHelpDialogs: [],

		restLibrary: function () {
			this._valueHelpDialogs = [];
		},

		fnCategorizationSchemaValidationWithServiceHistry: function (CatSchema) {
			var oModelData = this.getView().getModel("mCustIdentification").getData();
			var oServiceHistory = oModelData.customerInfo.to_ServiceHistory.results;

			for (var i = 0; i < CatSchema.length; i++) {
				for (var j = 0; j < oServiceHistory.length; j++) {
					if (CatSchema[i].msitem === oServiceHistory[j].MSItem && CatSchema[i].Material === oServiceHistory[j].Material) {
						if (oServiceHistory[j].isServiced) {
							CatSchema[i]["isServiced"] = true;
							CatSchema[i]["ServiceStatus"] = "Completed";

						}
					}
				}
			}
			return CatSchema;
		},

		convertFlatToTree: function (flat, id, parentId, SchemaID) {
			var MainRoot = [];
			var root = [];
			var map = {};
			flat.forEach(function (node) {
				if (!node[parentId]) {
					root.push(node);
					return;
				}
				var parentIndex = map[node[parentId]];
				if (typeof parentIndex !== "string") {
					parentIndex = flat.findIndex(function (el) {
						return el[id] === node[parentId];
					});
					map[node[parentId]] = parentIndex;
				}
					if (flat[parentIndex] && !flat[parentIndex].children) {
					flat[parentIndex].children = [node];
					return;
				}
					if (parentIndex < 0) {
					root.push(node);
					return;
				}
				flat[parentIndex].children.push(node);
			});
			// return root;
			MainRoot.push({
				cat_id: SchemaID,
				cat_label: SchemaID,
				children: root
			});
			return MainRoot;
		},
		filterTreeData: function (data, SchemaID, ContractStatusCode, Material, inContractNodes, flatData) {
			var tData = data;
			if (tData && tData.length > 0) {
				var inContractFilter = function (cat_id) {
					var count = 0;
					inContractNodes.forEach((iC) => {
						if (iC === cat_id) {
							count = count + 1;
						}
					});
					return count > 0;
				}

				var matFilter = function (d) {
					return d.filter(function (o) {
						var tO = o;
						return tO.Material === Material;
					});
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (Material && tO.cat_desc === "CTIN" && tO.children) { //material filter
							tO.children = matFilter(tO.children);
						}

						var showNode = true;
						for (var i = 0; i < aHideContractStatusCode.length; i++) {
							if (aHideContractStatusCode[i].CatIDCategory === "" && aHideContractStatusCode[i].SrviceSchemaQualifier === tO.cat_desc) {
								showNode = false;
							} else if (aHideContractStatusCode[i].CatIDCategory === tO.CatIDCategory && aHideContractStatusCode[i].SrviceSchemaQualifier ===
								tO.cat_desc) {
								showNode = false;
							}
						}
						if (showNode !== false && inContractFilter(tO.cat_id)) {
							return true;
						}

						return (
							tO.parentId !== SchemaID || tO.SrviceSchemaQualifier === '' || showNode
						);
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},
		handleTreeValueHelp: function (that, input, fragName, keyCol, valueCol, tableData, checkFucc, submitFunc) {
			var self = this;
			var inputId = input.getId();
			if (!self._valueHelpDialogs[inputId]) {
				Fragment.load({
					id: inputId + "TreeVHFragment",
					name: fragName,
					controller: {

						onSubmitPressed: function (oEvent) {
							var CategoryTreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
							var SelectedContexts = CategoryTreeTable.getBinding().getSelectedContexts();
							var checkObj = checkFucc(SelectedContexts);
							if (checkObj.pass) {
								var aSelObjList = [];
								SelectedContexts.forEach(function (selObj) {
									var selModel = selObj.getModel();
									var selPath = selObj.getPath();
									var obj = selModel.getProperty(selPath);
									aSelObjList.push(obj);
								});
								if (submitFunc) {
									submitFunc(aSelObjList);
								}
								self._valueHelpDialogs[inputId].close();
							} else {
								var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
								oMessageStrip.setVisible(true);
								oMessageStrip.setText(checkObj.msg);
								oMessageStrip.setType(checkObj.type);
							}

						},

						/*onTreeRowSelect: function (oEvent) {
							var oSelRow = oEvent.getParameter("rowContext").getModel().getProperty(oEvent.getParameter("rowContext").sPath);
							var checkObj = checkFucc(oSelRow);
							if (checkObj.pass) {
								input.setSelectedKey(oSelRow[keyCol]);
								input.setValue(oSelRow[valueCol] + " (" + oSelRow[keyCol] + ")");
								self._valueHelpDialogs[inputId].close();
							} else {
								var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
								oMessageStrip.setVisible(true);
								oMessageStrip.setText(checkObj.msg);
								oMessageStrip.setType(checkObj.type);
							}
						},*/
						afterClose: function () {
							Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip").setVisible(false);
							Fragment.byId(inputId + "TreeVHFragment", "EstType").setSelectedKey("");
							Fragment.byId(inputId + "TreeVHFragment", "Description").setValue("");
							Fragment.byId(inputId + "TreeVHFragment", "noteInput").setValue("");
						},
						onCancelPressed: function () {
							self._valueHelpDialogs[inputId].close();
						}
						
					}
				}).then(function (oValueHelpDialogContent) {
					self._valueHelpDialogs[inputId] = oValueHelpDialogContent;
					that.getView().addDependent(self._valueHelpDialogs[inputId]);
					self._initTreeValueHelpDialog(inputId, tableData);
				});
			} else {
				self._initTreeValueHelpDialog(inputId, tableData);
			}
		},
		_initTreeValueHelpDialog: function (inputId, tableData) {
			var TreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.setData(tableData);
			TreeTable.setModel(oJsonModel);
			TreeTable.bindRows({
				path: '/',
				parameters: {
					arrayNames: ['children']
				}
			});
			this._valueHelpDialogs[inputId].open();
		},

	});

});