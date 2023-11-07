const viewer = new Cesium.Viewer('cesiumContainer');

// Function to add a WFS vector layer
const addWfsVectorLayerFilter = (wfsUrl, typeName, maxFeatures, username, password) => {
    const dataUrl = `${wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${typeName}&maxFeatures=${maxFeatures}&outputFormat=application%2Fjson`;
    const credentials = btoa(`${username}:${password}`);
    const geoJsonPromise = Cesium.Resource.fetchJson({
        url: dataUrl,
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });
    return geoJsonPromise.then(function (geoJson) {
        const dataSourceVect = Cesium.GeoJsonDataSource.load(geoJson, {
            sourceUri: dataUrl,
        });
        dataSourceVect.then(function (dataSourceVect) {
            dataSourceVect._entityCollection._entities._array =
                dataSourceVect._entityCollection._entities._array.filter(_en => parseInt(_en._properties._POP_21.getValue()) > 3000000)
            viewer.dataSources.add(dataSourceVect);
        });
        return dataSourceVect;
    });
};

// Filter condition

// Add the filtered data source to the map
const filteredDataSource = new Cesium.GeoJsonDataSource('filteredDataSource');
viewer.dataSources.add(filteredDataSource);

// Load the vector layer and filter it
const wfsUrl = 'https://mlinfomap.net/geoserver/AKB/ows';
const typeName = 'AKB:Aaj_Ka_Bharat2';
const maxFeatures = 1000;
const username = 'admin';
const password = 'Intel@1968';
addWfsVectorLayer(wfsUrl, typeName, maxFeatures, username, password)
// addWfsVectorLayer(wfsUrl, typeName, maxFeatures, username, password).then(function (dataSourceVect) {
//     dataSourceVect.entities.values.forEach(function (entity) {
//         if (filterCondition(entity)) {
//             filteredDataSource.entities.add(entity);
//         }
//     });
// });

// Fly to a specific location
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
        parseFloat(77.27566416562647),
        parseFloat(28.70174765788683),
        3000000
    ),
});
