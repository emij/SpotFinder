from flask import Flask
from PIL import Image

import base64

from flask import request
import scipy.misc
from scipy.misc import imread
from scipy.linalg import norm
from scipy import sum, average

app = Flask(__name__)
scale_size = (1024, 1024)

parking_spots = [
    [(524, 130), (660, 385)],
    [(370, 130), (515, 385)],
    [(230, 130), (260, 385)],
    [(70, 130), (200, 385)]
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
    scaled1 = scale("img/empty.jpg", scale_size)
    scaled2 = scale("img/car3.jpg", scale_size)

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

    print(free_spots(result))

    scipy.misc.toimage(result, cmin=0.0, cmax=20.0).save('outfile.jpg')

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

def normalize(arr):
    rng = arr.max()-arr.min()
    amin = arr.min()
    return (arr-amin)*255/rng

@app.route('/spots')
def hello_world():
    return 'Hello World!'

@app.route('/upload', methods=['POST'])
def upload():
    fp = open('img/uploaded.jpg', 'w')
    fp.write(base64.b64decode(request.data))
    fp.close()

    return ''

#main()
if __name__ == '__main__':
    app.run()
