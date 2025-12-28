import unittest
from freezegun import freeze_time
from unittest.mock import MagicMock, patch
from src.connecting_to_mongoDB import(
    insert_all_rates,
    insert_monthly_rate,
    get_last_month,
    get_last_month_usd_ils_avg
)

class TestExchangeRates(unittest.TestCase):

    def setUp(self):
        self.mock_collection = MagicMock()

    def test_insert_all_rates(self):
        insert_all_rates(self.mock_collection)
        self.mock_collection.insert_many.assert_called_once()
        self.assertEqual(self.mock_collection.insert_many.call_args[0][0][0]['year'], 2023)

    def test_get_last_month_regular(self):
        with freeze_time("2024-07-15"):
            year, month = get_last_month()
            self.assertEqual((year, month), (2024, 6))

    def test_get_last_month_january(self):
        with freeze_time("2024-01-15"):
            year, month = get_last_month()
            self.assertEqual((year, month), (2023, 12))

    @patch('src.connecting_to_mongoDB.requests.get')
    def test_get_last_month_usd_ils_avg(self, mock_get):
        xml_response = """
        <Root>
            <Obs OBS_VALUE="3.5"/>
            <Obs OBS_VALUE="3.7"/>
            <Obs OBS_VALUE="3.6"/>
        </Root>
        """
        mock_get.return_value.text = xml_response
        avg = get_last_month_usd_ils_avg()
        self.assertAlmostEqual(avg, 3.6, places=2)

    @patch('src.connecting_to_mongoDB.get_last_month', return_value=(2023, 12))
    @patch('src.connecting_to_mongoDB.get_last_month_usd_ils_avg', return_value=3.8)
    def test_insert_monthly_rate(self, mock_avg, mock_last_month):
        insert_monthly_rate(self.mock_collection)
        args, kwargs = self.mock_collection.insert_one.call_args
        self.assertEqual(args[0]['year'], 2023)
        self.assertEqual(args[0]['month'], 12)
        self.assertEqual(args[0]['usd_ils_avg'], 3.8)

if __name__ == '__main__':
    unittest.main()
