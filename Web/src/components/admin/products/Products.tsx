// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Toaster, toast } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Edit, List, Grid, Filter, Search } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { adminAxiosInstance } from "@/config/axiosConfig";

// interface Category {
//   _id: string;
//   name: string;
//   description: string;
//   isListed: boolean;
// }


// interface ApiResponse {
//   success: boolean;
//   message: string;
//   products: Product[];
//   categories?: Category[]; 
// }


// interface Product {
//   _id: string;
//   name: string;
//   description: string;
//   company: string;
//   categoryId: {
//     _id: string;
//     name: string;
//   };
//   laptopType: string;
//   price: number;
//   totalStock: number;
//   images: string[];
//   sizes: Size[];
// }

// interface Size {
//   size: string;
//   stock: string;
//   price: string;
// }

// const laptopTypes = ["Laptop", "PC"] as const;
// type LaptopType = typeof laptopTypes[number];

// type SortOption = "recommended" | "priceHighLow" | "priceLowHigh";
// type ViewMode = "list" | "grid";

// const Products: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [sortOption, setSortOption] = useState<SortOption>("recommended");
//   const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
//   const [laptopTypeFilters, setLaptopTypeFilters] = useState<LaptopType[]>([]);
//   const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
//   const [viewMode, setViewMode] = useState<ViewMode>("list");
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [list, setList] = useState<boolean>(false);
//   const navigate = useNavigate();


//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const queryParams = new URLSearchParams();

//         if (categoryFilters.length > 0) {
//           queryParams.append("categoryIds", categoryFilters.join(","));
//         }
//         if (laptopTypeFilters.length > 0) {
//           queryParams.append("laptopType", laptopTypeFilters.join(","));
//         }
//         if (priceRange[0] > 0 || priceRange[1] < 500) {
//           queryParams.append("minPrice", priceRange[0].toString());
//           queryParams.append("maxPrice", priceRange[1].toString());
//         }
//         if (searchTerm) {
//           queryParams.append("searchTerm", searchTerm);
//         }
//         if (sortOption !== "recommended") {
//           queryParams.append("sort", sortOption);
//         }

//         const response = await adminAxiosInstance.get<ApiResponse>(
//           `api/admin/products?${queryParams.toString()}`
//         );
        
//         if (!response.data) {
//           toast.error("Products not found!");
//           return;
//         }
//         if (!response.data.success || !response.data.products) {
//           toast.error(response.data.message || "Products not found!");
//           return;
//         }
//         setProducts(response.data.products);
//       } catch (error: unknown) {
//         if (error instanceof Error) {
//           toast.error("Failed to fetch products");
//           console.error("Products fetch error:", error.message);
//         }
//       }
//     }
//     fetchData();
//   }, [list, categoryFilters, priceRange, searchTerm, sortOption, laptopTypeFilters]);

//   useEffect(() => {
//     async function fetchCategory() {
//       try {
//         const response = await adminAxiosInstance.get<{ categories: Category[] }>(
//           "api/admin/categories"
//         );
        
//         if (!response.data) {
//           console.log("Categories not found");
//           return;
//         }
//         setCategories(response.data.categories.filter(category => category.isListed));
//       } catch (error: unknown) {
//         if (error instanceof Error) {
//           console.error("Categories fetch error:", error.message);
//         }
//       }
//     }
//     fetchCategory();
//   }, []);

//   const handleCategoryChange = (categoryId: string) => {
//     setCategoryFilters(prev =>
//       prev.includes(categoryId)
//         ? prev.filter(c => c !== categoryId)
//         : [...prev, categoryId]
//     );
//   };

//   const handleLaptopTypeChange = (type: LaptopType) => {
//     setLaptopTypeFilters(prev =>
//       prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
//     );
//   };

//   const handleAddProduct = () => {
//     navigate('/admin/dashboard/products/add');
//   };

