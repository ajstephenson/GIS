import zipfile
import glob, os

# get a list of unique shapefiles
layers = glob.glob("*.shp")

# drop the file extensions from the filenames in the list of shapefiles to get the unique base names
layers = [layer.replace(".shp","") for layer in layers]

# make a zipfile for each shapefile (where a shapefile is a collection of files sharing the same base name but having different file extensions)
for layer in layers:
    # get a list of constituent files making up the shapefile
    layerfiles = glob.glob(layer+"*")
    # create an empty zipfile for the shapefile
    zfile = zipfile.ZipFile(layer+".zip", "w")
    # add each constituent file to the zipfile
    for layerfile in layerfiles:
        zfile.write(layerfile, os.path.basename(layerfile), zipfile.ZIP_DEFLATED)
    zfile.close()
