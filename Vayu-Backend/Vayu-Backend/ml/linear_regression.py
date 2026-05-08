import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

def train_and_predict(data):
    df = pd.DataFrame(data)

    # create time index
    df['time'] = np.arange(len(df))

    X = df[['time']]
    y = df['aqi']

    model = LinearRegression()
    model.fit(X, y)

    # predict next 24 hours
    future = np.arange(len(df), len(df) + 24).reshape(-1, 1)
    predictions = model.predict(future)

    return predictions.tolist()
