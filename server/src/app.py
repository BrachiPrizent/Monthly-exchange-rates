import os
import pymongo
import schedule
import time
from dotenv import load_dotenv
from connecting_to_mongoDB import insert_all_rates, job

load_dotenv()

client = pymongo.MongoClient(os.getenv('MONGO_CLIENT'))
collection = client['exchange_rates']['usd_monthly_avg']

def main():
    insert_all_rates(collection)
    schedule.every().day.at("01:00").do(lambda: job(collection))
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__  == "__main__":
    main()
