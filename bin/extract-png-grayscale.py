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

from wand.image import Image, CHANNELS

import numpy as np
print()
print("using numpy version: " + np.version.version)


print("using matplotlib version: " + matplotlib.__version__)


if len(sys.argv) < 2:
    print("*** error: no PNG input file directory specified")
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

    if not os.path.exists(outpath):
        print("creating output directory for rawdata: " + outpath)
        os.makedirs(outpath)

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


def process_image(img):

    img_flat = img.flatten()
    image_size = img.size
    file_size = image_file_size(img)

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

    print(f"min: {str(round(original_min, 3))}")
    print(f"max: {str(round(original_max, 1))}")

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

    print(f"count more than {round(percentile_99, 3)} (99 percentile): {str(count_more_than_99)}")
    print(f"count more than {round(percentile_995, 3)} (99.5 percentile): {str(count_more_than_995)}")
    print(f"count more than {round(percentile_999, 3)} (99.9 percentile): {str(count_more_than_999)}")

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

    return img

    # write_img_to_file(img, base_filename, outdir)
    # write_img_to_file(img, base_filename, outdir, 0.5)
    # write_img_to_file(img, base_filename, outdir, 0.25)


def extract_raw_image_data(infile, outdir):
    original_filename = os.path.split(infile)[1]
    base_filename = os.path.splitext(original_filename)[0]

    print(f"\n-------- {base_filename} --------\n")
    print("processing: " + infile)

    if not os.path.exists(outdir):
        print("creating output directory for rawdata: " + outdir)
        os.makedirs(outdir)


    with Image(filename=infile) as img:
        [width, height] = img.size;
        print([width, height])
        for r in 1, 0.5, 0.25, 0.125:
            print(r)
            with img.clone() as i:
                i.scale(int(width * r), int(height * r))
                [scaled_width, scaled_height] = i.size;
                print([scaled_width, scaled_height])
                scaled_outdir = f"{outdir}/{scaled_width}x{scaled_height}"
                if not os.path.exists(scaled_outdir):
                    print("creating output directory for scaled rawdata: " + scaled_outdir)
                    os.makedirs(scaled_outdir)
                outbase = f"{scaled_outdir}/{base_filename}"
                pixels = i.export_pixels(channel_map='I', storage='float')
                arr = np.array(pixels).astype(np.float32)
                print (arr.size)
                binimage = arr.reshape((scaled_width, scaled_height))
                binimage = process_image(binimage)
                outpath = f"{outbase}.bmp"
                print(f"Writing: binary file: {outpath}")
                output_file = open(outpath, 'wb')
                binimage.tofile(output_file)
                output_file.close()


for entry in os.scandir(indir):
    if (entry.path.endswith(".png") or entry.path.endswith(".PNG")):
        # print(entry.path)
        extract_raw_image_data(entry.path, outdir)

print()
