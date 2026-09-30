import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import calculations as c


class T(unittest.TestCase):
    def test_savings(self):
        r = c.savings({"income": 50000, "expenses": 30000, "goal_price": 100000,
                       "target_period": 6, "target_unit": "months"})
        self.assertEqual(r["available"], 20000)
        self.assertEqual(r["months"], 5)
        self.assertEqual(r["comparison"], "sufficient")

    def test_savings_negative(self):
        with self.assertRaises(ValueError):
            c.savings({"income": 1000, "expenses": 2000, "goal_price": 5})

    def test_emi(self):
        r = c.emi({"principal": 100000, "rate": 10, "tenure": 1})
        self.assertAlmostEqual(r["emi"], 8791.59, places=2)
        self.assertAlmostEqual(r["schedule"][-1], 0, places=4)

    def test_emi_zero_rate(self):
        r = c.emi({"principal": 12000, "rate": 0, "tenure": 12, "tenure_unit": "months", "paid": 3})
        self.assertEqual(r["emi"], 1000)
        self.assertAlmostEqual(r["remaining_balance"], 9000)

    def test_gst(self):
        self.assertAlmostEqual(c.gst({"price": 1000, "gst_rate": 18})["total"], 1180)
        self.assertAlmostEqual(c.gst({"price": 1180, "gst_rate": 18, "mode": "inclusive"})["base"], 1000)

    def test_percentage(self):
        self.assertEqual(c.percentage({"total": 200, "percentage": 15})["value"], 30)


if __name__ == "__main__":
    unittest.main()
