import datetime
import logging
import os
import requests
import xml.etree.ElementTree as ET
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

API_BASE_URL = os.getenv("API_BASE_URL")
today = datetime.date.today()
first_day_this_month = today.replace(day=1)
last_day_prev_month = first_day_this_month - datetime.timedelta(days=1)
first_day_prev_month = last_day_prev_month.replace(day=1)
first_str = first_day_prev_month.strftime("%Y-%m-%d")
last_str = last_day_prev_month.strftime("%Y-%m-%d")
API_URL = (
    f"{API_BASE_URL}?c%5BTIME_PERIOD%5D=ge:{first_str}+le:{last_str}&locale=he"
)

def insert_all_rates(collection):
    rates = [
        {"year": 2023, "month": 1, "usd_ils_avg": 3.445285714},
        {"year": 2023, "month": 2, "usd_ils_avg": 3.54315},
        {"year": 2023, "month": 3, "usd_ils_avg": 3.619952381},
        {"year": 2023, "month": 4, "usd_ils_avg": 3.638357143},
        {"year": 2023, "month": 5, "usd_ils_avg": 3.660095238},
        {"year": 2023, "month": 6, "usd_ils_avg": 3.644636364},
        {"year": 2023, "month": 7, "usd_ils_avg": 3.66835},
        {"year": 2023, "month": 8, "usd_ils_avg": 3.745869565},
        {"year": 2023, "month": 9, "usd_ils_avg": 3.820157895},
        {"year": 2023, "month": 10, "usd_ils_avg": 3.978272727},
        {"year": 2023, "month": 11, "usd_ils_avg": 3.805772727},
        {"year": 2023, "month": 12, "usd_ils_avg": 3.671},
        {"year": 2024, "month": 1, "usd_ils_avg": 3.713318182},
        {"year": 2024, "month": 2, "usd_ils_avg": 3.64585},
        {"year": 2024, "month": 3, "usd_ils_avg": 3.627842105},
        {"year": 2024, "month": 4, "usd_ils_avg": 3.743315789},
        {"year": 2024, "month": 5, "usd_ils_avg": 3.70747619},
        {"year": 2024, "month": 6, "usd_ils_avg": 3.724736842},
        {"year": 2024, "month": 7, "usd_ils_avg": 3.681434783},
        {"year": 2024, "month": 8, "usd_ils_avg": 3.731761905},
        {"year": 2024, "month": 9, "usd_ils_avg": 3.732809524},
        {"year": 2024, "month": 10, "usd_ils_avg": 3.751588235},
        {"year": 2024, "month": 11, "usd_ils_avg": 3.718809524},
        {"year": 2024, "month": 12, "usd_ils_avg": 3.617666667},
        {"year": 2025, "month": 1, "usd_ils_avg": 3.615272727},
        {"year": 2025, "month": 2, "usd_ils_avg": 3.5678},
        {"year": 2025, "month": 3, "usd_ils_avg": 3.6551},
        {"year": 2025, "month": 4, "usd_ils_avg": 3.69747619},
        {"year": 2025, "month": 5, "usd_ils_avg": 3.5627},
        {"year": 2025, "month": 6, "usd_ils_avg": 3.4826},
        {"year": 2025, "month": 7, "usd_ils_avg": 3.352173913},
        {"year": 2025, "month": 8, "usd_ils_avg": 3.395761905},
        {"year": 2025, "month": 9, "usd_ils_avg": 3.343210526},
        {"year": 2025, "month": 10, "usd_ils_avg": 3.280578947},
        {"year": 2025, "month": 11, "usd_ils_avg": 3.2548},
    ]
    collection.insert_many(rates)
    logger.info("All the rates have been entered!")

def job(collection):
    today = datetime.datetime.now()
    if today.day == 1:
        insert_monthly_rate(collection)

def insert_monthly_rate(collection):
    year, month = get_last_month()
    avg = get_last_month_usd_ils_avg()
    new_month = {
        'year': year ,
        'month': month,
        'usd_ils_avg': avg
    }
    collection.insert_one(new_month)
    logger.info("The monthly rate is included!")

def get_last_month():
    today = datetime.datetime.now()
    if today.month == 1:
        prev_month = 12
        prev_month_year = today.year - 1
    else:
        prev_month = today.month - 1
        prev_month_year = today.year
    return prev_month_year, prev_month

def get_last_month_usd_ils_avg():
    response = requests.get(API_URL, verify=False)
    xml_content = response.text
    tree = ET.fromstring(xml_content)
    rates = []
    for obs in tree.findall('.//Obs'):
        value = obs.attrib.get('OBS_VALUE')
        if value:
            rates.append(float(value))
    if rates:
        avg_rate = sum(rates) / len(rates)
        logger.info(f"Average dollar rate for the previous month: {avg_rate}")
    else:
        logger.warning("No gateways were found in response from the API.")
    return avg_rate
