"use client";
import { useState } from "react";
export default function ProductForm({ mode, initial }) {
const [form, setForm] = useState({
    name: "", code: "", available: "", price: 0, rating: 0, imageUrl: "", description: ""
  });
    const [saving, setSaving] = useState(false);
  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: (name === "price" || name === "rating") ? Number(value) : value }));
  }
    return (
        <form
      
      className="mx-auto max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )} */}

      <Field label="Name">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          className="input"
          placeholder="e.g., Hammer"
        />
      </Field>

      <Field label="Code">
        <input
          name="code"
          value={form.code}
          onChange={onChange}
          required
          className="input"
          placeholder="e.g., TBX-0048"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Available (YYYY-MM-DD)">
          <input
            name="available"
            value={form.available}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            required
            className="input"
          />
        </Field>

        <Field label="Price">
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={onChange}
            required
            className="input"
          />
        </Field>

        <Field label="Rating (0–5)">
          <input
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating}
            onChange={onChange}
            required
            className="input"
          />
        </Field>
      </div>

      <Field label="Image URL">
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={onChange}
          required
          className="input"
          placeholder="https://..."
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={onChange}
          className="input resize-y"
          placeholder="Short description…"
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? (mode === "edit" ? "Saving..." : "Creating...")
            : (mode === "edit" ? "Save Changes" : "Create Product")}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          Cancel
        </button>
      </div>
    </form>
    )
}
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}