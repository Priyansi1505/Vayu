import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def train_and_predict(data):
    df = pd.DataFrame(data)

    # extract AQI values
    series = df['aqi']

    # build ARIMA model (simple version)
    model = ARIMA(series, order=(2, 1, 2))
    model_fit = model.fit()

    # predict next 72 hours (3 days)
    forecast = model_fit.forecast(steps=72)

    return forecast.tolist()
