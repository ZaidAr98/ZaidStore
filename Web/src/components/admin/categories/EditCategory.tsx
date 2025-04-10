import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { adminAxiosInstance } from "@/config/axiosConfig";
import { Toaster, toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface CategoryData {
  name?: string;
  description?: string;
  [key: string]: any; // For any additional properties that might exist
}

interface LocationState {
  catId: string;
}

const EditCategory: React.FC = () => {
  const [categoryData, setCategoryData] = useState<CategoryData>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { catId } = location.state;


  useEffect(() => {
    async function getCategory() {
      try {
        const response = await adminAxiosInstance.get(
          `/api/admin/categories/${catId}`
        );
        if (response?.data?.category) {
          setCategoryData(response.data.category);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log("error in fetching category data", error.message);
        } else {
          console.log("An unknown error occurred");
        }
      }
    }
    getCategory();
  }, [catId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
    console.log("categoryData", categoryData);
  }

  const handleUpdate = async () => {
    try {
      const updatedCategory = await adminAxiosInstance.put(
        `/api/admin/categories/${catId}`,
        categoryData
      );

      console.log("Category Updated:", updatedCategory?.data?.updatedData);
      toast.success("Category Updated");
      setTimeout(() => {
        navigate("/admin/dashboard/categories");
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("error in editing category", error.message);
        toast.error("Failed to update category");
      } else {
        console.log("An unknown error occurred");
        toast.error("An unknown error occurred");
      }
    }
  };

  return (
    <div className="p-6">
     <Toaster />
      <nav className="mb-6 text-sm text-gray-600">
        <span
          className="cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => navigate("/admin/dashboard")}
        >
          Home
        </span>{" "}
        /{" "}
        <span
          className="cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => navigate("/admin/dashboard/categories")}
        >
          Category
        </span>{" "}
        / Edit Category
      </nav>

      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Edit Category
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Category Name:
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter Category Name"
            value={categoryData.name || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Category Description:
          </label>
          <textarea
            placeholder="Enter Category Description"
            name="description"
            value={categoryData.description || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 h-32 resize-none"
          ></textarea>
        </div>
        <Button onClick={handleUpdate}>Update Category</Button>
      </div>

    </div>
  );
};

export default EditCategory;