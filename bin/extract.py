#!/usr/local/bin/python3

from fitsio import FITS, FITSHDR
import fitsio
import matplotlib.pyplot as plt
import matplotlib
from scipy import interpolate
import sys
import os.path
from os import path
import time
import glob

import numpy as np
print()
print("using numpy version: " + np.version.version)


print("using matplotlib version: " + matplotlib.__version__)


if len(sys.argv) < 2:
    print("*** error: no FITS input file directory specified")
    quit()

indir = sys.argv[1]

logscalestr = "000"
if len(sys.argv) == 3:
    logscalestr = sys.argv[2]

exists = path.exists(indir)

if exists:
    print("input path exists: " + indir)
else:
    print("path not found: " + indir)
    quit()

indir = indir.rstrip("/")

head_tail = os.path.split(indir)

dirname = head_tail[1]
print(f"dirname: {dirname}")

outdir = "rawdata/" + dirname
print(f"outdir: {outdir}")


def percentStr(val):
    return f"{round(val*100, 2)}%"


def human_size(fsize, units=[' bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB']):
    return "{:.2f}{}".format(float(fsize), units[0]) if fsize < 1024 else human_size(fsize / 1024, units[1:])


def image_file_size(image):
    return image.size * image.itemsize


def scale_image(scale, image):
    [ny, nx] = image.shape[:2]
    [n2y, n2x] = np.multiply([ny, nx], scale).astype(int)
    def xrange(x): return np.linspace(0, 1, x)
    f = interpolate.interp2d(xrange(nx), xrange(ny), image, kind="linear")
    scaled_image = f(xrange(n2x), xrange(n2y))
    return scaled_image


def scale_image2(scale, image):
    [ny, nx] = image.shape[:2]
    [n2y, n2x] = np.multiply([ny, nx], scale).astype(int)
    def xrange(x): return np.linspace(0, 1, x)
    f = interpolate.interp2d(xrange(nx), xrange(ny), image, kind="linear")
    scaled_image = np.float32(f(xrange(n2x), xrange(n2y)))
    expected_size = n2x * n2y * 4
    actual_size = image_file_size(scaled_image)
    dt = str(scaled_image.dtype)
    return scaled_image


def write_img_to_file(image, base_filename, outdir, scale=1):
    if scale != 1:
        image = scale_image2(scale, image)

    [ny, nx] = image.shape[:2]
    outpath = f"{outdir}/{nx}x{ny}"

    if (nx + ny < 800):
        print(f"Skipping {outpath}, too small")
    else:
        if not os.path.exists(outpath):
            print("creating output directory for rawdata: " + outpath)
            os.makedirs(outpath)

        print("flip image 180 degrees")
        image = np.flipud(image);

        outfile = f"{outpath}/{base_filename}.bmp"

        output_file = open(outfile, 'wb')
        image.tofile(output_file)
        output_file.close()

        actual_size = image_file_size(image)
        if scale == 1:
            print("writing rawdata image: " + outfile)

        else:
            print(f"writing {scale}x rawdata image: " + outpath)

        print(f"file size: {actual_size},  ({human_size(actual_size)}")
        print()


