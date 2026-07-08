sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter"
], function (baseObject, Fragment, Filter) {
	"use strict";

	return baseObject.extend("com.globalintelli.zae_ssod.ext.util.treeFunctions", {

		_valueHelpDialogs: [],

		restLibrary: function () {
			this._valueHelpDialogs = [];
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
		filterTreeData_old: function (data, SchemaID, ContractStatusCode, Material) {
			var tData = data;
			if (tData && tData.length > 0) {

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
						if (Material && tO.cat_desc === ContractStatusCode && tO.children) {
							tO.children = matFilter(tO.children);
						}

						return (
							tO.parentId !== SchemaID || tO.cat_desc === '' || tO.cat_desc === ContractStatusCode
						);
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},
		handleTreeValueHelp_old: function (that, input, fragName, keyCol, valueCol, tableData, checkFucc, submitFunc) {
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
						},
						onCancelPressed: function () {
							self._valueHelpDialogs[inputId].close();
						}
					}
				}).then(function (oValueHelpDialogContent) {
					self._valueHelpDialogs[inputId] = oValueHelpDialogContent;
					that.getView().addDependent(self._valueHelpDialogs[inputId]);
					self._initTreeValueHelpDialog(inputId, tableData, that);
				});
			} else {
				self._initTreeValueHelpDialog(inputId, tableData, that);
			}
		},

		filterTreeData: function (data, SchemaID, aHideContractStatusCode, Material, inContractNodes, flatData) {
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

		filterTreeData2: function (data, SchemaID, aHideContractStatusCode, Material, inContractNodes, flatData) {
			var tData = data;
			if (tData && tData.length > 0) {

				var inContractChildFilter = function (cat_id) {
					var parentNode = flatData.find((f) => f.cat_id == cat_id);
					if (parentNode && parentNode.parentId) {
						var sParentNode = flatData.find((f) => f.cat_id == parentNode.parentId);
						if (sParentNode && sParentNode.CatIDType == "CTIN") {
							return true;
						}
					}
					return false;
				}

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
						if (Material && tO.CatIDType === "CTIN" && tO.children) { //material filter
							tO.children = matFilter(tO.children);
						}

						if (inContractChildFilter(tO.parentId) || inContractChildFilter(tO.cat_id)) {
							return true;
						}

						if (tO.CatIDType === 'CTIN' || inContractFilter(tO.cat_id)) {
							return true;
						}

						return false;
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

						onTreeMultiRowSelect: function (oEvent) {
							if (!oEvent.getParameter("rowContext")) {
								return;
							}
							var selectedData = [];
							var oTable = oEvent.getSource();
							var SelectedIndices = oEvent.getSource().getSelectedIndices();
							var oSelectedObjCheck = oEvent.getSource().isIndexSelected(oEvent.getParameter('rowIndex'));
							var SelectedObj = oEvent.getParameter("rowContext").getObject();
							var BoolCheckSbt = true;
							for (var i = 0; i < SelectedIndices.length; i++) {
								var tableContext = oTable.getContextByIndex(SelectedIndices[i]);
								var data = oTable.getModel().getProperty(tableContext.getPath());
								selectedData.push(data);
								if (oSelectedObjCheck) {
									if (selectedData[i].children) {
										var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
										oMessageStrip.setVisible(true);
										oMessageStrip.setText("Selection Not Allowed For This Level");
										oMessageStrip.setType("Error");
										BoolCheckSbt = false;
									}
								} else if (!oSelectedObjCheck) {
									if (selectedData[i].children) {
										oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
										oMessageStrip.setVisible(true);
										oMessageStrip.setText("Selection Not Allowed For This Level");
										oMessageStrip.setType("Error");
										BoolCheckSbt = false;

									}
								}
								// else {
								// 	oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
								// 	oMessageStrip.setVisible(false);
								// 	oMessageStrip.setText("");
								// 	BoolCheckSbt = true;
								// }
							}
							if (!(SelectedIndices.length > 0) || !BoolCheckSbt) {
								Fragment.byId(inputId + "TreeVHFragment", "IdSubmit").setEnabled(false);
							} else {
								oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
								oMessageStrip.setVisible(false);
								Fragment.byId(inputId + "TreeVHFragment", "IdSubmit").setEnabled(true);
							}
						},
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

						// onSubmitPressed: function (oEvent) {
						// 	Fragment.byId(inputId + "TreeVHFragment", "CategoryVHDialog").setBusy(true);
						// 	var pageData = that.getView().getBindingContext().getObject();
						// 	if (inputId.includes("SSWE_B09")) {
						// 		var vCompCod = Fragment.byId(inputId + "TreeVHFragment", "CompCode").getSelectedKey();
						// 		if (vCompCod === "" || vCompCod === undefined) {
						// 			Fragment.byId(inputId + "TreeVHFragment", "CategoryVHDialog").setBusy(false);
						// 			that.getView().setBusy(false);
						// 			var CategoryTreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
						// 			var SelectedContexts = CategoryTreeTable.getBinding().getSelectedContexts();
						// 			var checkObj = checkFucc(SelectedContexts);
						// 			var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
						// 			oMessageStrip.setVisible(true);
						// 			oMessageStrip.setText(checkObj.msg);
						// 			oMessageStrip.setType(checkObj.type);
						// 			return;
						// 		}
						// 		var data = {
						// 			"ProcessType": vCompCod,
						// 			"ServiceDoc": pageData.ServiceRequest
						// 		};
						// 		that.getView().setBusy(true);
						// 		that.getView().getModel().create("/ZAE_FM_CREATE_EST_VALIDAQTIONSet", data, {
						// 			success: function (oData, oResponse) {
						// 				if (oData.MsgType === 'E') {
						// 					that.getView().setBusy(false);
						// 					Fragment.byId(inputId + "TreeVHFragment", "CategoryVHDialog").setBusy(false);
						// 					sap.m.MessageBox.error(oData.Message);
						// 					return;
						// 				} else if (oData.MsgType === 'W') {
						// 					Fragment.byId(inputId + "TreeVHFragment", "CategoryVHDialog").setBusy(false);
						// 					that.getView().setBusy(false);
						// 					sap.m.MessageBox.confirm(oData.Message + " Do you want to continue ?", {
						// 						icon: sap.m.MessageBox.Icon.QUESTION,
						// 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						// 						emphasizedAction: sap.m.MessageBox.Action.NO,
						// 						onClose: function (oAction) {
						// 							if (oAction === sap.m.MessageBox.Action.YES) {
						// 								var CategoryTreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
						// 								var SelectedContexts = CategoryTreeTable.getBinding().getSelectedContexts();
						// 								var checkObj = checkFucc(SelectedContexts);
						// 								if (checkObj.pass) {
						// 									var aSelObjList = [];
						// 									SelectedContexts.forEach(function (selObj) {
						// 										var selModel = selObj.getModel();
						// 										var selPath = selObj.getPath();
						// 										var obj = selModel.getProperty(selPath);
						// 										aSelObjList.push(obj);
						// 									});
						// 									if (submitFunc) {
						// 										submitFunc(aSelObjList);
						// 									}
						// 									self._valueHelpDialogs[inputId].close();
						// 								} else {
						// 									var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
						// 									oMessageStrip.setVisible(true);
						// 									oMessageStrip.setText(checkObj.msg);
						// 									oMessageStrip.setType(checkObj.type);
						// 								}
						// 							}
						// 						}
						// 					});
						// 				} else {
						// 					Fragment.byId(inputId + "TreeVHFragment", "CategoryVHDialog").setBusy(false);
						// 					that.getView().setBusy(false);
						// 					var CategoryTreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
						// 					var SelectedContexts = CategoryTreeTable.getBinding().getSelectedContexts();
						// 					var checkObj = checkFucc(SelectedContexts);
						// 					if (checkObj.pass) {
						// 						var aSelObjList = [];
						// 						SelectedContexts.forEach(function (selObj) {
						// 							var selModel = selObj.getModel();
						// 							var selPath = selObj.getPath();
						// 							var obj = selModel.getProperty(selPath);
						// 							aSelObjList.push(obj);
						// 						});
						// 						if (submitFunc) {
						// 							submitFunc(aSelObjList);
						// 						}
						// 						self._valueHelpDialogs[inputId].close();
						// 					} else {
						// 						var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
						// 						oMessageStrip.setVisible(true);
						// 						oMessageStrip.setText(checkObj.msg);
						// 						oMessageStrip.setType(checkObj.type);
						// 					}
						// 				}
						// 			}.bind(that),
						// 			error: function (oError) {
						// 				that.getView().setBusy(false);
						// 				Fragment.byId(inputId + "TreeVHFragment", "CategoryVHDialog").setBusy(false);
						// 				that.getView().getModel().refresh(true);
						// 			}
						// 		});
						// 	} else {
						// 		Fragment.byId(inputId + "TreeVHFragment", "CategoryVHDialog").setBusy(false);
						// 		that.getView().setBusy(false);
						// 		var CategoryTreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
						// 		var SelectedContexts = CategoryTreeTable.getBinding().getSelectedContexts();
						// 		var checkObj = checkFucc(SelectedContexts);
						// 		if (checkObj.pass) {
						// 			var aSelObjList = [];
						// 			SelectedContexts.forEach(function (selObj) {
						// 				var selModel = selObj.getModel();
						// 				var selPath = selObj.getPath();
						// 				var obj = selModel.getProperty(selPath);
						// 				aSelObjList.push(obj);
						// 			});
						// 			if (submitFunc) {
						// 				submitFunc(aSelObjList);
						// 			}
						// 			self._valueHelpDialogs[inputId].close();
						// 		} else {
						// 			var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
						// 			oMessageStrip.setVisible(true);
						// 			oMessageStrip.setText(checkObj.msg);
						// 			oMessageStrip.setType(checkObj.type);
						// 		}
						// 	}

						// },
						// onChangeEstType: function (oEvent) {
						// 	var oSelected = oEvent.getParameter("value");
						// 	Fragment.byId(inputId + "TreeVHFragment", "Description").setValue(oSelected);
						// },

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
							Fragment.byId(inputId + "TreeVHFragment", "searchField").setValue("");
							// Fragment.byId(inputId + "TreeVHFragment", "EstType").setSelectedKey("");
							// Fragment.byId(inputId + "TreeVHFragment", "Description").setValue("");
							// Fragment.byId(inputId + "TreeVHFragment", "noteInput").setValue("");
						},
						onCancelPressed: function () {
							self._valueHelpDialogs[inputId].close();
						},
						onSearchTreeTable: function (oEvent) {
							var oTable = oEvent.getSource().getParent().getParent();
							if (oEvent.getParameters().refreshButtonPressed) {
								this.onRefresh(oTable);
								oTable.collapseAll();
								return;
							}
							var sQuery = oEvent.getParameter("query");
							var aFilters = [];
							if (sQuery) {
								aFilters.push(new Filter({
									filters: [
										new Filter({
											path: "cat_id",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sQuery
										}),
										new Filter({
											path: "cat_label",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sQuery
										})

									],
									and: false
								}));
							}
							oTable.getBinding("rows").filter(aFilters);
							if (aFilters.length > 0) {
								oTable.expandToLevel(3);
							} else {
								oTable.collapseAll();
							}
						},
						onRefresh: function (oTable) {
							oTable.getBinding("rows").refresh();
						},
					}
				}).then(function (oValueHelpDialogContent) {
					self._valueHelpDialogs[inputId] = oValueHelpDialogContent;
					that.getView().addDependent(self._valueHelpDialogs[inputId]);
					var TreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
					TreeTable.addEventDelegate({
						onAfterRendering: function (oEvent) {
							this.getRows().forEach(function (r) {
								if (r.getBindingContext()) {
									var obj = r.getBindingContext("undefined").getObject();
									var oStatus = obj.children && obj.children.length > 0;
									var sRow = r.sId.split("-")[r.sId.split("-").length - 1];
									var rowInd = sRow.substring(3, sRow.length);
									var columId = TreeTable.getId() + "-rowsel" + rowInd; //"#" + 
									if (oStatus) {
										$(document.getElementById(columId)).addClass("disabledbutton");
									} else {
										$(document.getElementById(columId)).removeClass("disabledbutton");
									}
								}
							});
						}
					}, TreeTable);
					var funTableRerender = function () {
						TreeTable.rerender();
					};
					TreeTable.attachModelContextChange(funTableRerender);
					TreeTable.attachToggleOpenState(funTableRerender);
					TreeTable.attachBusyStateChanged(funTableRerender);
					TreeTable.attachFirstVisibleRowChanged(funTableRerender);
					self._initTreeValueHelpDialog(inputId, tableData, that);
				});
			} else {
				self._initTreeValueHelpDialog(inputId, tableData, that);
				Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip").setVisible(false);
			}
		},

		_initTreeValueHelpDialog: function (inputId, tableData, that) {
			var pageData = that.getView().getBindingContext().getObject();
			Fragment.byId(inputId + "TreeVHFragment", "IdSubmit").setEnabled(false);
			var vServReq = pageData.ServiceRequest;
			var aFilter = new Filter("ServiceRequest", "EQ", vServReq);
			if (Fragment.byId(inputId + "TreeVHFragment", "CompCode")) {
				Fragment.byId(inputId + "TreeVHFragment", "CompCode").getBinding("items").filter([aFilter]);
			}
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