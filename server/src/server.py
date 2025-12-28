import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)
client = MongoClient(os.getenv('MONGO_CLIENT'))
collection = client['exchange_rates']['usd_monthly_avg']

@app.route('/api/rates', methods=['GET'])
def get_rates():
    rates = list(collection.find({}))
    for item in rates:
        item["_id"] = str(item["_id"])
    return jsonify(rates)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=os.getenv("PORT"))