//   const FilterSidebar = () => (
//     <div className="bg-white p-4 rounded-lg shadow-lg">
//       <h2 className="font-bold text-lg mb-4">Filters</h2>

//       <div className="mb-4">
//         <h3 className="font-semibold mb-2">Category</h3>
//         {categories.map(category => (
//           <div key={category._id} className="flex items-center mb-2">
//             <Checkbox
//               id={`category-${category.name}`}
//               checked={categoryFilters.includes(category._id)}
//               onCheckedChange={() => handleCategoryChange(category._id)}
//             />
//             <label htmlFor={`category-${category.name}`} className="ml-2 text-sm">
//               {category.name}
//             </label>
//           </div>
//         ))}
//       </div>

//       <div className="mb-4">
//         <h3 className="font-semibold mb-2">Laptop Type</h3>
//         {laptopTypes.map(type => (
//           <div key={type} className="flex items-center mb-2">
//             <Checkbox
//               id={`laptopType-${type}`}
//               checked={laptopTypeFilters.includes(type)}
//               onCheckedChange={() => handleLaptopTypeChange(type)}
//             />
//             <label htmlFor={`laptopType-${type}`} className="ml-2 text-sm">
//               {type}
//             </label>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
//       <Toaster />
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row gap-6">
//           <div className="hidden md:block w-64">
//             <FilterSidebar />
//           </div>

//           <div className="flex-1">
//             <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//               <div className="p-4 border-b border-gray-200 space-y-4">
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                   <h1 className="text-2xl font-bold">Product List</h1>
//                   <div className="flex flex-wrap gap-4 items-center">
//                     <Button onClick={handleAddProduct} className="sm:p-2">
//                       Add Product
//                     </Button>
//                     <div className="flex space-x-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setViewMode("list")}
//                       >
//                         <List className="w-4 h-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setViewMode("grid")}
//                       >
//                         <Grid className="w-4 h-4" />
//                       </Button>
//                     </div>
//                     <Select
//                       value={sortOption}
//                       onValueChange={(value: SortOption) => setSortOption(value)}
//                     >
//                       <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Sort by" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="recommended">Recommended</SelectItem>
//                         <SelectItem value="priceHighLow">Price: High to Low</SelectItem>
//                         <SelectItem value="priceLowHigh">Price: Low to High</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="flex gap-4 items-center">
//                   <div className="relative flex-grow">
//                     <Input
//                       type="text"
//                       placeholder="Search products..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10"
//                     />
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   </div>
//                   <div className="md:hidden">
//                     <Sheet>
//                       <SheetTrigger asChild>
//                         <Button variant="outline">
//                           <Filter className="w-4 h-4 mr-2" /> Filters
//                         </Button>
//                       </SheetTrigger>
//                       <SheetContent side="left">
//                         <SheetHeader>
//                           <SheetTitle>Filters</SheetTitle>
//                           <SheetDescription>
//                             Apply filters to refine your product search.
//                           </SheetDescription>
//                         </SheetHeader>
//                         <div className="mt-4">
//                           <FilterSidebar />
//                         </div>
//                       </SheetContent>
//                     </Sheet>
//                   </div>
//                 </div>
//               </div>

//               {viewMode === "grid" ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
//                   {products.map((product,index) => (
//                     <div
//                       key={product._id}
//                       className="border rounded-lg p-4 bg-white shadow-md relative"
//                     >
//                       {product.images.length > 0 && (
//                         <img
//                           src={product.images[0]}
//                           alt={product.name}
//                           className="w-full h-40 object-cover rounded-md mb-4"
//                         />
//                       )}
//                       <h2 className="text-lg font-bold mb-2">{product.name}</h2>
//                       <p className="text-sm mb-2">
//                         Category: {product.categoryId?.name || 'N/A'}
//                       </p>
//                       <p className="text-sm mb-2">
//                         Type: {product.laptopType}
//                       </p>
//                       <p className="text-lg font-semibold">₹{product.price}</p>

