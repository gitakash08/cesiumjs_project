let viewer = new Cesium.Viewer('cesiumContainer', {
    selectionIndicator: true,
    baseLayerPicker: true,
    geocoder: true,
    homeButton: false,
    navigationHelpButton: false,
    sceneModePicker: true,
    timeline: false,
    animation: false,
    infoBox: true
});

var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
var selectionRectangle = document.getElementById('selectionRectangle');
let PincodeLayer;
let pincodeLayerVector;
let dataSourceVect;
let vectorFeatures = null;
let tabledata = [];
var isDragging = false;
var startPosition;
var endPosition;
var enableDraw = false;

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

addWfsVectorLayer = (wfsUrl, typeName, maxFeatures, username, password) => {
    const dataUrl = `${wfsUrl}?service=WFS&version=1.0.0&request=GetFeature&typeName=${typeName}&
                       maxFeatures=${maxFeatures}&outputFormat=application%2Fjson`;
    const credentials = btoa(`${username}:${password}`);
    const geoJsonPromise = Cesium.Resource.fetchJson({
        url: dataUrl,
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });
    return geoJsonPromise.then(function (geoJson) {
        let _promise = Cesium.GeoJsonDataSource.load(geoJson, {
            sourceUri: dataUrl,
        });
        _promise.then(function (_dataSourceVect) {
            vectorFeatures = _dataSourceVect._entityCollection._entities._array;
            dataSourceVect = _dataSourceVect;
            viewer.dataSources.add(_dataSourceVect);
            //viewer.zoomTo(dataSource); // Optionally zoom to the loaded data
        });
        return dataSourceVect;
    });
}
addImageLayerOnMap = () => {
    viewer.dataSources.removeAll();
    PincodeLayer = addImageryLayer("https://mlinfomap.net/geoserver/AKB/wms", "AKB:PINCODE", "1=1");
}
addVectorLayer = () => {
    viewer.imageryLayers.remove(PincodeLayer);
    const wfsUrl = 'https://mlinfomap.net/geoserver/AKB/ows';
    const typeName = 'AKB:Aaj_Ka_Bharat2';
    const maxFeatures = 1000;
    const username = 'admin';
    const password = 'Intel@1968';
    pincodeLayerVector = pincodeLayerVector = addWfsVectorLayer(wfsUrl, typeName, maxFeatures, username, password);
}
addWfsVectorLayerFilter = (wfsUrl, typeName, maxFeatures, username, password) => {
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
                dataSourceVect._entityCollection._entities._array.filter(_en => parseInt(_en._properties._POP_21.getValue()) >= 2000000)
            vectorFeatures = dataSourceVect._entityCollection._entities._array;
            viewer.dataSources.add(dataSourceVect);
            tabledata = dataSourceVect._entityCollection._entities._array.map(en => en.properties.getValue(dataSourceVect._entityCollection._entities._array[0].properties._propertyNames))
            tableshow(tabledata);
        });
        return dataSourceVect;
    });
};

