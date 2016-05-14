from flask import Flask
from PIL import Image

from flask import Response
import json
import sys
import os
import os.path

import math
import base64
from functools import reduce
from flask import request
import scipy.misc
from scipy.misc import imread
from scipy.linalg import norm
from scipy import sum, average

bbox = ()
first_time = True
app = Flask(__name__)
scale_size = (1024, 1024)

parking_spots = [
    [(3, 18), (39, 39)],
    [(3, 48), (39, 69)],
    [(3, 78), (39, 99)],
    [(3, 108), (39, 129)],
    [(3, 138), (39, 159)],
    [(3, 168), (39, 189)],
    [(3, 198), (39, 219)],
    [(90, 35), (116, 80)],
    [(90, 80), (116, 125)],
    [(90, 125), (116, 170)],
    [(90, 175), (116, 220)]
]

def scale(infile, size):
    try:
        out = infile + ".thumb"
        im = Image.open(infile)
        im.thumbnail(size, Image.ANTIALIAS)
        im.save(out, "PNG")
        return out
    except IOError:
        print("cannot create thumbnail for '%s'" % infile)

def free_spots(pixels):
    spots = []
    for i, spot in enumerate(parking_spots):
        data = []

        for v1 in pixels[spot[0][1]:spot[1][1]]:
            for v2 in v1[spot[0][0]:spot[1][0]]:
                data.append(v2)

        avg = reduce(lambda x, y: x + y, data) / len(data)
        spots.append(avg > 35)

    return spots

def main():
    scaled1 = "img/empty.png.cropped.png" #, scale_size)
    scaled2 = "img/camera.png.cropped.png" #, scale_size)

    img1 = to_grayscale(imread(scaled1).astype(float))
    img2 = to_grayscale(imread(scaled2).astype(float))

    n_m, n_0, diff = compare_images(img1, img2)
    print("Manhattan norm:", n_m, "/ per pixel:", n_m/img1.size)
    print("Zero norm:", n_0, "/ per pixel:", n_0*1.0/img1.size)

    result = []
    for x, v1 in enumerate(diff.tolist()):
        result.append([])
        for y, v2 in enumerate(v1):
            result[x].append(0 if v2 > 50 else 50)

    scipy.misc.toimage(result, cmin=0.0, cmax=20.0).save('img/diff.png', 'PNG')
    return free_spots(result)

def compare_images(img1, img2):
    img1 = normalize(img1)
    img2 = normalize(img2)

    diff = img1 - img2

    m_norm = sum(abs(diff))
    z_norm = norm(diff.ravel(), 0)
    return (m_norm, z_norm, diff)

def to_grayscale(arr):
    if len(arr.shape) == 3:
        return average(arr, -1)
    else:
        return arr

def find_corners(filename):
    global first_time
    global bbox

    pxs = normalize(to_grayscale(imread(filename).astype(float)))

    if not first_time:
        img_empty = Image.open("img/empty.png")
        width, height = img_empty.size

        img = scipy.misc.toimage(pxs)
        img2 = img.crop(bbox)
        img2.save(filename + ".cropped.png", "PNG")
        return

    res = [(), ()]
    for x, v1 in enumerate(pxs):
        if x > len(pxs) / 2:
            continue

        for y, v2 in enumerate(v1):
            if y > len(v1) / 2:
                continue

            if y > 3 and math.fabs((v1[y-3] + v1[y-2]) - (v1[y-1] + v1[y])) > 200:
                #print("X: ", y, " Y: ", x, ", diff: ", math.fabs((v1[y-3] + v1[y-2]) - (v1[y-1] + v1[y])))
                res[0] = (y, x)
                break

        if len(res[0]) > 0:
            break

    for x, v1 in enumerate(reversed(pxs)):
        if x > len(pxs) / 2:
            continue

        v3 = list(reversed(v1))
        for y, v2 in enumerate(v3):
            #if y > len(v3) / 2:
            #    continue

            if y > 3 and math.fabs((v3[y-3] + v3[y-2]) - (v3[y-1] + v3[y])) > 200:
                #print("X: ", y, " Y: ", x, ", len(v3): ", len(v3), ", len(pxs): ", len(pxs))
                res[1] = (len(v3) - y, len(pxs) - x)
                break

        if len(res[1]) > 0:
            break

    print(res)
    if len(res[1]) > 0:
        img = scipy.misc.toimage(pxs)
        bbox = (res[0][0], res[0][1], res[1][0], res[1][1])
        img2 = img.crop(bbox)
        img2.save(filename + ".cropped.png", "PNG")

def normalize(arr):
    rng = arr.max()-arr.min()
    amin = arr.min()
    return (arr-amin)*255/rng

@app.route('/spots')
def hello_world():
    try:
        data = main()
        return Response(response=json.dumps(data),
                        status=200,
                        mimetype="application/json")
    except:
        return Response(response=json.dumps(list()),
                        status=200,
                        mimetype="application/json")

@app.route('/camera', methods=['POST'])
def camera():
    global first_time

    filename = "img/empty.png" if first_time else "img/camera.png"
    data = base64.b64decode(request.data)
    #print(len(data))
    with open(filename, "wb") as fo:
        fo.write(data)

    find_corners(filename)

    first_time = False
    return ''

if __name__ == '__main__':
    app.run(debug=True)
