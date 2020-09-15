Displays red green and blue grayscale images taken by the Hubble of the Lagoon Nebula.

Clone or download this repository and open a terminal shell in the directory and start a the simple built-in python web server.

```
$ python3 -m http.server
```

Open the demo in Chrome: http://localhost:8000

The red green and blue rawdata images are included in the repository to make it easier to load the web application.

**Under the hood.**

The python program `./extract.py` processes three fits files for the Lagoon Nebula and generates raw data images used by the simple web application.

https://github.com/esheldon/fitsio

Make sure you have the [`numpy`](https://numpy.org/) and [`fitsio`] python packages installed(https://github.com/esheldon/fitsio).

```
$ python3 -V
Python 3.8.3

$ pip3 install fitsio numpy
```

Extract raw data image files for the red, green, and blue HST_Lagoon fits files.

```
$ ./extract.py
processing: fits/HST_Lagoon_f658Red.fits
hdus: 1
x: 2600
y: 2500
min: -0.36013964
max: 118.715904
writing: rawdata/red.bin

processing: fits/HST_Lagoon_f656Green.fits
hdus: 1
x: 2600
y: 2500
min: -796.92163
max: 107.68571
writing: rawdata/green.bin

processing: fits/HST_Lagoon_f502Blue.fits
hdus: 1
x: 2600
y: 2500
min: -0.02703963
max: 105.01603
writing: rawdata/blue.bin
```

**Note**

Because the raw data in the image in the `HST_Lagoon_f656Green.fits` has a minimum value of about -796 I'm setting the minimum displayed value to 0 in the web app.
