import numpy as np
import timeit

loops = 250000
a = np.arange(1, loops)
am = range(1, loops)
def f ():
    return 3 * np.log(a) + np.cos(a) ** 2

print(timeit.timeit(f, number = 100))
