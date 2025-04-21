
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9, // starting zoom
});


const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`<h6>${listing.title}</h6><p>Exact Location will be provided after Booking</p>`);

const marker = new mapboxgl.Marker({color: "red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);