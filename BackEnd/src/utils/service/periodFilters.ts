export const getPeriodFilter = (period:string)=>{
    const now = new Date()
    switch(period){
        case "monthly":
            return {
                createdAt: {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                  },
            };

      case "yearly":
        default:
            return{
                createdAt:{
                    $gte: new Date(now.getFullYear(), 0, 1),
                    $lt: new Date(now.getFullYear() + 1, 0, 1),
                }
            }
    }
}