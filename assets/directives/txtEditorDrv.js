"use strict";

define(['app'], function(app) {
    app.register.directive('txtEditor', ['$rootScope', '$sce', function ($rootScope, $sce) {
        return {
            scope: {
                data: '=?',
                images: '=?'
            },
            require: 'ngModel',
            template: '<div class="txtEditorDrvContainer"></div>',
            link: function (scope, $element, attrs, ngModel) {

                loadCSS(['CDN:font-awesome.min', 'CDN:froalaTextEditor/froala_editor.pkgd.min', 'CDN:froalaTextEditor/froala_style.min'])
                
                var $elm = $element.find('.txtEditorDrvContainer');
                var scriptLoaded = false, tmpData = '';

                scope.$on('$destroy', function() {
                    $elm.froalaEditor('destroy');
                });

                scope.data = angular.extend({
                    imageUploadParam: 'content',
                    imageUploadUrl: '/api/Document/PostFromFroala'
                }, scope.data);

                scope.images = scope.images || [];

                ngModel.$formatters.push(function (val) {
                    val = val || '';

                    if (scriptLoaded)
                        $elm.froalaEditor('html.set', val);
                    else
                        tmpData = val;

                    return val;
                });

                var initialize = function () {
                    scriptLoaded = true;

                    var changeDirection = function(dir, align) {
                        this.selection.save();
                        var elements = this.selection.blocks();
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            if (element != this.$el.get(0)) {
                                $(element)
                                    .css('direction', dir)
                                    .css('text-align', align);
                            }
                        }
                        this.selection.restore();
                    }
                    $.FroalaEditor.DefineIcon('rightToLeft', { NAME: 'long-arrow-left' });
                    $.FroalaEditor.RegisterCommand('rightToLeft', {
                        title: 'RTL',
                        focus: true,
                        undo: true,
                        refreshAfterCallback: true,
                        callback: function() {
                            changeDirection.apply(this, ['rtl', 'right']);
                        }
                    });
                    $.FroalaEditor.DefineIcon('leftToRight', { NAME: 'long-arrow-right' });
                    $.FroalaEditor.RegisterCommand('leftToRight', {
                        title: 'LTR',
                        focus: true,
                        undo: true,
                        refreshAfterCallback: true,
                        callback: function() {
                            changeDirection.apply(this, ['ltr', 'left']);
                        }
                    });

                    $elm.froalaEditor({
                        toolbarSticky: false,
                        pluginsEnabled: null,
                        direction: "rtl",
                        allowedImageTypes: ["jpeg", "jpg", "png"],
                        inverseSkin: true,
                        language: "fa",
                        imageEditButtons: ['imageDisplay', 'imageAlign', 'imageRemove', 'imageAlt'],
                        imageUploadURL: scope.data.imageUploadUrl,
                        imageUploadParam: scope.data.imageUploadParam,
                        toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'quote', 'insertHR', 'undo', 'redo', 'clearFormatting', 'selectAll', 'rightToLeft', 'leftToRight'],
                        toolbarButtonsMD: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'quote', 'insertHR', 'undo', 'redo', 'clearFormatting', 'selectAll', 'rightToLeft', 'leftToRight'],
                        toolbarButtonsSM: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'quote', 'insertHR', 'undo', 'redo', 'clearFormatting', 'selectAll', 'rightToLeft', 'leftToRight'],
                        toolbarButtonsXS: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'quote', 'insertHR', 'undo', 'redo', 'clearFormatting', 'selectAll', 'rightToLeft', 'leftToRight'],
                    });

                    $elm.froalaEditor('html.set', tmpData);

                    $elm.on('froalaEditor.contentChanged', function(e, editor) {
                        scope.$evalAsync(function() {
                            ngModel.$setViewValue($elm.froalaEditor('html.get', true));
                            ngModel.$render();
                        });
                    });

                    $elm.on('froalaEditor.image.beforeRemove', function(e, editor, $img) {
                        scope.$evalAsync(function() {
                            var docId = $img[0].currentSrc.split('?')[1].replace('id=', '');
                            var img = _.findWhere(scope.images, { documentId: docId });
                            scope.images.splice(_.findIndex(scope.images, { documentId: docId }), 1);

                            if (scope.data.onRemoveImage)
                                scope.data.onRemoveImage(docId, img);

                        });
                    });
                    $elm.on('froalaEditor.image.inserted', function(e, editor, $img, response) {
                        scope.$evalAsync(function () {
                            var docId = $img[0].currentSrc.split('?')[1].replace('id=', '');
                            scope.images.push({
                                documentId: docId,
                                url: $img[0].currentSrc,
                                caption: ''
                            });
                            if (scope.data.onAddImage)
                                scope.data.onAddImage(docId);
                        });
                    });
                };

                require([CDNServer + 'froalaTextEditor/froala_editor.pkgd.min.js'], function () {
                    require([CDNServer + 'froalaTextEditor/froala_editor.pkgd.min.js', CDNServer + 'froalaTextEditor/fa.js'], initialize);
                });

            }
        };
    }]);
});