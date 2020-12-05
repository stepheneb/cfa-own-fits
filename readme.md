
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

The python program `./extract.py` processes fits files in directories in the `./fits` directory and generates corresponding directories in the `./rawdata` directory containing binary arrays of `float32` values extracted from image ddata in the original `fits` files.

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
$ ./extract.py fits/M82
using numpy version: 1.19.1
using matplotlib version: 3.3.2
input path exists: fits/M82
dirname: M82
fits/M82/M82_Spitzer_mid_Infrared.FITS
processing: fits/M82/M82_Spitzer_mid_Infrared.FITS
original_filename: M82_Spitzer_mid_Infrared.FITS
base_filename: M82_Spitzer_mid_Infrared
hdus: 1
img datatype: float64
converting img to float32
x: 1270
y: 1270
min: 0.0
max: 3107.06
writing: rawdata/M82/M82_Spitzer_mid_Infrared.bin

fits/M82/M82_Hubble_Optical.FITS
processing: fits/M82/M82_Hubble_Optical.FITS
original_filename: M82_Hubble_Optical.FITS
base_filename: M82_Hubble_Optical
hdus: 1
img datatype: float64
converting img to float32
x: 1270
y: 1270
min: -11.974789
max: 17955.271
writing: rawdata/M82/M82_Hubble_Optical.bin

fits/M82/M82_Chandra_Xray_mid_energy.FITS
processing: fits/M82/M82_Chandra_Xray_mid_energy.FITS
original_filename: M82_Chandra_Xray_mid_energy.FITS
base_filename: M82_Chandra_Xray_mid_energy
hdus: 1
img datatype: float32
x: 1270
y: 1270
min: 0.0
max: 478.33334
writing: rawdata/M82/M82_Chandra_Xray_mid_energy.bin
```

Generate the raw data image files for red, green, and blue HST_Lagoon fits files.

```
$ ./extract.py fits/HST_Lagoon
using numpy version: 1.19.1
using matplotlib version: 3.3.2
input path exists: fits/HST_Lagoon
dirname: HST_Lagoon
fits/HST_Lagoon/HST_Lagoon_f658Red.fits
processing: fits/HST_Lagoon/HST_Lagoon_f658Red.fits
original_filename: HST_Lagoon_f658Red.fits
base_filename: HST_Lagoon_f658Red
hdus: 1
img datatype: float32
x: 2600
y: 2500
min: -0.36013964
max: 118.715904
writing: rawdata/HST_Lagoon/HST_Lagoon_f658Red.bin

fits/HST_Lagoon/HST_Lagoon_f656Green.fits
processing: fits/HST_Lagoon/HST_Lagoon_f656Green.fits
original_filename: HST_Lagoon_f656Green.fits
base_filename: HST_Lagoon_f656Green
hdus: 1
img datatype: float32
x: 2600
y: 2500
min: -796.92163
max: 107.68571
writing: rawdata/HST_Lagoon/HST_Lagoon_f656Green.bin

fits/HST_Lagoon/HST_Lagoon_f502Blue.fits
processing: fits/HST_Lagoon/HST_Lagoon_f502Blue.fits
original_filename: HST_Lagoon_f502Blue.fits
base_filename: HST_Lagoon_f502Blue
hdus: 1
img datatype: float32
x: 2600
y: 2500
min: -0.02703963
max: 105.01603
writing: rawdata/HST_Lagoon/HST_Lagoon_f502Blue.bin
```

**Note**

Because the raw data in the image in the `HST_Lagoon_f656Green.fits` has a minimum
value of about -796 I'm setting the minimum displayed value to 0 in the web app.
