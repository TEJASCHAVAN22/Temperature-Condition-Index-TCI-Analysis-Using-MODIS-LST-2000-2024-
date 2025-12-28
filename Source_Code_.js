
// Scale MODIS LST Indices by a factor of 0.02
var scaleMOD_lst = function(image) {
        return  image
          .multiply(0.02) //divide image values by 0.02
          .float() // conve  rt to float
          .subtract(273.15) ///substract image values by 273.15 kelvin to normal sacling 
          .set("system:time_start", image.get("system:time_start")); // keep time info
};

///---------------------------------------------------------------------------
//---------------------------Study Area ------------------------------------------------

var aoi = ee.FeatureCollection('projects/gee-trial2/assets/Shapfile/WMH_Distric');
Map.centerObject(aoi, 5);

//--------------------------------------------------------------------------------

var startyear = 2000; 
var endyear = 2014;
var startmonth = 1; 
var endmonth = 12; 

// Compute beginning & end of study period + sequence of months & years
var start_date = ee.Date.fromYMD(startyear, startmonth, 1);
var end_date = ee.Date.fromYMD(endyear , endmonth, 30);
var years = ee.List.sequence(startyear, endyear);
var months = ee.List.sequence(startmonth,endmonth);

//------------------------------------------------------------------
//---------------------- ee.collection of Dataset -----------------

var LST_dataset = ee.ImageCollection('MODIS/006/MOD11A2') // Lst Dataset collection 
                .filter(ee.Filter.bounds(aoi))
                .map(scaleMOD_lst)
                .filterDate(start_date, end_date)
                .select('LST_Day_1km');


//-------------------------------------------------------------------------------------------------------
//------------------------monthely Calculation LST & NDVI------------------------------
//--------------------------LST Calculation-------------------------------------------
var filtered = LST_dataset
var addImageNumber = function(image) {
  var start_date = ee.Date(image.get('system:time_start'));
  var difference = start_date.getRelative('day', 'year'); 
  var period = difference.divide(8).add(1);
  return image.set('period', period).set('year',image.date().get('year'));
};

var lstCol = filtered.select('LST_Day_1km').map(addImageNumber);
print('8 day lstCollection' , lstCol);

//----------------------------------------------------------------------------------------------------------
//----------------------Calculate per-image NDVI min and max values---------------------------------------
//----------------------------------------LST MIN MAX---------------------------------------------------------------

var minlst = lstCol.reduce(ee.Reducer.min());
var maxlst = lstCol.reduce(ee.Reducer.max());
var lstStats = lstCol.map(function(image) {
  var lst = image.select('lst');
  return image.set('minlst', minlst).set('maxlst', maxlst);
});
print('8 day lstCollection with min and max lst values', lstStats);

//-----------------------Calculation the temparature condition index---------------------------------

var lst2 = lstStats.map(
  function(img) {
    var lst = img.select('LST_Day_1km');
    var tci = maxlst.subtract(lst).divide(maxlst.subtract(minlst)).multiply(100)
                  .rename('TCI');
    return img.addBands(tci); // Add the 'TCI' band to the image
  }
);

var TCI = lst2.select('TCI')
print(TCI, 'TCI')
print(ui.Chart.image.series(TCI, aoi)
        .setOptions({
          title: 'Smoothed TCI Time Series',
          lineWidth: 1,
          pointSize: 3
        }));
        
Map.addLayer(TCI.mean().select('TCI').clip(aoi), {min: 0, max: 100, palette: ['red', 'yellow', 'green']}, 'TCI');       
//-------------------------------------------------------------------------------------
// ======================
// TCI Visualization
// ======================
var tciVis = {
  min: 0,
  max: 100,
  palette: ['red', 'yellow', 'green']
};

Map.addLayer(
  TCI.mean().select('TCI').clip(aoi),
  tciVis,
  'TCI'
);

// ======================
// Legend Panel
// ======================
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Legend title
var legendTitle = ui.Label({
  value: 'TCI Classes',
  style: {
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '0 0 6px 0'
  }
});
legend.add(legendTitle);

// Function to create legend row
var makeRow = function(color, name) {
  return ui.Panel({
    widgets: [
      ui.Label({
        style: {
          backgroundColor: color,
          padding: '8px',
          margin: '0 0 4px 0'
        }
      }),
      ui.Label({
        value: name,
        style: { margin: '0 0 4px 6px' }
      })
    ],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

// Add legend entries
legend.add(makeRow('red',    'Low (0 – 33)'));
legend.add(makeRow('yellow', 'Medium (34 – 66)'));
legend.add(makeRow('green',  'High (67 – 100)'));

// Add legend to map
Map.add(legend);
//----------------------------------------------------------------
Export.image.toDrive({
  image: TCI.mean(),
  description: 'TCI_Final',
  scale: 250,
  region: aoi,
  fileFormat: 'GeoTIFF'
});


