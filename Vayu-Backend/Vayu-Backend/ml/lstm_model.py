import sys
import json
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

def tanh(x):
    return np.tanh(np.clip(x, -500, 500))

class SimpleLSTM:
    def __init__(self, input_size=1, hidden_size=16):
        self.hidden_size = hidden_size
        scale = 0.1

        # forget gate
        self.Wf = np.random.randn(hidden_size, input_size + hidden_size) * scale
        self.bf = np.zeros((hidden_size, 1))

        # input gate
        self.Wi = np.random.randn(hidden_size, input_size + hidden_size) * scale
        self.bi = np.zeros((hidden_size, 1))

        # cell gate
        self.Wc = np.random.randn(hidden_size, input_size + hidden_size) * scale
        self.bc = np.zeros((hidden_size, 1))

        # output gate
        self.Wo = np.random.randn(hidden_size, input_size + hidden_size) * scale
        self.bo = np.zeros((hidden_size, 1))

        # final layer
        self.Wy = np.random.randn(1, hidden_size) * scale
        self.by = np.zeros((1, 1))

    def forward(self, x_seq):
        h = np.zeros((self.hidden_size, 1))
        c = np.zeros((self.hidden_size, 1))

        for x in x_seq:
            x = np.array([[x]])
            combined = np.vstack([h, x])

            f = sigmoid(self.Wf @ combined + self.bf)
            i = sigmoid(self.Wi @ combined + self.bi)
            c_hat = tanh(self.Wc @ combined + self.bc)
            c = f * c + i * c_hat
            o = sigmoid(self.Wo @ combined + self.bo)
            h = o * tanh(c)

        y = self.Wy @ h + self.by
        return float(y[0][0]), h, c

    def predict_sequence(self, last_seq, steps):
        h = np.zeros((self.hidden_size, 1))
        c = np.zeros((self.hidden_size, 1))

        # warm up
        for x in last_seq:
            x = np.array([[x]])
            combined = np.vstack([h, x])
            f = sigmoid(self.Wf @ combined + self.bf)
            i = sigmoid(self.Wi @ combined + self.bi)
            c_hat = tanh(self.Wc @ combined + self.bc)
            c = f * c + i * c_hat
            o = sigmoid(self.Wo @ combined + self.bo)
            h = o * tanh(c)

        predictions = []
        current_input = last_seq[-1]

        for step in range(steps):
            x = np.array([[current_input]])
            combined = np.vstack([h, x])
            f = sigmoid(self.Wf @ combined + self.bf)
            i = sigmoid(self.Wi @ combined + self.bi)
            c_hat = tanh(self.Wc @ combined + self.bc)
            c = f * c + i * c_hat
            o = sigmoid(self.Wo @ combined + self.bo)
            h = o * tanh(c)
            pred = float((self.Wy @ h + self.by)[0][0])

            # add daily pattern
            hour = step % 24
            daily = 0.08 * np.sin(2 * np.pi * (hour - 6) / 24)
            pred = pred + daily

            pred = max(0.0, min(1.0, pred))
            predictions.append(pred)
            current_input = pred

        return predictions


def train_and_predict(data, steps=72):
    try:
        aqi_values = np.array([float(d['aqi']) for d in data], dtype=np.float64)

        if len(aqi_values) < 3:
            base = aqi_values[-1] if len(aqi_values) > 0 else 100.0
            return [float(base)] * steps

        # normalize
        aqi_min = aqi_values.min()
        aqi_max = aqi_values.max()

        if aqi_max == aqi_min:
            return [float(aqi_values[-1])] * steps

        aqi_scaled = (aqi_values - aqi_min) / (aqi_max - aqi_min)

        # train
        np.random.seed(42)
        model = SimpleLSTM(input_size=1, hidden_size=16)

        seq_length = min(8, len(aqi_scaled) - 1)
        lr = 0.01

        for epoch in range(30):
            for i in range(len(aqi_scaled) - seq_length):
                x_seq = aqi_scaled[i:i+seq_length]
                target = aqi_scaled[i+seq_length]
                pred, _, _ = model.forward(x_seq)
                error = pred - target

                # simple gradient update
                model.Wy -= lr * error * np.ones_like(model.Wy) * 0.01
                model.by -= lr * error * np.ones_like(model.by)

        # predict
        last_seq = aqi_scaled[-seq_length:].tolist()
        predictions_scaled = model.predict_sequence(last_seq, steps)

        # denormalize
        predictions = [
            float(p * (aqi_max - aqi_min) + aqi_min)
            for p in predictions_scaled
        ]

        return predictions

    except Exception as e:
        print(f"LSTM ERROR: {e}", file=sys.stderr)
        base = float(data[-1]['aqi']) if data else 100.0
        return [base] * steps


if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    data = input_data.get("data", [])
    steps = input_data.get("steps", 72)
    predictions = train_and_predict(data, steps)
    print(json.dumps(predictions))