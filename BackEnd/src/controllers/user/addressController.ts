import Address from "../../model/addressModel";
import User from "../../model/userModel";
import { Response,Request } from "express";
export const addAddress = async(req:Request,res:Response):Promise<void>=>{
    const { user } = req.body;
   try {
    const userExist = await User.findById(user);
    if (!userExist) {
         res
        .status(404)
        .json({ success: false, message: "User not found" });
        return
    }

    const newAddress = await Address.create(req.body);
    const address = {
        _id:newAddress._id,
        user:newAddress.user,
        fullname: newAddress.fullname,
        phone: newAddress.phone,
        email: newAddress.email,
        addressLine: newAddress.addressLine,
        city: newAddress.city,
        state: newAddress.state,
        landmark: newAddress.landmark,
        pincode: newAddress.pincode,
        addressType: newAddress.addressType,
        isDefault: newAddress.isDefault,
      };

      res
      .status(200)
      .json({ success: true, message: "Address added", address });
       return
    } catch (error:any) {
        console.log("Address not added", error);
        res
          .status(500)
          .json({ success: false, message: "Address not added", error });
   }


}

export const showAddress = async(req:Request,res:Response):Promise<void>=>{
    const { userId } = req.params;
    try {
        const addresses = await Address.find({ user: userId ,isListed:true}).select("-createdAt -updatedAt -__v")
    
        if (!addresses) {
           res
            .status(404)
            .json({ success: false, message: "Addresses not found" });
            return
        }

        res
          .status(200)
          .json({
            success: true,
            message: "Addresses for user fetched",
            addresses,
          });
      } catch (error) {
        console.log("fetching addresses failed");
        res
          .status(500)
          .json({ success: false, message: "Internal server error", error });
      }

}

export const editAddress = async(req:Request,res:Response)=>{
    const {addressId} = req.params

    try {
        const data = req.body;
        const updatedAddress = await Address.findByIdAndUpdate(addressId, data, {
          new: true,
        }).select("-createdAt -updatedAt -__v")
        console.log("address updated",updatedAddress);

          res
          .status(200)
          .json({ success: true, message: "Address updated", updatedAddress }); 
    } catch (error) {
        console.log("error editing address", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error", error });
      
    }
}



export const deleteAddress =async(req:Request,res:Response)=>{
    const {userId, addressId}=req.params
    try {
      const address=await Address.findOneAndUpdate({_id:addressId , user:userId},{isListed:false}).select("-createdAt -updatedAt -__v")
      
  
      if(!address){
        return res.status(404).json({success:false ,message:"Address not found"})
      }
      res.status(200).json({success:true, message:"Address deleted successfully"})
    } catch (error) {
      console.log("Error deleteing address",error);
      res.status(500).json({success:false ,message:"Internal server error",error})
    }
  }