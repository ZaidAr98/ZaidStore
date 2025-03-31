import express from "express";
import { creatAdminSchema } from "../schemas/user.schema";
import {upload} from "../config/multerConfig"
import { validate } from "../middleware/validate";
import { adminLogin, adminLogout, refreshAdminAccessToken } from "../controllers/admin/adminController";
// import { addProduct, editProduct, listProduct, showProduct, showProducts } from "../controllers/admin/productController";
import { addProduct, editProduct, listProduct, showProduct, showProducts } from "../controllers/admin/productController";
import authenticateAdminToken from "../middleware/admin/authMiddleware";
// import productSchema from "../schemas/productSchema";
import { addCategory, editCategory, listCategory, showCategories, showCategory } from "../controllers/admin/categoryController";
import {categorySchema} from "../schemas/categorySchema";
import { productSchema } from "../schemas/productSchema";
import { approveReturnRequest, cancelOrder, declineReturnRequest, getOrders, getPendingRequests, updateStatus } from "../controllers/admin/orderController";
import { fetchBestCategories, fetchBestProducts, getOverviewStats, getRecentOrders, getRevenue } from "../controllers/admin/dashboardController";




const router = express.Router();

router.post('/',validate(creatAdminSchema),adminLogin)
router.post('/logout',adminLogout)
router.post('/refresh-token',refreshAdminAccessToken)




//products
router.post('/products',validate(productSchema),upload.array("images", 2),authenticateAdminToken,addProduct)
router.get('/products',authenticateAdminToken,showProducts)
router.patch('/products/:id',authenticateAdminToken,listProduct)
router.get('/products/:_id',authenticateAdminToken,showProduct)
router.put('/products/:_id',validate(productSchema),upload.array('images',2),authenticateAdminToken,editProduct)

//category

router.post('/categories',validate(categorySchema),authenticateAdminToken,addCategory)
router.get('/categories/offer',authenticateAdminToken,listCategory)
router.get('/categories',authenticateAdminToken,showCategories)
router.put('/categories/:catId',validate(categorySchema),authenticateAdminToken,editCategory)
router.get('/categories/:catId',authenticateAdminToken,showCategory)
router.patch('/categories/list/:categoryId',authenticateAdminToken,listCategory)




//dashboard
router.get(`/dashboard/best-products`,authenticateAdminToken,fetchBestProducts)
router.get(`/dashboard/best-categories`,authenticateAdminToken,fetchBestCategories)
router.get('/dashboard/recent-orders',authenticateAdminToken,getRecentOrders)
router.get('/dashboard/overview-stats',authenticateAdminToken,getOverviewStats)
router.get('/dashboard/revenue',authenticateAdminToken,getRevenue)


//orders
router.get('/orders',authenticateAdminToken,getOrders)
router.get('/orders/return',authenticateAdminToken,getPendingRequests)
router.patch('/orders/:orderId/cancel/:itemId',authenticateAdminToken,cancelOrder)
router.patch('/orders/:orderId/items/:itemId',authenticateAdminToken,updateStatus)
router.put('/orders/:orderId/approve/:itemId',authenticateAdminToken,approveReturnRequest)
router.put('/orders/:orderId/decline/:itemId',authenticateAdminToken,declineReturnRequest)

export default router