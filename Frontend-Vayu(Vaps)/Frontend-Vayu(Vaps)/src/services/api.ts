import axios from "axios";

export const getMLPrediction = async (city: string) => {
 const res = await axios.get(`http://localhost:5000/api/ml/predict?city=${city}`);

  return res.data;
};