def extract_raw_image_data(infile, outdir, logscaling):
    original_filename = os.path.split(infile)[1]
    base_filename = os.path.splitext(original_filename)[0]

    print(f"\n-------- {base_filename} --------\n")
    print("processing: " + infile)

    if not os.path.exists(outdir):
        print("creating output directory for rawdata: " + outdir)
        os.makedirs(outdir)

    if logscaling:
        print("process with log-scaling")
    else:
        print()

    fits = fitsio.FITS(infile)

    print("hdus: " + str(len(fits)))

    img = fits[0].read()
    img_flat = img.flatten()

    print()
    print("fits image min: " + str(img_flat.min()))
    print("fits image max: " + str(img_flat.max()))
    print()

    image_size = img.size
    file_size = image_file_size(img)

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

    print(f"image size: {file_size} ({human_size(file_size)})")

    print()

    [x, y] = img.shape[:2]

    print("x: " + str(x))
    print("y: " + str(y))

    print()

    print("percentiles:")

    percentile_0001 = np.percentile(img, 0.001)
    percentile_001 = np.percentile(img, 0.01)
    percentile_01 = np.percentile(img, 0.1)
    percentile_1 = np.percentile(img, 1)
    percentile_5 = np.percentile(img, 5)
    percentile_10 = np.percentile(img, 10)
    percentile_50 = np.percentile(img, 50)
    percentile_90 = np.percentile(img, 90)
    percentile_95 = np.percentile(img, 95)
    percentile_99 = np.percentile(img, 99)
    percentile_995 = np.percentile(img, 99.5)
    percentile_999 = np.percentile(img, 99.9)
    percentile_9999 = np.percentile(img, 99.99)

    print(f"percentile 0.001: {str(round(percentile_0001 ,3))}")
    print(f"percentile 0.01: {str(round(percentile_001 ,3))}")
    print(f"percentile 0.1: {str(round(percentile_01 ,3))}")
    print()
    print(f"percentile 1: {str(round(percentile_1 ,3))}")
    print(f"percentile 5: {str(round(percentile_5 ,3))}")
    print(f"percentile 10: {str(round(percentile_10 ,3))}")
    print(f"percentile 50: {str(round(percentile_50 ,3))}")
    print(f"percentile 90: {str(round(percentile_90 ,3))}")
    print(f"percentile 95: {str(round(percentile_95 ,3))}")
    print(f"percentile 99: {str(round(percentile_99 ,3))}")
    print()
    print(f"percentile 99.5: {str(round(percentile_995 ,3))}")
    print(f"percentile 99.9: {str(round(percentile_999 ,3))}")
    print(f"percentile 99.99: {str(round(percentile_9999 ,3))}")

    print()

    original_min = np.min(img)
    original_max = np.max(img)

    print(f"min: {str(round(original_min, 3))}")
    print(f"max: {str(round(original_max, 1))}")

    next_min_index = np.argmax(img_flat > original_min)
    next_min = img_flat[next_min_index]
    min_greater_than_next_min = img_flat[np.argmax(img_flat > next_min)]

    min_greater_than_zero = img_flat[np.argmax(img_flat > 0)]

    count_less_than_zero = np.count_nonzero(img_flat < 0)
    percent_count_less_than_zero = count_less_than_zero / image_size

    count_less_than_next_min = np.count_nonzero(img_flat < next_min)
    percent_less_than_next_min = count_less_than_next_min / image_size

    count_less_than_min_greater_than_next_min = np.count_nonzero(
        img_flat < min_greater_than_next_min)
    percent_less_than_min_greater_than_next_min = count_less_than_min_greater_than_next_min / image_size

    print()

    print(f"count less than zero: {str(count_less_than_zero)}, {percentStr(percent_count_less_than_zero)}")

    print(f"next min: {str(round(next_min, 3))}, count: {str(count_less_than_next_min)}, {percentStr(percent_less_than_next_min)}")

    print(f"next after next min: {str(round(min_greater_than_next_min, 3))}, count: {str(count_less_than_min_greater_than_next_min)}, {percentStr(percent_less_than_min_greater_than_next_min)}")

    print()

    count_more_than_99 = np.count_nonzero(img_flat > percentile_99)
    percent_count_more_than_99 = count_more_than_99 / image_size
    count_more_than_995 = np.count_nonzero(img_flat > percentile_995)
    percent_count_more_than_995 = count_more_than_995 / image_size
    count_more_than_999 = np.count_nonzero(img_flat > percentile_999)
    percent_count_more_than_999 = count_more_than_999 / image_size

    print(f"count more than {round(percentile_99, 2)} (99 percentile): {str(count_more_than_99)}")
    print(f"count more than {round(percentile_995, 2)} (99.5 percentile): {str(count_more_than_995)}")
    print(f"count more than {round(percentile_999, 2)} (99.9 percentile): {str(count_more_than_999)}")

    print()

    top = percentile_999
    top = percentile_999 - (percentile_999 - percentile_995) / 2
    # top = percentile_99

    if (count_less_than_next_min / image_size < 0.01) and (count_less_than_min_greater_than_next_min / image_size < 0.01):
        bottom = percentile_1
    elif (count_less_than_min_greater_than_next_min / image_size < 0.01):
        bottom = min_greater_than_next_min
    else:
        bottom = next_min

    if logscaling:
    #     bottom = percentile_99
    #     bottom = percentile_1
    #     bottom = percentile_01
    #     bottom = original_min
    #     top = percentile_9999
    #     top = percentile_995
    #     top = original_max
    #
        bottom = original_min
        top = original_max


    # special case for M51 X-ray clip: 90..99 percentile
    # bottom = percentile_90
    # top = percentile_99

    print(f"Clipping to: {str(round(bottom, 3))}, {str(round(top, 3))}")
    img = np.clip(img, bottom, top)

    clipped_min = np.min(img)
    clipped_max = np.max(img)
    print(f"clipped min: {str(round(clipped_min, 3))}")
    print(f"clipped max: {str(round(clipped_max, 3))}")

    print("\nShifting data to 0")
    img = img - clipped_min

    offset_min = np.min(img)
    offset_max = np.max(img)

    print(f"shifted min: {str(round(offset_min, 3))}")
    print(f"shifted max: {str(round(offset_max, 3))}")

    if logscaling:
        print("\nRescaling data to 0..1000")
        # img = img * 1000 / (offset_max - offset_min)
    else:
        print("\nRescaling data to 0..10")
        img = img * 10 / (offset_max - offset_min)




    scaled_min = np.min(img)
    scaled_max = np.max(img)

    print(f"rescaled min: {str(round(scaled_min, 3))}")
    print(f"rescaled max: {str(round(scaled_max, 3))}")

    print()

    print("Transformed percentiles:")

    percentile_0001 = np.percentile(img, 0.001)
    percentile_001 = np.percentile(img, 0.01)
    percentile_01 = np.percentile(img, 0.1)
    percentile_1 = np.percentile(img, 1)
    percentile_5 = np.percentile(img, 5)
    percentile_10 = np.percentile(img, 10)
    percentile_50 = np.percentile(img, 50)
    percentile_90 = np.percentile(img, 90)
    percentile_95 = np.percentile(img, 95)
    percentile_99 = np.percentile(img, 99)
    percentile_995 = np.percentile(img, 99.5)
    percentile_999 = np.percentile(img, 99.9)
    percentile_9999 = np.percentile(img, 99.99)

    print(f"percentile 0.001: {str(round(percentile_0001 ,3))}")
    print(f"percentile 0.01: {str(round(percentile_001 ,3))}")
    print(f"percentile 0.1: {str(round(percentile_01 ,3))}")
    print()
    print(f"percentile 1: {str(round(percentile_1 ,3))}")
    print(f"percentile 5: {str(round(percentile_5 ,3))}")
    print(f"percentile 10: {str(round(percentile_10 ,3))}")
    print(f"percentile 50: {str(round(percentile_50 ,3))}")
    print(f"percentile 90: {str(round(percentile_90 ,3))}")
    print(f"percentile 95: {str(round(percentile_95 ,3))}")
    print(f"percentile 99: {str(round(percentile_99 ,3))}")
    print()
    print(f"percentile 99.5: {str(round(percentile_995 ,3))}")
    print(f"percentile 99.9: {str(round(percentile_999 ,3))}")
    print(f"percentile 99.99: {str(round(percentile_9999 ,3))}")

    print()

    write_img_to_file(img, base_filename, outdir)
    write_img_to_file(img, base_filename, outdir, 0.5)
    write_img_to_file(img, base_filename, outdir, 0.25)

    # fig, ax = plt.subplots(2)
    # ax[0].hist(img.flatten(), bins=100, range=(0.1, 40), density=False);
    # ax[0].set_title("M82_Chandra_Xray_mid_energy");
    # ax[1].hist(img.flatten(), bins=100, range=(0.1, 40), density=False);
    # ax[1].set_yscale('log', nonpositive='clip');
    # fig.show()
    # time.sleep(10)


index = 0
for entry in os.scandir(indir):
    if (entry.path.endswith(".fits") or entry.path.endswith(".FITS")):
        # print(entry.path)
        logscaling = logscalestr[index] != "0"
        extract_raw_image_data(entry.path, outdir, logscaling)
        index += 1

print()