tableshow = (data) => {
    $('#example-table').css('display', 'block');
    table = new Tabulator("#example-table", {
        data: data,
        autoColumns: true,
        movableColumns: true,
        pagination: "local",
    });
}
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
        parseFloat(77.27566416562647),
        parseFloat(28.70174765788683),
        3000000
    ),
});
updateCqlFilterAndImageryLayer = (column, value, logicalOperator, _extent) => {
    let cqlFilter = buildCqlFilterImageLayer(column, value, logicalOperator, _extent);
    viewer.imageryLayers.remove(PincodeLayer);
    PincodeLayer = addImageryLayer("https://mlinfomap.net/geoserver/AKB/wms", "AKB:PINCODE", cqlFilter);
}
filterVectorDataByExtent = (dataSource, extent) => {
    const _dataSource = new Cesium.CustomDataSource('myData');
    let _entites = []
    var bboxPolygon = turf.bboxPolygon(extent);
    dataSource.forEach(_entity => {
        let _positions = []
        _entity._polygon._hierarchy._value.positions.forEach(_pos => {
            let _latlng = cartesianToLatlng(_pos);
            _positions.push([_latlng[0], _latlng[1]])
        });
        var entityPoly = turf.polygon([
            _positions
        ]);
        if (turf.booleanIntersects(bboxPolygon, entityPoly)) {
            _entites.push(_entity)
            _dataSource.entities.add(_entity);
        }
    });
    //  viewer.dataSources.removeAll();
    viewer.dataSources.remove(dataSourceVect);
    viewer.dataSources.add(_dataSource);
    return _dataSource
}
filterVectorLayer = () => {
    if (pincodeLayerVector) {
        viewer.dataSources.removeAll();
        const wfsUrl = 'https://mlinfomap.net/geoserver/AKB/ows';
        const typeName = 'AKB:Aaj_Ka_Bharat2';
        const maxFeatures = 1000;
        const username = 'admin';
        const password = 'Intel@1968';
        addWfsVectorLayerFilter(wfsUrl, typeName, maxFeatures, username, password)
    } else {
        alert('No vector Layer on Map!!');
    }
    return
}
buildCqlFilterImageLayer = (column, value, logicalOperator, _extent) => {
    if (column && value !== undefined && logicalOperator && _extent == '') {
        return `${column} ${logicalOperator} ${value}`;
    } else if (column && value !== undefined && logicalOperator && _extent) {
        return _extent;
    }
    return "1=1";
}
buildFilterVectorLayer = () => {
}
filterDataClick = () => {
    if (PincodeLayer) {
        updateCqlFilterAndImageryLayer("TOT_POP", 300000, ">", '');
    } else {
        alert('No layers on the Map!!');
    }
    return
}
ResetFilter = () => {
    viewer.dataSources.removeAll();
    $('#example-table').css('display', 'none');
    viewer.imageryLayers.remove(PincodeLayer);

}
cartesianToLatlng = (cartesian) => {
    var latlng = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    var lat = Cesium.Math.toDegrees(latlng.latitude);
    var lng = Cesium.Math.toDegrees(latlng.longitude);
    var alt = latlng.height;
    return [lng, lat, alt];
}
StartDrawing = () => {
    $('#button_Tool').css('background-color', 'green');

    if (PincodeLayer || dataSourceVect) {
        enableDraw = true;
        $('#button_Tool').html('Tool Enabled');
    }
    else {
        alert('No layer on the map to filter!!');
        enableDraw = false;
        $('#button_Tool').css('background-color', '#071952');

    }
    //enableDraw = false;
}
disableMapMovement = () => {
    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.scene.screenSpaceCameraController.enableTranslate = false;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;
}
enableMapMovement = () => {
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableLook = true;
}
handler.setInputAction(function (click) {
    if (enableDraw) {
        startPosition = new Cesium.Cartesian2(click.position.x, click.position.y);
        isDragging = true;
    }
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
handler.setInputAction(function (movement) {
    if (enableDraw) {
        if (isDragging) {
            disableMapMovement();
            endPosition = new Cesium.Cartesian2(movement.endPosition.x, movement.endPosition.y);
            var top = Math.min(startPosition.y, endPosition.y);
            var left = Math.min(startPosition.x, endPosition.x);
            var width = Math.abs(startPosition.x - endPosition.x);
            var height = Math.abs(startPosition.y - endPosition.y);

            selectionRectangle.style.top = top + 'px';
            selectionRectangle.style.left = left + 'px';
            selectionRectangle.style.width = width + 'px';
            selectionRectangle.style.height = height + 'px';
            selectionRectangle.style.display = 'block';
        }
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
handler.setInputAction(function () {
    if (isDragging) {
        isDragging = false;
        selectionRectangle.style.display = 'none';
        var startWorld = cartesianToLatlng(viewer.camera.pickEllipsoid(new Cesium.Cartesian2(startPosition.x, startPosition.y), viewer.scene.globe.ellipsoid));
        var endWorld = cartesianToLatlng(viewer.camera.pickEllipsoid(new Cesium.Cartesian2(endPosition.x, endPosition.y), viewer.scene.globe.ellipsoid));

        if (startWorld && endWorld) {
            var west = (Math.min(startWorld[0], endWorld[0])); //min x
            var east = (Math.max(startWorld[0], endWorld[0])); //max x
            var south = (Math.min(startWorld[1], endWorld[1])); // min y
            var north = (Math.max(startWorld[1], endWorld[1])); //max y

            _extent = [west, south, east, north];
        }
        let CQL_FILTER = "BBOX(the_geom, " + _extent.join(',') + ")"
        if (PincodeLayer) {
            updateCqlFilterAndImageryLayer("TOT_POP", 300000, ">", CQL_FILTER);
            enableDraw = false;
            $('#button_Tool').css('background-color', '#071952');
            $('#button_Tool').html('Start Drag');
            enableMapMovement();
            return false
        } else {
            let data = filterVectorDataByExtent(vectorFeatures, _extent);
            tabledata = data._entityCollection._entities._array.map(en => en.properties.getValue(dataSourceVect._entityCollection._entities._array[0].properties._propertyNames))
            tableshow(tabledata);
            enableDraw = false;
            $('#button_Tool').css('background-color', '#071952');
            $('#button_Tool').html('Start Drag');
            enableMapMovement();
        }
    }
}, Cesium.ScreenSpaceEventType.LEFT_UP);





