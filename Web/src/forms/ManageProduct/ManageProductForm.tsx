import React from 'react'


export type ProductFormData = {
  name: string;
  company: string;
  description: string;
  price: number;
  laptopType: string;
  sizes: { size: string; price: number; stock: number }[];
   images: string[];
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  product?: ProductType;
  onSave: (productFormData: FormData) => void;
  isLoading: boolean;
};

const ManageProductForm = () => {





  return (
    <div>ManageProductForm</div>
  )
}

export default ManageProductForm