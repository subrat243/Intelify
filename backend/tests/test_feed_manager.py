import unittest

from models.schemas import Confidence, IOC, IOCType
from services.feed_manager import FeedManager


class FeedManagerTests(unittest.TestCase):
    def setUp(self):
        self.manager = FeedManager()

    def test_duplicate_ioc_is_retained_once_and_sources_are_merged(self):
        first = IOC(id="feodo-1", type=IOCType.IP, value="1.2.3.4", source="Feodo Tracker", sources=["Feodo Tracker"])
        second = IOC(id="threatfox-1", type=IOCType.IP, value=" 1.2.3.4 ", source="ThreatFox", sources=["ThreatFox"], confidence=Confidence.HIGH)

        self.manager._merge_iocs([first])
        self.manager._merge_iocs([second])

        results = self.manager.get_all_iocs()
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].sources, ["Feodo Tracker", "ThreatFox"])

    def test_old_feed_records_are_retained_after_a_new_snapshot(self):
        old = IOC(id="feed-1", type=IOCType.DOMAIN, value="old.example", source="Feed", sources=["Feed"])
        new = IOC(id="feed-2", type=IOCType.DOMAIN, value="new.example", source="Feed", sources=["Feed"])

        self.manager._merge_iocs([old])
        self.manager._merge_iocs([new])

        self.assertEqual({ioc.value for ioc in self.manager.get_all_iocs()}, {"old.example", "new.example"})

    def test_feodo_parser_handles_quoted_commas(self):
        text = '# comment\n"2026-01-01","1.2.3.4","443","family,with,comma"\n'

        parsed = self.manager._parse_feodo(text, "feodo")

        self.assertEqual(parsed[0].malware, "family,with,comma")


if __name__ == "__main__":
    unittest.main()