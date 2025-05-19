
mapboxgl.accessToken = mapToken;

const loadMap = () => {
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: "mapbox://styles/mapbox/streets-v12",
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9, // starting zoom
    });

    const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`<h6>${listing.title}</h6><p>Exact Location will be provided after Booking</p>`);

    const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);
}

// Lazy load using IntersectionObserver
const mapDiv = document.getElementById('map');

if(mapDiv) {
    const observer = new IntersectionObserver((entries)=> {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                loadMap();
                observer.unobserve(mapDiv); // Stops observing after loading the map
            }
        })
    })

    observer.observe(mapDiv); // Start observing the map div
}


