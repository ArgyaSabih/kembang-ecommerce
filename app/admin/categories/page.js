"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  // fetch categories dulu
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/categories");
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setCategories(data);
          } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            setError("Failed to parse response from server");
          }
        } else {
          console.error("Failed to fetch categories, status:", res.status);
          setError("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Error connecting to server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Reset form supaya bersih
  const resetForm = () => {
    setNewCategoryName("");
    setCurrentCategory(null);
  };

  // Handle new category
  const handleNewCategory = () => {
    resetForm();
    setCurrentCategory(null);
    setNewCategoryName("");
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
      try {
        const res = await fetch(`/api/admin/categories/${categoryId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setCategories(
            categories.filter((category) => category.id !== categoryId)
          );
        } else {
          const errorText = await res.text();
          let errorMessage = "Failed to delete category";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {}
          alert(errorMessage);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
      }
    }
  };

  // Handle save category
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name cannot be empty");
      return;
    }

    try {
      const payload = { name: newCategoryName.trim() };
      let res;

      if (currentCategory) {
        // Update existing category
        res = await fetch(`/api/admin/categories/${currentCategory.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new category
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);

          if (currentCategory) {
            // Update categories list
            setCategories(
              categories.map((c) => (c.id === currentCategory.id ? data : c))
            );
          } else {
            // Add new category to list
            setCategories([...categories, data]);
          }

          setIsModalOpen(false);
          resetForm();
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          alert("Server response could not be processed");
        }
      } else {
        const errorText = await res.text();
        let errorMessage = `Failed to ${
          currentCategory ? "update" : "create"
        } category`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert(`Failed to ${currentCategory ? "update" : "create"} category`);
    }
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
