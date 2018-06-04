// Service Worker callbacks derived from: 
// https://developers.google.com/web/fundamentals/primers/service-workers/ and 
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

import config from '../config';
import db from '../data/db';
import api from '../data/api';
import { jsonResponseFrom, idFrom } from '../utils';

const version = { number: config.cache.version };
const CACHE_NAME = `restaurant-reviews-${version.number}`;

function updateCacheFor(request) {
	return fetch(request).
		then(response => {

			if (!response || response.status !== 200)
				return response;

			return response.json().
				then(db.cacheRestaurant);
		})
}

function getAndCacheRestraunt(event) {
	return fetch(event.request).
		then(response => {

			if (!response || response.status !== 200)
				return response;

			response.clone().json().
				then(db.cacheRestaurant);

			return response;
		})
}

function tryGetFromCache(url) {

	const id = idFrom(url);

	return id ?
		db.tryGetCachedRestaurant(id) :
		db.tryGetAllCachedRestaurants();
}

function getRestaurantData(event) {
	//console.log(`FETCH [${version.number}]: [${event.request.method}] [${event.request.url}]`);

	return tryGetFromCache(event.request.url).
		then(res => {

			// If no data, assume we haven't fetched it yet
			if (!res || (!res.length && !res.id))
				return getAndCacheRestraunt(event);

			// Try also to get updated data in the background, for use during next fetch
			updateCacheFor(event.request);

			return jsonResponseFrom(res);
		});
}

function handleCacheMatch(request, response) {

	// Cache hit - return response
	if (response) {
		//console.info(`CACHE HIT: [${request.url}]`);
		return response;
	}

	// console.log(`WILL FETCH FROM NETWORK: [${request.url}]`);

	const fetchRequest = request.clone();

	return fetch(fetchRequest).
		then(response => {

			if (!response || response.status !== 200 || response.type !== 'basic')
				return response;

			var responseToCache = response.clone();

			caches.open(CACHE_NAME).
				then(cache => cache.put(request, responseToCache)).
				catch(console.error);

			return response;
		});
}

self.addEventListener('install', (event) => {
	//console.log(`INSTALL [${version.number}]`);

	event.waitUntil(
		caches.open(CACHE_NAME).
			then(cache =>
				cache.addAll(config.cache.urls)).
			then(() => Promise.all(
				config.cache.apiEndpoints.
					map(ep => api[ep]()).
					map(url => new Request(url)).
					map(request => updateCacheFor(request)))
			));
});

self.addEventListener('activate', (event) => {
	//console.log(`ACTIVATE [${version.number}]`);

	event.waitUntil(
		caches.keys().then(cacheNames => 
			Promise.all(
				cacheNames.
					filter(cacheName => cacheName !== CACHE_NAME).
					map(cacheName => 
						caches.delete(cacheName)))));
});

self.addEventListener('fetch', (event) => {
	//console.log(`FETCH [${version.number}]: [${event.request.method}] [${event.request.url}]`);

	const isRestrauntData =
		event.request.method === 'GET' &&
		event.request.url.includes('/restaurants');

	const isPassthrough =
		event.request.method === 'POST' ||
		event.request.url.includes('sockjs-node') ||
		event.request.url.includes('browser-sync');

	event.respondWith(
		isRestrauntData ? getRestaurantData(event) :
			isPassthrough ? fetch(event.request) :
				caches.match(event.request, { ignoreSearch: true }).
					then(response => handleCacheMatch(event.request, response)).
					catch(console.error)
	);
});
