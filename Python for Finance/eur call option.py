import math
import numpy as np

S0 = 100
K = 105
T = 1.0
r = 0.05
sigma = 0.2

I = 100000
np.random.seed(1000)
z = np.random.standard_normal(I)

ST = S0 * np.exp((r - sigma ** 2 / 2) * T + sigma * math.sqrt(T) * z)

hT = np.maximum(ST - K, 0)

C0 = math.exp(-r * T) * np.mean(hT)

print('Value of the European call option: {:5.3f}'.format(C0))