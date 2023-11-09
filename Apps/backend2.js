
//Add tiff image
let unpublished_layers = [
    {
        "Value": "None",
        "Text": "Select Image",
        "Image": "No_Image"
    },
    {
        "Value": "Cona.tif",
        "Text": "Cona",
        "Image": "image_layer1"
    },
    {
        "Value": "Nyingchi.tif",
        "Text": "Nyingchi",
        "Image": "image_layer2"
    },
    {
        "Value": "Quxu.tif",
        "Text": "Quxu",
        "Image": "image_layer3"
    },
    {
        "Value": "Zhongbo.tif",
        "Text": "Zhongbo",
        "Image": "image_layer4"
    }
];
let published_layers = [
    {
        "Value": "None",
        "Text": "Select Layer",
    }
];
base_url = "http://localhost:8080/geoserver/M13/wms";
layers_name = new Array(4);
layers_name[0] = 'M13:Cona';
var options = ["Select", "Cona", "Nyingchi", "Quxu", "Zhongbo"];
layer_extens = new Array(4, 4);
let dropdown = document.getElementById("myDropdown");

let tiff_list=document.getElementById('tiffImage');
let shp_list=document.getElementById('shapeImage');
let tiff_button=document.getElementById('tiffdata');
let shp_button=document.getElementById('shapedata');

// add Options list in select 
for (var i = 1; i < options.length; i++) {
    var option = document.createElement("option");
    option.text = options[i];
    option.value = i;
    dropdown.appendChild(option);      
}
//Publish tiff image
let apiUrl = "http://localhost:3000/PublishLayer";
let apiUrl2 = "http://localhost:3000/GetNameOfPublishLayer";
let shpapiUrl = "http://localhost:3000/PublishShpLayer";
function CreateStoreAndPublishTiffImage(workspace, datastore, layerName, filePath) {
    console.log(`${apiUrl}?workspace=${workspace}&datastore=${datastore}&layername=${layerName}&filePath=${filePath}`);
    return (`${apiUrl}?workspace=${workspace}&datastore=${datastore}&layername=${layerName}&filePath=${filePath}`);
}
function GetPublishedLayers(workspace) {
    console.log(`${apiUrl2}?workspaceName=${workspace}`);
    return (`${apiUrl2}?workspaceName=${workspace}`);
}
var lyr_workspace = 'M13';
fetch(GetPublishedLayers(lyr_workspace))
    .then(function (response) {
        return response.json();
    })
    .then(function (data_layer) {
        console.log("Data Layer", data_layer)
        data_layer.data.forEach((element) => {
            published_layers.push({
                "Value": unpublished_layers.filter(x => x['Text'] == element)[0].Image,
                "Text": element
            });
        });
    })
    .catch(function (error) {
        console.error('Failed to get Name:', error);
    });
var a = document.getElementById('myDropdown');
let file_name;
a.addEventListener('change', function () {
    for (var i = 0; i < options.length; i++) {
        if (this.value == i) {
            file_name = options[i] + ".tif";
            break;
        }
    }
    // const file = event.target.value;
    const file = file_name;
    let workspace = 'M13';
    let datastoreName = file.split('.')[0];
    let filePath = `D:/tiff_images/${file}`;
    if (a.value == 'select') {
        alert('please select the layer');
    }
    else if (published_layers.filter(x => x['Text'] == datastoreName).length > 0) {
        alert('"' + file_name + '"' + '  Layer already published on server!');
    }
    else {
        fetch(CreateStoreAndPublishTiffImage(workspace, datastoreName, datastoreName, filePath))
            .then(function (response) {
                return response.json();
            })
            .then(function (data_layer) {
                alert('"' + file_name + '"' + 'Layer publish  on GeoServer');
                console.log("Data", data_layer)
            })
            .catch(function (error) {
                console.error('Failed to get Name:', error);
            });
    }
}, false);
//Publish Shpae Layer
let unpublishedShap_layers = [
    {
        "Value": "None",
        "Text": "Select Image",
        "Image": "No_Image"
    },
    {
        "Value": "BuildingFootprint.shp",
        "Text": "BuildingFootprint",
        "Image": "shape_layer1"
    },
    {
        "Value": "espana.shp",
        "Text": "espana",
        "Image": "shape_layer3"
    },
    {
        "Value": "francia.shp",
        "Text": "francia",
        "Image": "shape_layer3"
    },
    {
        "Value": "gibraltar.shp",
        "Text": "gibraltar",
        "Image": "shape_layer3"
    }
];
let publishedShp_layers = [
    {
        "Value": "None",
        "Text": "Select Layer",
    }
];
let workspace = 'topp';
let datastoreName1 = 'francia';
fetch(GetPublishedLayers(workspace))
    .then(function (response) {
        return response.json();
    })
    .then(function (data_layer) {
        console.log("Shape File ", data_layer)
        data_layer.data.forEach((element) => {
            publishedShp_layers.push({
                "Value": unpublishedShap_layers.filter(x => x['Text'] == element),
                "Text": element
            });
        });
    })
    .catch(function (error) {
        console.error('Failed to get Name:', error);
    });