//                       <div className="absolute top-2 right-2 flex flex-col space-y-2">
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Button 
//                                 size="icon" 
//                                 variant="ghost" 
//                                 onClick={() => navigate('/admin/dashboard/products/edit', {
//                                   state: { productId: product._id }
//                                 })}
//                               >
//                                 <Edit className="w-4 h-4" />
//                               </Button>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               <p>Edit product</p>
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Image</TableHead>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Category</TableHead>
//                         <TableHead>Price</TableHead>
//                         <TableHead>Stock</TableHead>
//                         <TableHead>Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {products.map((product,index) => (
//                         <TableRow key={product._id}>
//                           <TableCell>
//                             {product.images.length > 0 && (
//                               <img
//                                 src={product.images[0]}
//                                 alt={product.name}
//                                 className="w-10 h-10 object-cover rounded-md"
//                               />
//                             )}
//                           </TableCell>
                          
//                           <TableCell>{index+1}</TableCell>
//                           <TableCell>{product.name}</TableCell>
//                           <TableCell>{product.categoryId?.name || 'N/A'}</TableCell>
//                           <TableCell>₹{product.price}</TableCell>
//                           <TableCell>{product.totalStock}</TableCell>
//                           <TableCell>
//                             <div className="flex space-x-2">
//                               <TooltipProvider>
//                                 <Tooltip>
//                                   <TooltipTrigger asChild>
//                                     <Button 
//                                       size="icon" 
//                                       variant="ghost" 
//                                       onClick={() => navigate('/admin/dashboard/products/edit', {
//                                         state: { productId: product._id }
//                                       })}
//                                     >
//                                       <Edit className="w-4 h-4" />
//                                     </Button>
//                                   </TooltipTrigger>
//                                   <TooltipContent>
//                                     <p>Edit product</p>
//                                   </TooltipContent>
//                                 </Tooltip>
//                               </TooltipProvider>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Products;






import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, List, Grid, Filter, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { adminAxiosInstance } from "@/config/axiosConfig";
import { useQuery } from "@tanstack/react-query";

interface Category {
  _id: string;
  name: string;
  description: string;
  isListed: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  products: Product[];
  categories?: Category[]; 
}

interface Product {
  _id: string;
  name: string;
  description: string;
  company: string;
  categoryId: {
    _id: string;
    name: string;
  };
  laptopType: string;
  price: number;
  totalStock: number;
  images: string[];
  sizes: Size[];
}

interface Size {
  size: string;
  stock: string;
  price: string;
}

const laptopTypes = ["Laptop", "PC"] as const;
type LaptopType = typeof laptopTypes[number];

type SortOption = "recommended" | "priceHighLow" | "priceLowHigh";
type ViewMode = "list" | "grid";

const fetchProducts = async (queryParams: URLSearchParams) => {
  const response = await adminAxiosInstance.get<ApiResponse>(
    `api/admin/products?${queryParams.toString()}`
  );
  if (!response.data.success || !response.data.products) {
    throw new Error(response.data.message || "Products not found!");
  }
  return response.data.products;
};

const fetchCategories = async () => {
  const response = await adminAxiosInstance.get<{ categories: Category[] }>(
    "api/admin/categories"
  );
  if (!response.data) {
    throw new Error("Categories not found");
  }
  return response.data.categories.filter(category => category.isListed);
};

