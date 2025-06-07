"use client";

import AdminLayout from "@/components/AdminLayout";
import {useState, useEffect} from "react";
import {PlusIcon} from "@heroicons/react/24/outline";

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
          method: "DELETE"
        });

        if (res.ok) {
          setCategories(categories.filter((category) => category.id !== categoryId));
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
      const payload = {name: newCategoryName.trim()};
      let res;

      if (currentCategory) {
        // Update existing category
        res = await fetch(`/api/admin/categories/${currentCategory.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new category
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);

          if (currentCategory) {
            // Update categories list
            setCategories(categories.map((c) => (c.id === currentCategory.id ? data : c)));
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
        let errorMessage = `Failed to ${currentCategory ? "update" : "create"} category`;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button
          onClick={handleNewCategory}
          className="flex items-center px-4 py-2 text-white bg-pink-500 rounded-md hover:bg-pink-600"
        >
          <PlusIcon className="mr-1 size-5" />
          New Category
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
          {categories.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No categories found. Click &quot;New Category&quot; to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#E6E6E6] font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Products
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Total Stock
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-xs font-bold tracking-wider text-right text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{category.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {category.productCount} products
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {category.totalStock || 0} units
                        {(category.outOfStockCount > 0 || category.lowStockCount > 0) && (
                          <div className="mt-1 text-xs text-orange-600">
                            {category.outOfStockCount > 0 && `${category.outOfStockCount} out of stock`}
                            {category.outOfStockCount > 0 && category.lowStockCount > 0 && ", "}
                            {category.lowStockCount > 0 && `${category.lowStockCount} low stock`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(category.totalRevenue || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(category.avgProductPrice || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 whitespace-nowrap">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="mr-4 text-indigo-600 hover:text-indigo-900"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-xl font-semibold">
              {currentCategory ? "Edit Category" : "New Category"}
            </h2>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Category Name</label>
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
            <div className="flex justify-end mt-6 space-x-2">
              <button onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 text-white bg-pink-500 rounded-md hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
