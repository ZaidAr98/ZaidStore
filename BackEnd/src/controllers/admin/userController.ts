import { Request,Response } from "express";
import User from "../../model/userModel";



interface IQueryParams {
    page?: string;
    limit?: string;
    term?: string;
}

interface IUserQuery {
    $or?: Array<{
        [key: string]: {
            $regex: string;
            $options: string;
        };
    }>;
}


export const getCustomerDetails = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, term } = req.query as IQueryParams;

    try {
        // Validate and convert query parameters
        const pageNumber = parseInt(page || '1', 10);
        const limitNumber = parseInt(limit || '10', 10);
        
        if (isNaN(pageNumber)) {
            res.status(400).json({ success: false, message: "Invalid page number" });
            return;
        }

        if (isNaN(limitNumber)) {
            res.status(400).json({ success: false, message: "Invalid limit value" });
            return;
        }

        const skip = limitNumber * (pageNumber - 1);
        const query: IUserQuery = {};

        // Add search term if provided
        if (term) {
            query.$or = [
                { name: { $regex: term, $options: 'i' } },
                { email: { $regex: term, $options: 'i' } }
            ];
        }

        // Fetch users with pagination
        const users = await User.find(query).skip(skip).limit(limitNumber);
        
        if (!users || users.length === 0) {
            res.status(404).json({ success: false, message: "No users found" });
            return;
        }

        // Get total count for pagination
        const totalUsers = await User.countDocuments(query);
        
        res.status(200).json({ 
            success: true, 
            message: "Customer details fetched",
            users,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalUsers / limitNumber),
            totalUsers
        });
    } catch (error: unknown) {
        console.log("Error fetching customer details", error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ 
            success: false, 
            message: "Error fetching customer details",
            error: errorMessage 
        });
    }
};


export const editCustomerStatus = async(req:Request,res:Response):Promise<void>=>{
    const { userId } = req.params;
    try {
        const user = await User.findById(userId)
    
        if (!user) {
          console.log(user);
          
            res
            .status(404)
            .json({ success: false, message: "User not found" });
            return
        }
        user.isBlocked=!user.isBlocked;
        await user.save()
        res.status(200).json({success:true, message:"Customer status updated",user})
      } catch (error:any) {
        console.log("Customer status update failed",error.message);
        res.status(500).json({success:false,message:"An error occurred while updating status"})
      }
}