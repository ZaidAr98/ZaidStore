import mongoose from "mongoose"


interface SalesType {
saleDate:Date;
orderId:string
}
const SalesSchema = new mongoose.Schema({
    saleDate:{type:Date,required:true},
    orderId:{type:String,required:true,unique:true},
      
})

const Sales = mongoose.model<SalesType>('Product', SalesSchema);

export default Sales;
