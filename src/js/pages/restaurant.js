import config from '../config';
import '../../styles/app.css';
import { loadScript } from '../utils/index';
import registerServiceWorker from '../serviceworker/serviceworker';
import RestaurantInfo from '../restaurant_info';

document.addEventListener('DOMContentLoaded', (event) => {

	// loadScript(document,
	// 	'https://use.fontawesome.com/releases/v5.0.11/js/all.js',
	// 	true,
	// 	'sha384-ImVoB8Er8knetgQakxuBS4G3RSkyD8IZVVQCAnmRJrDwqJFYUE4YOv+DbIofcO9C',
	// 	'anonymous');

	window.setTimeout(() => {
		// Defer loading Google maps until the page is rendered
		loadScript(document,
			`https://maps.googleapis.com/maps/api/js?key=${config.maps.key}&libraries=places&callback=initMap`,
			true);
	},
	500);
});

var info = new RestaurantInfo(window, document);
window.initMap = info.initMap;

registerServiceWorker(navigator, window);
