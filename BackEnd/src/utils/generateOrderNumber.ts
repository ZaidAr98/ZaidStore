

export const  generateOrderNumber = async()=>{
    try {
        const datePart=new Date().toISOString().slice(0,10).replace(/-/g,"");

    const sequencePart = Math.floor(1000 + Math.random() * 9000).toString();
        
        return `ZAID${datePart}${sequencePart}`
    } catch (error) {
        console.log("error generating orderid",error);
        
    }

}   