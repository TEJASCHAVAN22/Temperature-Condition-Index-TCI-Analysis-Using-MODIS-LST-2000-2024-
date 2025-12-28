# 🌍 Temperature Condition Index (TCI) — MODIS LST Analysis ✨

🔖 Short: This Google Earth Engine (GEE) script computes the Temperature Condition Index (TCI) from MODIS LST (MOD11A2) over a defined study area (AOI) and time period, visualizes the result, adds a map legend, and exports the mean TCI as a GeoTIFF.

---

## 🧭 Introduction
Temperature Condition Index (TCI) is an indicator derived from Land Surface Temperature (LST) used to evaluate thermal conditions relative to observed extremes. This project uses MODIS LST Day 8-day composites (MOD11A2) scaled to degrees Celsius, computes per-image min/max and produces TCI values (0–100). Visual outputs and export are provided.

---

## 🎯 Objective
- Compute a smoothed temporal TCI series from MODIS LST for a given AOI.
- Visualize TCI classes on the map with a clear legend.
- Export mean TCI as a GeoTIFF for further analysis.

---

## 🎯 Aim
- Provide an easy-to-run GEE script for monitoring thermal conditions across time for a study area (e.g., district-level).
- Produce publication-ready maps and an exportable raster.

---

## 🛠 Method
1. Load AOI (FeatureCollection asset).
2. Load MODIS LST collection (`MODIS/006/MOD11A2`) and filter by AOI and date range.
3. Scale LST to Celsius:
   - image * 0.02 → float → subtract 273.15 K.
4. Add a period/year property for 8-day composites.
5. Compute per-image min and max LST across the collection.
6. Calculate TCI per image:
   - TCI = ((max - LST) / (max - min)) × 100 → band name `TCI`.
7. Visualize mean TCI with palette (red → yellow → green).
8. Add a UI legend and export mean TCI to Google Drive (GeoTIFF).

---

## 🧪 Analysis
- TCI values range 0–100:
  - Low (0–33) — red: thermal stress / warmer relative conditions
  - Medium (34–66) — yellow: moderate
  - High (67–100) — green: cooler relative conditions
- Time-series charting of TCI over the AOI is available via `ui.Chart.image.series()`.
- The script calculates min/max across the entire collection for normalization; this reduces per-image sensitivity to outliers and smooths temporal comparisons.

---

## 🖼 Map Visualization & Legend
- Palette: `['red', 'yellow', 'green']`
- Legend entries:
  - 🔴 Low (0–33)
  - 🟡 Medium (34–66)
  - 🟢 High (67–100)

---

## ⚙️ How to run (Google Earth Engine Code Editor)
1. Open https://code.earthengine.google.com/
2. Create or update an asset for your AOI and replace the asset path in the script:
   - Example AOI used in script: `projects/gee-trial2/assets/Shapfile/WMH_Distric`
3. Set the desired `startyear`, `endyear`, `startmonth`, `endmonth` variables.
4. Paste the provided script into the Code Editor.
5. Run the script — map layers, chart and legend will appear.
6. Use the Export dialog or let the `Export.image.toDrive()` call run to save the GeoTIFF to your Drive.

Tip: Ensure your AOI is valid and the script has permission to export to your Drive.

---

## 📁 Outputs
- On-map: Mean TCI layer clipped to AOI.
- Chart: Smoothed TCI time series for the AOI.
- Export: GeoTIFF named `TCI_Final` (scale 250m) covering the AOI.

---

## 🧾 Code Snippet (scaling LST to °C)
```js
// Scale MODIS LST Indices by a factor of 0.02 and convert Kelvin to Celsius
var scaleMOD_lst = function(image) {
  return image
    .multiply(0.02)       // scale factor for MOD11A2
    .float()              // convert to float
    .subtract(273.15)     // Kelvin -> Celsius
    .set("system:time_start", image.get("system:time_start"));
};
```

---

## 📚 References
- MODIS LST Product: MOD11A2 — NASA LP DAAC  
  https://lpdaac.usgs.gov/products/mod11a2v006/
- Google Earth Engine — https://earthengine.google.com/
- Anyakwo, et al., examples of TCI usage (see domain literature for context-specific interpretations)

---

## ✍️ Author

Tejas Chavan  
* GIS Expert at Government Of Maharashtra Revenue & Forest Department  
* tejaskchavan22@gmail.com  
* +91 7028338510  
---

## ✅ Notes & Recommendations
- Validate scaling and variable names if you modify bands or datasets.
- For long-term trend analysis, consider smoothing (rolling windows) or seasonal decomposition.
- If using a different MODIS product or spatial resolution, adapt the `scale` and `select()` calls accordingly.
- If your AOI is large, consider tiling or downsampling to avoid export limits.

---

If you'd like, I can:
- Generate a polished PDF summary or a Jupyter-friendly export guide.
- Add badges (License, GEE-ready) and an example visualization image for the README.
- Create a quick script to compute and export monthly TCI summaries.
```
