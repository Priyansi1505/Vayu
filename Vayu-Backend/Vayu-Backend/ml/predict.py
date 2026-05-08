import sys
import json
from linear_regression import train_and_predict as lr_predict
from arima_model import train_and_predict as arima_predict

input_data = json.loads(sys.stdin.read())

model_type = input_data.get("model", "lr")  # default = linear regression
data = input_data.get("data", [])

if model_type == "arima":
    predictions = arima_predict(data)
else:
    predictions = lr_predict(data)

print(json.dumps(predictions))
