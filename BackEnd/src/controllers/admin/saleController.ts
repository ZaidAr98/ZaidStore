import Order from "../../model/orderModel";
import { Response, Request } from "express";

interface SalesDataItem {
  customer: string;
  date: Date;
  product: string;
  quantity: number;
  unitPrice: number;
  couponDiscount: number;
  otherDiscount: number;
  finalPrice: number;
}

interface OverallSalesData {
  totalSales?: number;
  totalOrders?: number;
  totalDiscount?: number;
}

export const fetchSalesData = async (req: Request, res: Response): Promise<void> => {
  const { filterType, startDate, endDate, currentPage , ordersPerPage } = req.query;
  
  // Convert query params to numbers with defaults
  const page = parseInt(currentPage as string, 10) || 1;
  const limit = parseInt(ordersPerPage as string, 10) || 10;
  
  // Validate page number
  if (page < 1) {
    res.status(400).json({ error: "Invalid page number" });
    return;
  }

  let start: Date, end: Date;
  const now = new Date();

  try {
    // Date range calculation
    switch (filterType) {
      case "daily":
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "weekly":
        const weekStart = now.getDate() - now.getDay();
        start = new Date(now.setDate(weekStart));
        start.setHours(0, 0, 0, 0);
        end = new Date(now.setDate(weekStart + 6));
        end.setHours(23, 59, 59, 999);
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "yearly":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case "custom":
        if (!startDate || !endDate) {
          res.status(400).json({ error: "Both startDate and endDate are required for custom filter" });
          return;
        }
        start = new Date(startDate as string);
        end = new Date(endDate as string);
        break;
      default:
        res.status(400).json({ error: "Invalid filter type" });
        return;
    }

    // Validate date range
    if (start > end) {
      res.status(400).json({ error: "Start date must be before end date" });
      return;
    }

    // Parallel execution of both queries for better performance
    const [salesData, overallSalesDataArray] = await Promise.all([
      // Paginated sales data query
      Order.aggregate<SalesDataItem>([
        {
          $match: {
            orderDate: { $gte: start, $lte: end },
            "items.status": "Delivered"
          }
        },
        { $unwind: "$items" },
        { $match: { "items.status": "Delivered" } },
        {
          $project: {
            customer: "$customerName",
            date: "$orderDate",
            product: "$items.name",
            quantity: "$items.quantity",
            unitPrice: "$items.price",
            couponDiscount: {
              $cond: {
                if: { $gt: [{ $size: "$items" }, 0] },
                then: { $divide: ["$couponDiscount", { $size: "$items" }] },
                else: 0
              }
            },
            otherDiscount: {
              $divide: [
                { $multiply: ["$items.discount", "$items.price", "$items.quantity"] },
                100
              ]
            },
            finalPrice: {
              $subtract: [
                { $multiply: ["$items.price", "$items.quantity"] },
                {
                  $add: [
                    "$couponDiscount",
                    { $divide: ["$items.discount", 100] }
                  ]
                }
              ]
            }
          }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]),
      
      // Overall sales summary query
      Order.aggregate<OverallSalesData>([
        {
          $match: {
            orderDate: { $gte: start, $lte: end },
            "items.status": "Delivered"
          }
        },
        { $unwind: "$items" },
        { $match: { "items.status": "Delivered" } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            totalDiscount: { $sum: { $add: ["$totalDiscount", "$couponDiscount"] } }
          }
        }
      ])
    ]);

    const overallSalesData: OverallSalesData = overallSalesDataArray[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalDiscount: 0
    };

    res.status(200).json({
      success: true,
      message: "Sales data fetched successfully",
      data: {
        salesData,
        overallSalesData,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: overallSalesData.totalOrders || 0,
          totalPages: Math.ceil((overallSalesData.totalOrders || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch sales data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};