var shape_name = ["Select", "espana", "gibraltar", "BuildingFootprint", "portugal"];
let dropdown2 = document.getElementById("myDropdown2");
for (var i = 1; i < shape_name.length; i++) {
    var option = document.createElement("option");
    option.text = shape_name[i];
    option.value = i; 
    dropdown2.appendChild(option);    
}
var b = document.getElementById('myDropdown2');
let file_name1;
b.addEventListener('change', function () {
    for (var i = 0; i < shape_name.length; i++) {
        if (this.value == i) {
            file_name1 = shape_name[i];
            break;
        }
    }
    console.log(file_name1);
    //const file = event.target.value;
    const file = file_name1;
    //  debugger;  
    // let filePath = `D:/shepimages/${file}`;  
    if (b.value == 'select') {
        alert('please select the layer');
    }
    else if (publishedShp_layers.filter(x => x['Text'] == datastoreName1).length > 0) {
        alert('"' + file + '"' + '  Layer already published on server!');
    }
    else {
        let apiUrl3 = `http://localhost:3000/PublishShpLayer?workspace=${workspace}&datastore=${datastoreName1}&layername=${file}`;
        fetch(apiUrl3)
            .then(function (response) {
                if (response.status === 200) {
                    return response.json();  // Assuming the response is in JSON format
                } else {
                    throw new Error('Request failed with status: ' + response.status);
                }
            })
            .then(function (data_layer) {
                console.log("Data Layer", data_layer);
                alert('"' + file_name1 + '"' + ' Layer published on GeoServer');
            })
            .catch(function (error) {
                console.error('Failed to get data:', error);
            });
    }
}, false);
// let tiff_button=document.getElementById('tiffdata');
// let shp_button=document.getElementById('shapedata');
for (var i = 1; i < options.length; i++) {
    var option = document.createElement("option");
    option.text = options[i];
    option.value = i;   
    tiff_list.appendChild(option);
}

tiff_button.addEventListener('click', function () {
    for (var i = 0; i < shape_name.length; i++) {
        if (this.value == i) {
            file_name1 = shape_name[i];
            break;
        }
    }
    console.log(file_name1);
    //const file = event.target.value;
    const file = file_name1;
    //  debugger;  
    // let filePath = `D:/shepimages/${file}`;  
    if (tiff_list.value == 'select') {
        alert('please select the layer');
    }
    else if (publishedShp_layers.filter(x => x['Text'] == datastoreName1).length > 0) {
        viewer.dataSources.removeAll();
        var layer;
        alert('Layer has published on Map');
        layer = addImageryLayer("http://localhost:8080/geoserver/M13/wms", tiff_list.value, "1=1");
        viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(parseFloat(91.872808185), parseFloat(27.946446036), 500000)
});
    }
    else {
        alert("Please publish the Layer on Server");
    }
}, false);

for (var i = 1; i < shape_name.length; i++) {
    var option = document.createElement("option");
    option.text = shape_name[i];
    option.value = i;     
    shp_list.appendChild(option);
}




