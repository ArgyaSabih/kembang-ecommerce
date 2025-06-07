"use client";

import AdminLayout from "@/components/AdminLayout";
import {useState, useEffect} from "react";
import {PlusIcon} from "@heroicons/react/24/outline";
import {formatPrice} from "@/utils/formatCurrency";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    categoryIds: []
  });

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // fetch products
        const productsRes = await fetch("/api/admin/products");
        if (!productsRes.ok) {
          throw new Error(`Failed to fetch products: ${productsRes.status}`);
        }
        const productsData = await productsRes.json();

        // fetch categories
        const categoriesRes = await fetch("/api/admin/categories");
        if (!categoriesRes.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
        }
        const categoriesData = await categoriesRes.json();

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle category change
  const handleCategoryChange = (categoryId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        categoryIds: [...formData.categoryIds, categoryId]
      });
    } else {
      setFormData({
        ...formData,
        categoryIds: formData.categoryIds.filter((id) => id !== categoryId)
      });
    }
  };

  // Handle new product
  const handleNewProduct = () => {
    setCurrentProduct(null);
    setFormData({
      name: "",
      price: "",
      stock: "",
      description: "",
      categoryIds: []
    });
    setIsModalOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || "",
      categoryIds: product.categories.map((cat) => cat.id)
    });
    setIsModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        console.log("Attempting to delete product:", productId);

        const res = await fetch(`/api/admin/products/${productId}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json"
          }
        });

        const data = await res.json().catch((e) => {
          console.error("Error parsing JSON response:", e);
          return null;
        });

        console.log("Delete response:", {status: res.status, data});

        if (!res.ok) {
          throw new Error(data?.error || `Failed to delete product (${res.status})`);
        }

        if (data?.success) {
          setProducts(products.filter((product) => product.id !== productId));
          alert("Product deleted successfully");
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(error instanceof Error ? error.message : "Failed to delete product");
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // validasi form data
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);

      if (isNaN(price) || isNaN(stock)) {
        alert("Please enter valid numbers for price and stock");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        price,
        stock,
        description: formData.description.trim(),
        categories: formData.categoryIds
      };

      console.log("Sending payload:", payload);

      const url = currentProduct ? `/api/admin/products/${currentProduct.id}` : "/api/admin/products";

      const res = await fetch(url, {
        method: currentProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        if (currentProduct) {
          setProducts(products.map((p) => (p.id === currentProduct.id ? data : p)));
        } else {
          setProducts([...products, data]);
        }
        setIsModalOpen(false);
      } else {
        console.error("Server error:", data);
        let errorMessage = `Failed to ${currentProduct ? "update" : "create"} product`;

        // Handle specific error codes
        if (data.code === "P2002") {
          errorMessage = "A product with this name already exists";
        } else if (data.error) {
          errorMessage = data.error;
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`Failed to ${currentProduct ? "update" : "create"} product`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your products</p>
        </div>
        <button
          onClick={handleNewProduct}
          className="flex items-center px-4 py-2 text-white bg-pink-500 rounded-md hover:bg-pink-600"
        >
          <PlusIcon className="mr-1 size-5" />
          New Product
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-white rounded-lg shadow-sm">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-pink-500 rounded-md hover:bg-pink-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow-sm">
          {products.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No products found. Click &quot;New Product&quot; to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#E6E6E6]">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Stock Status
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Total Sold
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-right text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{product.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{product.stock}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.stockStatus === "Out of Stock"
                              ? "bg-red-100 text-red-800"
                              : product.stockStatus === "Low Stock"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.stockStatus || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {product.totalSold || 0} units
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {formatPrice(product.totalRevenue || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {product.categories.map((cat) => cat.name).join(", ")}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 whitespace-nowrap">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="mr-4 text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* //Pop up modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-semibold">{currentProduct ? "Edit Product" : "New Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-3 text-sm font-semibold">Categories</label>
                  <div className="flex flex-wrap gap-4 mt-1">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-1 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                          className="accent-pink-500"
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block mb-3 text-sm font-semibold">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-pink-500 rounded-md hover:bg-pink-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
