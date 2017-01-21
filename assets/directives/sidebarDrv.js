define(['app'], function (app) {
    app.directive('sidebar', ['$rootScope', '$route', '$filter', 'GlobalSrv', 'notif', function ($rootScope, $route, $filter, GlobalSrv, notif) {
        return {
            scope: {
            },
            template: '<div sidebar-tpl ></div>',
            //templateUrl: '/app/directives/sidebarDrv.html',
            link: function ($scope, element, attrs, ngModel) {

                loadCSS(['sidebar']);

                $scope.ctrl = {

                }

                // Survey
                var getSurveys = function () {
                    GlobalSrv.cruds.get('/api/Survey/Periodicity/GetCurrent').then(function (res) {
                        $scope.$applyAsync(function () {
                            $rootScope.mainSurveyQues = res;
                            $rootScope.surveyQues = [];
                            $rootScope.mainSurveyQues.loop(function (item) {
                                if (new RegExp($route.current.originalPath + '(,|$)', 'i').test(item.target)) {
                                    item.questionsListToSurvey.loop(function (ques, i) {
                                        if ($$('survey-' + item.id + '-' + ques.id))
                                            item.questionsListToSurvey.splice(i, 1);
                                    });
                                    if (item.questionsListToSurvey.length)
                                        $rootScope.surveyQues.push(item);
                                }
                            });
                        });
                    });
                }
                // Survey END


                // LastNews
                var getLastNews = function () {
                    GlobalSrv.cruds.get('/api/news/GetLastNewsFeedItem').then(function (res) {
                        setTimeout(function() {
                            $rootScope.$applyAsync(function () {
                                res.dayName = $filter('dayName')(res.publishDayOfWeek);
                                res.monthName = $filter('monthName')(res.pPublishDate);
                                res.day = res.pPublishDate.split('/')[2];
                                res.year = res.pPublishDate.split('/')[0];
                                $rootScope.lastNews = res;
                            });
                        }, 0);
                    });
                }
                // LastNews END


                var initialize = function () {
                    getLastNews();
                    getSurveys();
                    //getSurveyQuestions();
                }();

            }
        }
    }]);
    app.directive('sidebarTpl', [function () {
        return {
            template: [
                '<div lastnews ></div>',
                '<div updates ></div>',
                '<div survey ></div>'
            ].join('')
        }
    }]);
    app.directive('lastnews', ['$rootScope', function ($rootScope) {
        return {
            template: [
                '<div class="sidebarChild sidebar-news" loading="{{!$root.lastNews}}">',
                '    <div class="anim" ng-if="$root.lastNews">',
                '        <a class="md-headline justify" ng-href="/news/{{$root.lastNews.id}}">{{::$root.lastNews.title}}</a>',
                '        <br />',
                '        <span class="md-subhead gray"><i class="material-icons pink">today</i> {{::$root.lastNews.dayName}} - {{::$root.lastNews.pPublishDate}}</span>',
                '        <p class="justify">',
                '            {{::$root.lastNews.abstract}}',
                '        </p>',
                '        <md-button class="allNews gray relCenter" ng-href="/news" aria-label="آرشیو اخبار">',
                '            <i class="material-icons pink">toc</i> آرشیو اخبار',
                '        </md-button>',
                '    </div>',
                '    <div class="flag auction" style="left: -7px;">',
                '        <span><i class="material-icons">art_track</i>&nbsp; آخرین خبر</span>',
                '    </div>',
                '</div>'
            ].join('')
        }
    }]);
    app.directive('updates', ['$rootScope', function ($rootScope) {
        return {
            template: [
                '<div class="sidebarChild">',
                '    <span class="md-headline justify">تازه ترین بخش ها</span>',
                '    <ul class="pinkBullet">',
                '        <li><a class="gray" href="/me">پروفایل شخصی</a></li>',
                '        <li><a class="gray" href="/contacts">دفترچه تلفن بیمارستان</a></li>',
                '        <li><a class="gray" href="/visitHours">ساعات و قوانین ملاقات</a></li>',
                '        <li><a class="gray" href="/conferenceHall">رزرو سالن های اجتماعات</a></li>',
                '        <li><a class="gray" href="/pamphlets">مطالب آموزشی</a></li>',
                '    </ul>',
                '    <div class="flag auction" style="left: -7px; top: 12px;">',
                '        <span><i class="material-icons" style="font-size: 1.5em;">new_releases</i>&nbsp; تازه ترین ها</span>',
                '    </div>',
                '</div>'
            ].join('')
        }
    }]);
    app.directive('survey', ['$rootScope', 'GlobalSrv', 'notif', function ($rootScope, GlobalSrv, notif) {
        return {
            scope: {
                noTpl: '='
            },
            link: function ($scope, element, attrs, ngModel) {

                $scope.surveyPicked = function (period, question, idx) {
                    question.disable = true;
                    var params = {
                        periodicity: { id: period.id },
                        question: { id: question.id }
                    }
                    if (question.multiSelect)
                        params.answer = { id: question.picked }
                    else
                        params.answerText = question.picked;

                    GlobalSrv.cruds.post('/api/Survey/UserAnswer/post', params).then(function (res) {
                        $scope.$evalAsync(function () {
                            if (res.resultFlag) {
                                notif.success('نظر شما ثبت گردید!');
                                
                            } else {
                                notif.error(res.errorMessages[0]);
                            }
                            $$('survey-' + period.id + '-' + question.id, 'ADM-' + Math.floor(Math.random() * 100));
                            period.questionsListToSurvey.splice(idx, 1);
                        });
                    });
                }

            },
            template: [
                '<div class="sidebarChild sidebar-survey sRepeatAnim-self top-left" ng-repeat="item in $root.surveyQues" ng-class="{noTpl: noTpl}" >',
                '    <span class="md-headline justify">{{item.title}}</span>',
                '    <p class="center" ng-if="!item.questionsListToSurvey.length">سپاس از شرکت شما در نظرسنجی</p>',
                '    <ul ng-if="item.questionsListToSurvey.length">',
                '        <li ng-repeat="(qKey, q) in item.questionsListToSurvey" ng-if="$first">',
                '            {{q.title}}',
                '            <br />',
                '            <md-radio-group ng-model="q.picked" ng-change="surveyPicked(item, q, qKey)" dir="rtl">',
                '                <md-radio-button value="{{ans.id}}" ng-disabled="q.disable" ng-repeat="ans in q.questionsOptionListToSurvey">{{ans.title}}</md-radio-button>',
                '            </md-radio-group>',
                '        </li>',
                '    </ul>',
                '    <div class="flag auction" style="left: -7px; top: 12px;">',
                '        <span><i class="material-icons" style="font-size: 1.5em;">speaker_notes</i>&nbsp; نظرسنجی</span>',
                '    </div>',
                '</div>'
            ].join('')
        }
    }]);
});