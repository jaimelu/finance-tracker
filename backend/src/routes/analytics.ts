import { Router } from "express";
import { 
    getSpendingByCategory, 
    getSummaryStats, 
    getIncomeByCategory, 
    getMonthlyTrends, 
    getMonthComparison
 } from "../controllers/analyticsController";

const router = Router();

router.get('/summary', getSummaryStats);
router.get('/spending-by-category', getSpendingByCategory);
router.get('/income-by-category', getIncomeByCategory);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/monthly-comparison', getMonthComparison)

export default router;