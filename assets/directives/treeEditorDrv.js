define(['app'], function (app) {
    app.register.directive('treeEditor', ['notif', '$q', '$sce', function (notif, $q, $sce) {
        return {
            scope: {
                options: '=?',
                selected: '=?',
                snap: '=?'
            },
            require: 'ngModel',
            templateUrl: $sce.trustAsResourceUrl(CDNServer + 'treeEditorDrv.html'),
            link: function (scope, element, attrs, ngModel) {

                //loadCSS(['CDN:treeEditor']);

                scope.ctrl = {
                    selected: [],
                    readOnly: angular.isDefined(attrs.readOnly)
                }

                scope.$watch('snap', function (newVal) {
                    if (newVal instanceof Array && newVal.length);
                });

                scope.$chn = scope.options.childName;
                scope.options.maxDepth = scope.options.maxDepth || 9999;

                scope.grabTitle = function (node) {
                    var childList = scope.options.title.replace('$item.', '');
                    return __(node, childList);
                }

                var createObj = function (value, str) {
                    var result = {};
                    var childList = str.replace('$item.', '');
                    var keys = childList.split(/[.]/g);
                    while (!keys[0] && keys.length) keys.shift();
                    keys.loop(function (item, i) {
                        var tmp = {};
                        value = (i ? result : value);
                        tmp[item] = value;
                        result = tmp;
                    }, true);
                    return result;
                }

                scope.depthValid = function (depth) {
                    return depth < scope.options.maxDepth;
                }

                scope.canBeOpen = function (item, depth) {
                    return (!scope.options.selectable || scope.options.selectable && item[scope.$chn] && item[scope.$chn].length) && scope.depthValid(depth);
                }

                scope.kidOpen = function (node, item) {
                    scope.$applyAsync(function () {
                        if (item.kidContent) {
                            item.kidContent = '';
                            item.kidContentLoading = false;
                        } else {
                            if (scope.options.onKidOpen) {
                                if (scope.options.kidType == 'content') {
                                    item.kidContentLoading = true;
                                    scope.options.onKidOpen(node, function (data) {
                                        scope.$applyAsync(function () {
                                            item.kidContent = data;
                                            item.kidContentLoading = false;
                                        });
                                    });
                                } else
                                    scope.options.onKidOpen(node);
                            }
                        }
                    });


                }

                var onAdd = function (nodes, item) {
                    nodes.push(item);
                    upadteModel();
                }

                scope.add = function (nodes, item, parent) {
                    if (!item.newItem.replace(/ /g, '')) return;
                    if (!(nodes instanceof Array))
                        nodes = [];
                    var newItem = createObj(item.newItem, scope.options.title);
                    var parentNode = angular.copy(parent.node);
                    if (parentNode) parentNode[scope.$chn].push(newItem);

                    if (scope.options.onAdd) {
                        console.log(parent.$parent.node);
                        var result = scope.options.onAdd(parentNode, newItem, item.newItem);
                        $q.when(result).then(function (res) {
                            if (res) onAdd(nodes, res);
                        });
                    } else
                        onAdd(nodes, newItem);

                    item.add = false;
                    item.newItem = '';
                }

                var onEdit = function (node, item) {
                    angular.extend(node, createObj(item.editItem, scope.options.title));
                    upadteModel();
                }

                scope.edit = function (node, item, parent, idx) {
                    item.edit = false;

                    var newItem = angular.extend(angular.copy(node), createObj(item.editItem, scope.options.title));
                    var parentNode = angular.copy(parent.$parent.node);
                    if (parentNode) parentNode[scope.$chn][idx] = newItem;

                    if (scope.options.onEdit) {
                        var result = scope.options.onEdit(newItem, parentNode);
                        $q.when(result).then(function (res) {
                            if (res) onEdit(node, item);
                        });
                    } else
                        onEdit(node, item);
                }

                var onDelete = function (parent) {
                    if (parent.$depth == 1)
                        scope.ctrl.model.splice(parent.$index, 1);
                    else
                        parent.$parent.node[scope.$chn].splice(parent.$index, 1);

                    upadteModel();
                }

                scope.delete = function(parent, ev) {

                    notif.confirm({
                        title: '<i class="material-icons">delete</i> حذف',
                        textContent: 'آیا از حذف این مورد اطمینان دارید؟',
                        ok: '<i class="material-icons">delete</i> حذف',
                        cancel: '<i class="material-icons">redo</i> انصراف',
                        css: 'md-dialog-danger'
                    }).then(function () {
                        var deletedItem, parentNode = angular.copy(parent.$parent.node);

                        if (parentNode)
                            deletedItem = parentNode[scope.$chn].splice(parent.$index, 1)[0];
                        else
                            deletedItem = scope.ctrl.model[parent.$index];

                        if (scope.options.onDelete) {
                            var result = scope.options.onDelete(deletedItem, parentNode);
                            $q.when(result).then(function (res) {
                                if (res) onDelete(parent);
                            });
                        } else
                            onDelete(parent);
                    });
                }

                scope.initItem = function (node) {
                    node[scope.options.childName] = node[scope.options.childName] || [];
                }

                scope.toggle = function (item, $event) {
                    if ($event) $event.stopPropagation();
                    if (!scope.selected) scope.selected = [];
                    var idx = _.findIndex(scope.selected, { id: item.id });
                    return (idx > -1 ? (scope.selected.splice(idx, 1)) : (scope.selected.push(item)));
                };

                scope.exists = function (item) {
                    return _.findIndex(scope.selected, { id: item.id }) > -1;
                };


                var upadteModel = function (model) {
                    scope.$evalAsync(function () {
                        scope.ctrl.model = model || scope.ctrl.model;

                        ngModel.$setViewValue(scope.ctrl.model);
                        ngModel.$render();
                    });
                }

                var parser = function (val) {
                    if (!val) return val;
                    upadteModel(angular.copy(val));
                    return val;
                };

                ngModel.$formatters.push(parser);

            }
        }
    }]);
});