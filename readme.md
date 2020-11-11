Displays red green and blue images taken by the Hubble of the Lagoon Nebula
and also displays an RGB image that combines them together.

Clone or download this repository and open a terminal shell in the directory
and start a the simple built-in python web server.

```
$ python3 -m http.server
```

Open the demo in Chrome: http://localhost:8000

The red green and blue rawdata images are included in the repository to make it
easier to load the web application.

**Under the hood.**

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
