"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Mock categories data
  const mockCategories = [
    {
      id: 1,
      name: "Bouquet",
      productCount: 5,
    },
    {
      id: 2,
      name: "Arrangement",
      productCount: 3,
    },
    {
      id: 3,
      name: "Roses",
      productCount: 8,
    },
    {
      id: 4,
      name: "Tulips",
      productCount: 2,
    },
  ];

  // Reset form
  const resetForm = () => {
    setNewCategoryName("");
    setCurrentCategory(null);
  };

  // Handle new category
  const handleNewCategory = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setNewCategoryName(category.name);
    setIsModalOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    }
  };

  // Handle save category
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    if (currentCategory) {
      // Update existing category
      setCategories((prev) =>
        prev.map((c) =>
          c.id === currentCategory.id
            ? { ...c, name: newCategoryName.trim() }
            : c
        )
      );
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        productCount: 0,
      };
      setCategories((prev) => [...prev, newCategory]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle Enter key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveCategory();
    }
  };

  useEffect(() => {
    // Simulasi loading categories data
    const fetchCategories = async () => {
      setIsLoading(true);

      // Simulasi delay network (1 detik)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set mock data
      setCategories(mockCategories);
      setIsLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button
          onClick={handleNewCategory}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="size-5 mr-1" />
          New Category
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
          {categories.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No categories found. Click "New Category" to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#E6E6E6] font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.productCount} products
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
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

      {/* Modal for Add/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentCategory ? "Edit Category" : "New Category"}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                autoFocus
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
