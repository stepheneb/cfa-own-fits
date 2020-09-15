#!/usr/local/bin/python3

import numpy as np
import fitsio
from fitsio import FITS,FITSHDR

indir = "fits"
outdir = "rawdata"

# red

filename = "HST_Lagoon_f658Red.fits"
inpath = indir + '/' + filename

print("processing: "+ inpath)

fits=fitsio.FITS(inpath)

print("hdus: " + str(len(fits)))

img = fits[0].read()

y = len(img)
x = len(img[0])

print("x: " + str(x))
print("y: " + str(y))

print ("min: " + str(np.min(img)))
print ("max: " + str(np.max(img)))

outpath = outdir + '/red.bin'

output_file = open(outpath, 'wb')
img.tofile(output_file)
output_file.close()

print("writing: " + outpath)
print("")

# green

filename = "HST_Lagoon_f656Green.fits"
inpath = indir + '/' + filename

print("processing: "+ inpath)

fits=fitsio.FITS(inpath)

print("hdus: " + str(len(fits)))

img = fits[0].read()

y = len(img)
x = len(img[0])

print("x: " + str(x))
print("y: " + str(y))
print ("min: " + str(np.min(img)))
print ("max: " + str(np.max(img)))

outpath = outdir + '/green.bin'

output_file = open(outpath, 'wb')
img.tofile(output_file)
output_file.close()

print("writing: " + outpath)
print("")

# blue

filename = "HST_Lagoon_f502Blue.fits"
inpath = indir + '/' + filename

print("processing: "+ inpath)

fits=fitsio.FITS(inpath)

print("hdus: " + str(len(fits)))

img = fits[0].read()

y = len(img)
x = len(img[0])

print("x: " + str(x))
print("y: " + str(y))
print ("min: " + str(np.min(img)))
print ("max: " + str(np.max(img)))

outpath = outdir + '/blue.bin'

output_file = open(outpath, 'wb')
img.tofile(output_file)
output_file.close()

print("writing: " + outpath)
print("")