const Products: React.FC = () => {
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [laptopTypeFilters, setLaptopTypeFilters] = useState<LaptopType[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  // Build query params for products
  const queryParams = new URLSearchParams();
  if (categoryFilters.length > 0) {
    queryParams.append("categoryIds", categoryFilters.join(","));
  }
  if (laptopTypeFilters.length > 0) {
    queryParams.append("laptopType", laptopTypeFilters.join(","));
  }
  if (priceRange[0] > 0 || priceRange[1] < 500) {
    queryParams.append("minPrice", priceRange[0].toString());
    queryParams.append("maxPrice", priceRange[1].toString());
  }
  if (searchTerm) {
    queryParams.append("searchTerm", searchTerm);
  }
  if (sortOption !== "recommended") {
    queryParams.append("sort", sortOption);
  }

  // React Query for data fetching
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", queryParams.toString()],
    queryFn: () => fetchProducts(queryParams),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to fetch products");
    },
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    onError: (error: Error) => {
      console.error("Categories fetch error:", error.message);
    },
  });

  const handleCategoryChange = (categoryId: string) => {
    setCategoryFilters(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleLaptopTypeChange = (type: LaptopType) => {
    setLaptopTypeFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAddProduct = () => {
    navigate('/admin/dashboard/products/add');
  };

  const FilterSidebar = () => (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="font-bold text-lg mb-4">Filters</h2>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Category</h3>
        {categories?.map(category => (
          <div key={category._id} className="flex items-center mb-2">
            <Checkbox
              id={`category-${category.name}`}
              checked={categoryFilters.includes(category._id)}
              onCheckedChange={() => handleCategoryChange(category._id)}
            />
            <label htmlFor={`category-${category.name}`} className="ml-2 text-sm">
              {category.name}
            </label>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Laptop Type</h3>
        {laptopTypes.map(type => (
          <div key={type} className="flex items-center mb-2">
            <Checkbox
              id={`laptopType-${type}`}
              checked={laptopTypeFilters.includes(type)}
              onCheckedChange={() => handleLaptopTypeChange(type)}
            />
            <label htmlFor={`laptopType-${type}`} className="ml-2 text-sm">
              {type}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  if (categoriesLoading) {
    return <div className="min-h-screen bg-gray-100 p-8">Loading categories...</div>;
  }

  if (productsLoading) {
    return <div className="min-h-screen bg-gray-100 p-8">Loading products...</div>;
  }

  if (categoriesError || productsError) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-red-500">Error loading data</h2>
          <Button onClick={() => {
            if (categoriesError) fetchCategories();
            if (productsError) refetchProducts();
          }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:block w-64">
            <FilterSidebar />
          </div>

          <div className="flex-1">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h1 className="text-2xl font-bold">Product List</h1>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button onClick={handleAddProduct} className="sm:p-2">
                      Add Product
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                    </div>
                    <Select
                      value={sortOption}
                      onValueChange={(value: SortOption) => setSortOption(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recommended">Recommended</SelectItem>
                        <SelectItem value="priceHighLow">Price: High to Low</SelectItem>
                        <SelectItem value="priceLowHigh">Price: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-grow">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="md:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">
                          <Filter className="w-4 h-4 mr-2" /> Filters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                          <SheetDescription>
                            Apply filters to refine your product search.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4">
                          <FilterSidebar />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {products?.map((product, index) => (
                    <div
                      key={product._id}
                      className="border rounded-lg p-4 bg-white shadow-md relative"
                    >
                      {product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-md mb-4"
                        />
                      )}
                      <h2 className="text-lg font-bold mb-2">{product.name}</h2>
                      <p className="text-sm mb-2">
                        Category: {product.categoryId?.name || 'N/A'}
                      </p>
                      <p className="text-sm mb-2">
                        Type: {product.laptopType}
                      </p>
                      <p className="text-lg font-semibold">₹{product.price}</p>

                      <div className="absolute top-2 right-2 flex flex-col space-y-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => navigate('/admin/dashboard/products/edit', {
                                  state: { productId: product._id }
                                })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit product</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((product, index) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            {product.images.length > 0 && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            )}
                          </TableCell>
                          
                          <TableCell>{index+1}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.categoryId?.name || 'N/A'}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>{product.totalStock}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={() => navigate('/admin/dashboard/products/edit', {
                                        state: { productId: product._id }
                                      })}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit product</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;