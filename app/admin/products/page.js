"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    categoryIds: [],
  });

  // Mock categories
  const categories = [
    { id: 1, name: "Bouquet" },
    { id: 2, name: "Arrangement" },
    { id: 3, name: "Roses" },
    { id: 4, name: "Tulips" },
  ];

  // Mock data
  const mockProducts = [
    {
      id: 1,
      name: "Rose Bouquet",
      price: 150000,
      stock: 10,
      categories: [{ name: "Bouquet" }, { name: "Roses" }],
      description: "Beautiful red roses",
    },
    {
      id: 2,
      name: "Tulip Arrangement",
      price: 120000,
      stock: 5,
      categories: [{ name: "Arrangement" }, { name: "Tulips" }],
      description: "Spring tulip arrangement",
    },
  ];

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      description: "",
      categoryIds: [],
    });
    setCurrentProduct(null);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle category change
  const handleCategoryChange = (categoryId, checked) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: checked
        ? [...prev.categoryIds, categoryId]
        : prev.categoryIds.filter((id) => id !== categoryId),
    }));
  };

  // Handle new product
  const handleNewProduct = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryIds: product.categories.map(
        (cat) => categories.find((c) => c.name === cat.name)?.id || 1
      ),
    });
    setIsModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      categories: formData.categoryIds.map((id) =>
        categories.find((cat) => cat.id === id)
      ),
    };

    if (currentProduct) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === currentProduct.id ? { ...p, ...productData } : p
        )
      );
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: Date.now(),
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  useEffect(() => {
    // Simulasi loading API call
    const fetchProducts = async () => {
      setIsLoading(true);

      // Simulasi delay network (1-2 detik)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Set mock data
      setProducts(mockProducts);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

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
