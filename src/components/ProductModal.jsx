import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import toast from "react-hot-toast"; // Import toast for error display

// ---------------------- API CALLS (Extracted) ----------------------

const fetchCategories = async () => {
  // NOTE: Using "token" as defined in the original code
  const { data } = await axios.get("http://localhost:3000/api/v1/categories", {
    headers: { Authorization: localStorage.getItem("token") },
  });
  return data.data;
};

// ---------------------- PRODUCT MODAL COMPONENT ----------------------

const ProductModal = ({ isOpen, onClose, onSubmit, product, isSaving }) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    sku: "",
    category_id: "",
    is_active: 1,
    images: [],
  });

  // --- Query for Categories ---
  const {
    data: categories = [], // Default to empty array
    isLoading: loadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["productCategories"],
    queryFn: fetchCategories,
    // Only fetch categories when the modal is open
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // Categories don't change often, keep data fresh for 5 mins
  });

  // Handle category fetch error
  useEffect(() => {
    if (categoriesError) {
      console.error("Failed to load categories:", categoriesError);
      toast.error("❌ Failed to load categories for the form.");
    }
  }, [categoriesError]);

  // --- Prefill form when editing / Reset form when adding ---
  useEffect(() => {
    // Reset or prefill form whenever the modal opens or the product changes
    if (product) {
      setFormData({
        title: product.title || "",
        slug: product.slug || "",
        description: product.description || "",
        // Convert numbers to string for input fields if necessary, though direct binding usually works
        price: product.price || "",
        stock: product.stock || "",
        sku: product.sku || "",
        category_id: product.category_id || "",
        is_active: product.is_active !== undefined ? product.is_active : 1,
        images: [], // Images are typically not prefilled for security/form data reasons
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        description: "",
        price: "",
        stock: "",
        sku: "",
        category_id: "",
        is_active: 1,
        images: [],
      });
    }
  }, [product, isOpen]); // Depend on product and isOpen

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, images: files });
    } else if (type === "checkbox") {
      // Ensure boolean checked state is converted to 1 or 0 for backend
      setFormData({ ...formData, [name]: checked ? 1 : 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation
    if (!formData.category_id) {
      toast.error("Please select a category.");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl mb-4 text-black font-semibold">
          {product ? "Edit Product" : "Add Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title and Slug */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="slug"
              placeholder="Slug"
              className="input input-bordered w-full"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description"
            className="textarea textarea-bordered w-full"
            value={formData.description}
            onChange={handleChange}
            required
          />

          {/* Price, Stock, SKU */}
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              name="price"
              placeholder="Price"
              className="input input-bordered w-full"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              className="input input-bordered w-full"
              value={formData.stock}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="sku"
              placeholder="SKU"
              className="input input-bordered w-full"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category Select */}
          <select
            value={formData.category_id}
            onChange={(e) =>
              setFormData({ ...formData, category_id: e.target.value })
            }
            className="select select-bordered w-full"
            disabled={loadingCategories || isSaving}
            required
          >
            <option value="">
              {loadingCategories ? "Loading Categories..." : "Select Category"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Is Active Checkbox */}
          <label className="flex items-center gap-2 text-black cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active === 1}
              onChange={handleChange}
              className="checkbox checkbox-primary"
              disabled={isSaving}
            />
            <span className="label-text">Active</span>
          </label>

          {/* Images */}
          <input
            type="file"
            name="images"
            multiple
            className="file-input file-input-bordered w-full"
            onChange={handleChange}
            disabled={isSaving}
          />

          {/* Image Previews */}
          {product?.images?.length > 0 && !formData.images.length ? (
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-sm font-medium">Current Images:</span>
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt="current preview"
                  className="h-16 w-16 object-cover border rounded"
                />
              ))}
              <p className="text-sm text-gray-500 italic">
                (Uploading new files will replace these.)
              </p>
            </div>
          ) : (
            formData.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-sm font-medium">New Previews:</span>
                {Array.from(formData.images).map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-16 w-16 object-cover border rounded"
                  />
                ))}
              </div>
            )
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : product ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
