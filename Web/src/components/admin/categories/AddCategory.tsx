import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAxiosInstance } from '@/config/axiosConfig';

interface FormErrors {
  categoryName: string;
  categoryDescription: string;
}

const AddCategory: React.FC = () => {
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryDescription, setCategoryDescription] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({
    categoryName: '',
    categoryDescription: '',
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors: FormErrors = {
      categoryName: '',
      categoryDescription: '',
    };

    // Category Name: Required, Min length: 2, Max length: 50, No special characters
    if (categoryName.trim() === '') {
      newErrors.categoryName = 'Category Name is required';
      valid = false;
    } else if (categoryName.length < 2) {
      newErrors.categoryName = 'Category Name must be at least 2 characters long';
      valid = false;
    } else if (categoryName.length > 50) {
      newErrors.categoryName = 'Category Name must be less than 50 characters';
      valid = false;
    } else if (!/^[a-zA-Z0-9 ]+$/.test(categoryName)) {
      newErrors.categoryName = 'Category Name should not contain special characters';
      valid = false;
    }

    // Category Description: Required, Min length: 10, Max length: 200
    if (categoryDescription.trim() === '') {
      newErrors.categoryDescription = 'Category Description is required';
      valid = false;
    } else if (categoryDescription.length < 10) {
      newErrors.categoryDescription = 'Description must be at least 10 characters long';
      valid = false;
    } else if (categoryDescription.length > 500) {
      newErrors.categoryDescription = 'Description must be less than 500 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const { mutate: addCategory, isLoading } = useMutation({
    mutationFn: async () => {
      const response = await adminAxiosInstance.post('/api/admin/categories', {
        name: categoryName,
        description: categoryDescription
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the categories query to refetch the updated list
      queryClient.invalidateQueries(['categories']);
      toast.success('Category added successfully!');
      navigate('/admin/dashboard/categories');
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add category');
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (validateForm()) {
      addCategory();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Category</h1>
      <form onSubmit={handleSubmit} className="border p-4 rounded-lg shadow-md bg-white">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-2" htmlFor="categoryName">
              Category Name:
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter Category Name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                errors.categoryName ? 'border-red-500' : 'focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {errors.categoryName && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryName}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="categoryDescription">
              Category Description:
            </label>
            <textarea
              id="categoryDescription"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Enter Category Description"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                errors.categoryDescription ? 'border-red-500' : 'focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {errors.categoryDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryDescription}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-black/85 text-white px-6 py-2 rounded-lg hover:bg-slate-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;

// import { adminAxiosInstance } from '@/config/axiosConfig';
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// interface FormErrors {
//   categoryName: string;
//   categoryDescription: string;
// }

// const AddCategory: React.FC = () => {
//   const [categoryName, setCategoryName] = useState<string>('');
//   const [categoryDescription, setCategoryDescription] = useState<string>('');
//   const [errors, setErrors] = useState<FormErrors>({
//     categoryName: '',
//     categoryDescription: '',
//   });
//   const navigate = useNavigate();
//   const [error, setError] = useState<string>("");

//   const validateForm = (): boolean => {
//     let valid = true;
//     const newErrors: FormErrors = {
//       categoryName: '',
//       categoryDescription: '',
//     };

//     // Category Name: Required, Min length: 2, Max length: 50, No special characters
//     if (categoryName.trim() === '') {
//       newErrors.categoryName = 'Category Name is required';
//       valid = false;
//     } else if (categoryName.length <2) {
//       newErrors.categoryName = 'Category Name must be at least 2 characters long';
//       valid = false;
//     } else if (categoryName.length > 50) {
//       newErrors.categoryName = 'Category Name must be less than 50 characters';
//       valid = false;
//     } else if (!/^[a-zA-Z0-9 ]+$/.test(categoryName)) {
//       newErrors.categoryName = 'Category Name should not contain special characters';
//       valid = false;
//     }

//     // Category Description: Required, Min length: 10, Max length: 200
//     if (categoryDescription.trim() === '') {
//       newErrors.categoryDescription = 'Category Description is required';
//       valid = false;
//     } else if (categoryDescription.length < 10) {
//       newErrors.categoryDescription = 'Description must be at least 10 characters long';
//       valid = false;
//     } else if (categoryDescription.length > 500) {
//       newErrors.categoryDescription = 'Description must be less than 500 characters';
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();

//     if (validateForm()) {
//       try {
//         const response = await adminAxiosInstance.post('/api/admin/categories', {
//           name: categoryName,
//           description: categoryDescription
//         });
//         navigate('/admin/dashboard/categories');
//         console.log('Category Name:', categoryName);
//         console.log('Category Description:', categoryDescription);

//         setCategoryName('');
//         setCategoryDescription('');
//         setErrors({ categoryName: '', categoryDescription: '' });
//         setError("");
//       } catch (error:any) {
//         console.log("form submission failed", error.message);
//         setError("Category adding failed.");
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Add Category</h1>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       <form onSubmit={handleSubmit} className="border p-4 rounded-lg shadow-md bg-white">
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block font-medium mb-2" htmlFor="categoryName">
//               Category Name:
//             </label>
//             <input
//               type="text"
//               id="categoryName"
//               value={categoryName}
//               onChange={(e) => setCategoryName(e.target.value)}
//               placeholder="Enter Category Name"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
//                 errors.categoryName ? 'border-red-500' : 'focus:border-blue-500'
//               }`}
//             />
//             {errors.categoryName && (
//               <p className="text-red-500 text-sm mt-1">{errors.categoryName}</p>
//             )}
//           </div>

//           <div>
//             <label className="block font-medium mb-2" htmlFor="categoryDescription">
//               Category Description:
//             </label>
//             <textarea
//               id="categoryDescription"
//               value={categoryDescription}
//               onChange={(e) => setCategoryDescription(e.target.value)}
//               placeholder="Enter Category Description"
//               className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
//                 errors.categoryDescription ? 'border-red-500' : 'focus:border-blue-500'
//               }`}
//             />
//             {errors.categoryDescription && (
//               <p className="text-red-500 text-sm mt-1">{errors.categoryDescription}</p>
//             )}
//           </div>
//         </div>
//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="bg-black/85 text-white px-6 py-2 rounded-lg hover:bg-slate-600"
//           >
//             Add Category
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddCategory;