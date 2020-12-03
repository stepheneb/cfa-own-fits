#!/usr/local/bin/python3

import sys
import os.path
from os import path
import time
import glob

import numpy as np
print()
print("using numpy version: " +  np.version.version)

import matplotlib
import matplotlib.pyplot as plt
print("using matplotlib version: " +  matplotlib.__version__)

import fitsio
from fitsio import FITS,FITSHDR

if len(sys.argv) < 2:
    print("*** error: no FITS input file directory specified")
    quit()

indir = sys.argv[1]
exists = path.exists(indir)

if exists:
    print("input path exists: " + indir)
else:
    print("path not found: " + indir)
    quit()

indir = indir.rstrip("/")

head_tail = os.path.split(indir)

dirname = head_tail[1]
print(f"dirname: {dirname}\n")

outdir = "rawdata/" + dirname

def extract_raw_image_data(infile, outdir):
    print("processing: "+ infile)

    original_filename = os.path.split(infile)[1]
    print("original_filename: " + original_filename)

    base_filename = os.path.splitext(original_filename)[0]
    print("base_filename: " + base_filename)

    if not os.path.exists(outdir):
        print("creating output directory for rawdata: " + outdir)
        os.makedirs(outdir)

    fits=fitsio.FITS(infile)

    print("hdus: " + str(len(fits)))

    img = fits[0].read()

    normalize_img_datatype = {
        "float32": lambda img: img,
        "float64": lambda img: img.astype('float32'),
        "int16": lambda img: img.astype('float32') / 3276.8,
        "uint16": lambda img: img.astype('float32')
    }

    dtype = str(img.dtype)
    print("img datatype: " + dtype)
    if (dtype != 'float32'):
        print(f"normalizing image with datatype {dtype} to float32")
        img = normalize_img_datatype[dtype](img)

    y = len(img)
    x = len(img[0])

    print("x: " + str(x))
    print("y: " + str(y))

    original_min = np.min(img)
    original_max = np.max(img)

    print (f"min: {str(original_min)}")
    print (f"max: {str(original_max)}")

    print("\npercentiles:")

    percentile_001 = np.percentile(img, 0.01)
    percentile_01 = np.percentile(img, 0.1)
    percentile_1 = np.percentile(img, 1)
    percentile_5 = np.percentile(img, 5)
    percentile_10 = np.percentile(img, 10)
    percentile_50 = np.percentile(img, 50)
    percentile_90 = np.percentile(img, 90)
    percentile_95 = np.percentile(img, 95)
    percentile_99 = np.percentile(img, 99)
    percentile_999 = np.percentile(img, 99.9)

    print (f"percentile 0.01: {str(percentile_001)}")
    print (f"percentile 0.1: {str(percentile_01)}")
    print (f"percentile 1: {str(percentile_1)}")
    print (f"percentile 5: {str(percentile_5)}")
    print (f"percentile 10: {str(percentile_10)}")
    print (f"percentile 50: {str(percentile_50)}")
    print (f"percentile 90: {str(percentile_90)}")
    print (f"percentile 95: {str(percentile_95)}")
    print (f"percentile 99: {str(percentile_99)}")
    print (f"percentile 99.9: {str(percentile_999)}")

    bottom = percentile_001
    if (original_min >= 0):
        bottom = original_min
    top = percentile_999

    print(f"Clipping to: {str(bottom)}, {str(top)}")
    img =  np.clip(img, bottom, top)

    clipped_min = np.min(img)
    clipped_max = np.max(img)
    print (f"min: {str(clipped_min)}")
    print (f"max: {str(clipped_max)}")

    print("\noffset")
    img =  img - clipped_min

    offset_min = np.min(img)
    offset_max = np.max(img)

    print (f"min: {str(offset_min)}")
    print (f"max: {str(offset_max)}")

    print("\nscale")
    img =  img * 10 / (offset_max - offset_min)

    scaled_min = np.min(img)
    scaled_max = np.max(img)

    print (f"min: {str(scaled_min)}")
    print (f"max: {str(scaled_max)}")

    outfile = outdir + '/' + base_filename + '.bin'

    output_file = open(outfile, 'wb')
    img.tofile(output_file)
    output_file.close()

    print("writing: " + outfile)
    print("")

    # fig, ax = plt.subplots(2)
    # ax[0].hist(img.flatten(), bins=100, range=(0.1, 40), density=False);
    # ax[0].set_title("M82_Chandra_Xray_mid_energy");
    # ax[1].hist(img.flatten(), bins=100, range=(0.1, 40), density=False);
    # ax[1].set_yscale('log', nonpositive='clip');
    # fig.show()
    # time.sleep(10)


for entry in os.scandir(indir):
    if (entry.path.endswith(".fits") or entry.path.endswith(".FITS")):
        # print(entry.path)
        extract_raw_image_data(entry.path, outdir)
