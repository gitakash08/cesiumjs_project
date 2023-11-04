
let viewer = new Cesium.Viewer('cesiumContainer', {
    selectionIndicator: false,
});

addImageryLayer = (url, layers, cqlQuery) => {
    console.log(cqlQuery)
    return viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapServiceImageryProvider({
            url: url,
            layers: layers,
            parameters: {
                transparent: true,
                format: "image/png",
                CQL_FILTER: cqlQuery
            },
        })
    );
}
let PincodeLayer = addImageryLayer("https://mlinfomap.net/geoserver/AKB/wms", "AKB:PINCODE", "1=1");

viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
        parseFloat(77.27566416562647),
        parseFloat(28.70174765788683),
        3000000
    ),
});
updateCqlFilterAndImageryLayer = (column, value, logicalOperator, _extent) => {
    let cqlFilter = buildCqlFilter(column, value, logicalOperator, _extent);
    viewer.imageryLayers.remove(PincodeLayer);
    PincodeLayer = addImageryLayer("https://mlinfomap.net/geoserver/AKB/wms", "AKB:PINCODE", cqlFilter);
}
buildCqlFilter = (column, value, logicalOperator,_extent) => {
    debugger
    if (column && value !== undefined && logicalOperator && _extent == '') {
        return `${column} ${logicalOperator} ${value}`;
    } else if (column && value !== undefined && logicalOperator && _extent) {
       return _extent;
    }
    return "1=1";
}
filterDataClick = () => {
    updateCqlFilterAndImageryLayer("TOT_POP", 300000, ">", '');
}
ResetFilter = () => {
    viewer.imageryLayers.remove(PincodeLayer);
    PincodeLayer = addImageryLayer("https://mlinfomap.net/geoserver/AKB/wms", "AKB:PINCODE", "1=1");
}

const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
let selectionRectangle = document.createElement("div");
selectionRectangle.className = "selection-rectangle";
viewer.container.appendChild(selectionRectangle);

let isDragging = false;
let startDragPosition;
let endDragPosition;
let StartLatLng;
let EndLatLng;
function cartesianToLatlng(cartesian) {
    var latlng = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    var lat = Cesium.Math.toDegrees(latlng.latitude);
    var lng = Cesium.Math.toDegrees(latlng.longitude);
    var alt = latlng.height;
    return [lng, lat, alt];
}
handler.setInputAction(function (movement) {
    startDragPosition = new Cesium.Cartesian2(movement.position.x, movement.position.y);
    let Start = viewer.camera.pickEllipsoid(startDragPosition, viewer.scene.globe.ellipsoid)

    StartLatLng = cartesianToLatlng(Start)
    isDragging = true;
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

handler.setInputAction(function (movement) {
    if (!isDragging) {
        return;
    }
    endDragPosition = new Cesium.Cartesian2(movement.endPosition.x, movement.endPosition.y);
    let End = viewer.camera.pickEllipsoid(endDragPosition, viewer.scene.globe.ellipsoid)
    EndLatLng = cartesianToLatlng(End)
    // Update the selection rectangle's position and size
    let rectangle = selectionRectangle.style;
    rectangle.display = "block";
    rectangle.top = Math.min(startDragPosition.y, endDragPosition.y) + "px";
    rectangle.left = Math.min(startDragPosition.x, endDragPosition.x) + "px";
    rectangle.width = Math.abs(startDragPosition.x - endDragPosition.x) + "px";
    rectangle.height = Math.abs(startDragPosition.y - endDragPosition.y) + "px";

}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction(function () {
    if (!isDragging) {
        return;
    }
    //Apply spetial query filter
    console.log(StartLatLng, EndLatLng);

    let _extent = [ EndLatLng[0], EndLatLng[1],StartLatLng[0], StartLatLng[1],];
    let CQL_FILTER = "BBOX(the_geom, " + _extent.join(',')+")"
    updateCqlFilterAndImageryLayer("TOT_POP", 300000, ">", CQL_FILTER);

    selectionRectangle.style.display = "none";
    isDragging = false;
}, Cesium.ScreenSpaceEventType.LEFT_UP);

