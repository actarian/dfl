/* jshint esversion: 6 */

import LetterDirective from './directives/letter.directive';
import LoveDirective from './directives/love.directive';
import ScrollDirective from './directives/scroll.directive';
import TitleFooterDirective from './directives/title-footer.directive';
import TitleHeroDirective from './directives/title-hero.directive';
import TitleDirective from './directives/title.directive';
import VirtualScrollDirective from './directives/virtual-scroll.directive';
import { TrustedFilter } from './filters/trusted.filter';
import DomService from './services/dom.service';

const MODULE_NAME = 'app';

const app = angular.module(MODULE_NAME, []);

app.config(['$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('*');
}]);

app.factory('DomService', DomService.factory);

app.directive('letter', LetterDirective.factory)
	.directive('love', LoveDirective.factory)
	.directive('scroll', ScrollDirective.factory)
	.directive('title', TitleDirective.factory)
	.directive('titleFooter', TitleFooterDirective.factory)
	.directive('titleHero', TitleHeroDirective.factory)
	.directive('virtualScroll', VirtualScrollDirective.factory);

/*
app.controller('RootCtrl', RootCtrl)
	.controller('GalleryCtrl', GalleryCtrl);
*/

app.filter('trusted', ['$sce', TrustedFilter]);

/*
app.run(['$compile', '$timeout', '$rootScope', function($compile, $timeout, $rootScope) {
}]);
*/

export default MODULE_NAME;
