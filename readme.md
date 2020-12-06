
Development dependencies for web application:

- node v14.15.1 which is the LTS version of the fermium series

I recommend using nvm -- a node package manager to enable the use of different versions of node for different projects: https://github.com/nvm-sh/nvm

Setting up dpendencies on macos:
```
# install or upgrade nvm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash

# restart terminal or reload terminal startup script

. ~/.bash_profile

# install latest LTS version of node

nvm install --lts=fermium

# Installing with latest version of LTS line: fermium
# v14.15.1 is already installed.
# Now using node v14.15.1 (npm v6.14.8
```

Clone or download this repository and open a terminal shell in the directory.

Setup the development environment for this application.
```
# install npm development packages for this application

npm install

# install the gulp-cli package globally

npm install --global gulp-cli
```

Use gulp to start the server and reload/compile files that change and reload the browser.

```
gulp

# [01:24:52] Requiring external module esm
# [01:24:54] Using gulpfile ~/dev/00-clients/rlmg/cfa-own-fits/gulpfile.esm.js
# [01:24:54] Starting 'default'...
# [01:24:54] Starting 'serve'...
# [01:24:54] Finished 'serve' after 12 ms
# [01:24:54] Starting 'watch'...
# [Browsersync] Access URLs:
#  --------------------------------------
#        Local: http://localhost:3000
#     External: http://192.168.1.108:3000#
#  --------------------------------------
#           UI: http://localhost:3001
#  UI External: http://localhost:3001
#  --------------------------------------

```
A chrome browser window will automatically open at address: http://localhost:3000 when the gulp process starts.

The browser will automatically reload the page when changes are saved to the html, javascript, json or css styles file.

The css styles are written in the scss variant of Sass and when changes are saved the css files are generated from the scss files and the browser will reload the page.

**Processing FITS images**

The python program `./bin/extract.py` processes folders of fits files in directories in the `./fits` directory and generates corresponding directories in the `./rawdata` directory containing binary arrays of `float32` values extracted from image ddata in the original `fits` files.

To run use `pip`
to install the [`numpy`](https://numpy.org/), [`matplotlib`](https://matplotlib.org/) and [`fitsio`](https://github.com/esheldon/fitsio)
python packages.

```
$ python3 -V
Python 3.8.3

$ pip3 install numpy matplotlib fitsio
```

Generate the raw data image files for infrared, xray, and optical M82 fits files.

```
[cfa-own-fits ruby-2.6.6 (master)]$ ./bin/extract.py fits/M82

using numpy version: 1.19.1
using matplotlib version: 3.3.2
input path exists: fits/M82
dirname: M82
outdir: rawdata/M82

--------

processing: fits/M82/M82_Spitzer_mid_Infrared.FITS
original_filename: M82_Spitzer_mid_Infrared.FITS
base_filename: M82_Spitzer_mid_Infrared
hdus: 1
img datatype: float64
normalizing image with datatype float64 to float32
size: 1612900 (1.54 MB)

x: 1270
y: 1270

percentiles:
percentile 0.001: 0.0
percentile 0.01: 0.0
percentile 0.1: 0.0
percentile 1: 1.01
percentile 5: 1.05
percentile 10: 1.07
percentile 50: 1.2
percentile 90: 3.03
percentile 95: 6.04
percentile 99: 49.59
percentile 99.9: 756.58
percentile 99.99: 2350.04

min: 0.0
max: 3107.1

next min: 0.095
count: less than next min: 9050
next after next min: 0.613
count: less than next min: 9293

Clipping to next_min and percentile 99: 0.095, 49.588
clipped min: 0.095
clipped max: 49.588

Shifting data to 0
shifted min: 0.0
shifted max: 49.492

Rescaling data to 0..10
rescaled min: 0.0
rescaled max: 10.0

Transformed percentiles:
percentile 0.001: 0.0
percentile 0.01: 0.0
percentile 0.1: 0.0
percentile 1: 0.19
percentile 5: 0.19
percentile 10: 0.2
percentile 50: 0.22
percentile 90: 0.59
percentile 95: 1.2
percentile 99: 10.0
percentile 99.9: 10.0
percentile 99.99: 10.0

writing: rawdata/M82/M82_Spitzer_mid_Infrared.bin

--------

processing: fits/M82/M82_Hubble_Optical.FITS
original_filename: M82_Hubble_Optical.FITS
base_filename: M82_Hubble_Optical
hdus: 1
img datatype: float64
normalizing image with datatype float64 to float32
size: 1612900 (1.54 MB)

x: 1270
y: 1270

percentiles:
percentile 0.001: -0.0
percentile 0.01: 0.0
percentile 0.1: 0.0
percentile 1: 0.0
percentile 5: 0.0
percentile 10: 0.0
percentile 50: 1.82
percentile 90: 5.84
percentile 95: 13.1
percentile 99: 48.24
percentile 99.9: 120.43
percentile 99.99: 339.43

min: -11.975
max: 17955.3

next min: 0.0
count: less than next min: 43
next after next min: 0.059
count: less than next min: 670540

min greater than zero: 0.059
count: less than zero: 43

Clipping to `next after next min` and percentile 99.9: 0.059, 48.241
clipped min: 0.059
clipped max: 48.241

Shifting data to 0
shifted min: 0.0
shifted max: 48.182

Rescaling data to 0..10
rescaled min: 0.0
rescaled max: 10.0

Transformed percentiles:
percentile 0.001: 0.0
percentile 0.01: 0.0
percentile 0.1: 0.0
percentile 1: 0.0
percentile 5: 0.0
percentile 10: 0.0
percentile 50: 0.37
percentile 90: 1.2
percentile 95: 2.71
percentile 99: 10.0
percentile 99.9: 10.0
percentile 99.99: 10.0

writing: rawdata/M82/M82_Hubble_Optical.bin

--------

processing: fits/M82/M82_Chandra_Xray_mid_energy.FITS
original_filename: M82_Chandra_Xray_mid_energy.FITS
base_filename: M82_Chandra_Xray_mid_energy
hdus: 1
img datatype: float32
size: 1612900 (1.54 MB)

x: 1270
y: 1270

percentiles:
percentile 0.001: 0.0
percentile 0.01: 0.0
percentile 0.1: 0.0
percentile 1: 0.0
percentile 5: 0.0
percentile 10: 0.0
percentile 50: 0.0
percentile 90: 0.33
percentile 95: 0.67
percentile 99: 4.0
percentile 99.9: 29.67
percentile 99.99: 74.67

min: 0.0
max: 478.3

next min: 0.333
count: less than next min: 1323510
next after next min: 0.667
count: less than next min: 1502082

Clipping to next_min and percentile 99: 0.333, 4.0
clipped min: 0.333
clipped max: 4.0

Shifting data to 0
shifted min: 0.0
shifted max: 3.667

Rescaling data to 0..10
rescaled min: 0.0
rescaled max: 10.0

Transformed percentiles:
percentile 0.001: 0.0
percentile 0.01: 0.0
percentile 0.1: 0.0
percentile 1: 0.0
percentile 5: 0.0
percentile 10: 0.0
percentile 50: 0.0
percentile 90: 0.0
percentile 95: 0.91
percentile 99: 10.0
percentile 99.9: 10.0
percentile 99.99: 10.0

writing: rawdata/M82/M82_Chandra_Xray_mid_energy.bin
```

**Note**

Because the raw data in the image in the `HST_Lagoon_f656Green.fits` has a minimum
value of about -796 I'm setting the minimum displayed value to 0 in the web app.
