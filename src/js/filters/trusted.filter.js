/* jshint esversion: 6 */


export function TrustedFilter($sce) {
	return (url) => {
		return $sce.trustAsResourceUrl(url);
	};
}
