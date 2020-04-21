import numpy as np
import pandas as pd
from pylab import plt, mpl

plt.style.use('seaborn')
mpl.rcParams['font.family'] = 'serif'

data = pd.read_csv('GSPC.csv', parse_dates=True, index_col=0)
data = pd.DataFrame(data['Close'])

data['rets'] = np.log(data / data.shift(1))
data['vola'] = data['rets'].rolling(252).std() * np.sqrt(252)

data[['Close', 'vola']].plot(subplots=True, figsize=(10, 6))

# plt.show()


pass