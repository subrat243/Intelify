import asyncio
import unittest
from types import SimpleNamespace

from routers.iocs import lookup_ioc
from routers.iocs import list_iocs
from models.schemas import IOC, IOCType


class IOCMock:
    def get_all_iocs(self):
        return [IOC(id="1", type=IOCType.IP, value="1.2.3.4", source="Test", sources=["Test", "Second Feed"])]


class IOCLookupTests(unittest.TestCase):
    def test_lookup_reports_values_actually_processed(self):
        request = SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(feed_manager=IOCMock())))
        values = [str(index) for index in range(75)]

        response = asyncio.run(lookup_ioc(request, {"values": values}))

        self.assertEqual(response["queried"], 50)
        self.assertEqual(len(response["results"]), 50)

    def test_source_filter_matches_all_merged_sources(self):
        request = SimpleNamespace(app=SimpleNamespace(state=SimpleNamespace(feed_manager=IOCMock())))

        response = asyncio.run(list_iocs(request, q=None, type=None, confidence=None, source="Second Feed", page=1, limit=50))

        self.assertEqual(response.total, 1)


if __name__ == "__main__":
    unittest.main()