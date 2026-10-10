"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Wrench,
  User,
  ShieldCheck
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  customer?: {
    user?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  technician?: {
    id: string;
    fullName: string;
    phone: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (reviewId: string, currentStatus: boolean) => {
    setUpdatingId(reviewId);
    try {
      const res = await fetch("/api/v1/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, isApproved: !currentStatus }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/v1/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.customer?.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.product?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.technician?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === "ALL" || r.rating.toString() === ratingFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "APPROVED" && r.isApproved) ||
      (statusFilter === "HIDDEN" && !r.isApproved);

    return matchesSearch && matchesRating && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Customer Ratings & Reviews Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Moderate, approve, and inspect verified reviews for products and electrical technicians.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Reviews</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{reviews.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Published / Approved</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {reviews.filter((r) => r.isApproved).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Pending / Hidden</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">
            {reviews.filter((r) => !r.isApproved).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <p className="text-xs font-medium text-blue-700">Average Rating</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {reviews.length > 0
              ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
              : "5.0"}{" "}
            ★
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by review text, customer, or product..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Visibility</option>
            <option value="APPROVED">Approved / Visible</option>
            <option value="HIDDEN">Hidden / Unmoderated</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
              Loading customer reviews...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No reviews found matching criteria.
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-slate-50/60 transition">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? "fill-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{rev.rating}.0</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        rev.isApproved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {rev.isApproved ? "Approved" : "Hidden"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 leading-relaxed font-normal">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-800">
                      {rev.customer?.user?.name || "Verified Customer"}
                    </span>
                    {rev.product && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        <ShoppingBag className="w-3 h-3" />
                        Product: {rev.product.name}
                      </span>
                    )}
                    {rev.technician && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        <Wrench className="w-3 h-3" />
                        Technician: {rev.technician.fullName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleApproval(rev.id, rev.isApproved)}
                    disabled={updatingId === rev.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      rev.isApproved
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {rev.isApproved ? "Hide Review" : "Approve & Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
