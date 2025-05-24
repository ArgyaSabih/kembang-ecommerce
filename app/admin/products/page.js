"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/utils/formatCurrency";

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
    categoryIds: [],
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
          throw new Error(
            `Failed to fetch categories: ${categoriesRes.status}`
          );
        }
        const categoriesData = await categoriesRes.json();

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle category change
  const handleCategoryChange = (categoryId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        categoryIds: [...formData.categoryIds, categoryId],
      });
    } else {
      setFormData({
        ...formData,
        categoryIds: formData.categoryIds.filter((id) => id !== categoryId),
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
      categoryIds: [],
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
      categoryIds: product.categories.map((cat) => cat.id),
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
            Accept: "application/json",
          },
        });

        const data = await res.json().catch((e) => {
          console.error("Error parsing JSON response:", e);
          return null;
        });

        console.log("Delete response:", { status: res.status, data });

        if (!res.ok) {
          throw new Error(
            data?.error || `Failed to delete product (${res.status})`
          );
        }

        if (data?.success) {
          setProducts(products.filter((product) => product.id !== productId));
          alert("Product deleted successfully");
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(
          error instanceof Error ? error.message : "Failed to delete product"
        );
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
        categories: formData.categoryIds,
      };

      console.log("Sending payload:", payload);

      const url = currentProduct
        ? `/api/admin/products/${currentProduct.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: currentProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (currentProduct) {
          setProducts(
            products.map((p) => (p.id === currentProduct.id ? data : p))
          );
        } else {
          setProducts([...products, data]);
        }
        setIsModalOpen(false);
      } else {
        console.error("Server error:", data);
        let errorMessage = `Failed to ${
          currentProduct ? "update" : "create"
        } product`;

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
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your products</p>
        </div>
        <button
          onClick={handleNewProduct}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="size-5 mr-1" />
          New Product
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : error ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No products found. Click "New Product" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#E6E6E6]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.categories.map((cat) => cat.name).join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {currentProduct ? "Edit Product" : "New Product"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price
                  </label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Stock
                  </label>
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
                  <label className="block text-sm font-semibold mb-3">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-4 mt-1">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex text-sm items-center space-x-1 text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={(e) =>
                            handleCategoryChange(category.id, e.target.checked)
                          }
                          className="accent-pink-500"
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-3">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
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
