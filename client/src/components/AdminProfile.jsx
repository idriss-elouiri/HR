"use client";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUser,
  FaSave,
  FaCamera,
  FaTimes,
  FaPhone,
  FaBuilding,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  updateStart,
  updateSuccess,
  updateFailure,
} from "../redux/user/userSlice";

const AdminProfile = () => {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3005";

  // Cloudinary configuration
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const buildProfilePictureUrl = useCallback(
    (profilePath) => {
      if (!profilePath) return `${BASE_URL}/default-avatar.png`;
      if (profilePath.startsWith("http")) return profilePath;
      return `${BASE_URL}${profilePath}`;
    },
    [BASE_URL]
  );

  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState("/default-avatar.png");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fullProfilePicture = buildProfilePictureUrl(
        currentUser.profilePicture
      );

      setFormData({
        ...currentUser,
        profilePicture: fullProfilePicture,
      });

      setPreviewImage(fullProfilePicture);
    }
  }, [currentUser, buildProfilePictureUrl]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // تحقق من حجم الملف (الحد الأقصى 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الملف كبير جدًا (الحد الأقصى 2MB)");
      return;
    }

    setIsUploading(true);

    // معاينة الصورة قبل الرفع
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      // رفع الصورة إلى Cloudinary
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(data.error.message || "فشل في رفع الصورة");
      }

      // استخدام رابط الصورة من Cloudinary
      const cloudinaryUrl = data.secure_url;

      setFormData((prev) => ({
        ...prev,
        profilePicture: cloudinaryUrl,
      }));

      setPreviewImage(cloudinaryUrl);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      toast.error(error.message || "حدث خطأ أثناء رفع الصورة");
      console.error("Cloudinary upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    dispatch(updateStart());
    try {
      // إعداد بيانات التحديث
      const updateData = {
        name: formData.name,
        phone: formData.phone || "",
        department: formData.department || "",
        profilePicture: formData.profilePicture,
      };

      const res = await fetch(`${apiUrl}/api/auth/${currentUser._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "حدث خطأ أثناء التحديث");

      // تحديث حالة Redux
      dispatch(
        updateSuccess({
          ...currentUser,
          ...updateData,
        })
      );

      toast.success("تم تحديث الملف الشخصي بنجاح");
      setIsEditing(false);
    } catch (error) {
      dispatch(updateFailure(error.message));
      toast.error(error.message);
    }
  };

  const removeImage = () => {
    setPreviewImage("/default-avatar.png");
    setFormData((prev) => ({
      ...prev,
      profilePicture: "/default-avatar.png",
    }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* قسم العنوان */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <FaUser className="mr-3 text-purple-300" /> الملف الشخصي
              </h1>
              <p className="opacity-90 mt-2 text-purple-200">
                {isEditing
                  ? "يمكنك تعديل معلومات حسابك وتحديث صورتك الشخصية"
                  : "عرض معلومات حسابك الشخصية"}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleSaveProfile}
                disabled={loading || isUploading}
                className={`flex items-center py-3 px-6 rounded-xl font-medium transition-all shadow-lg ${
                  isEditing
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-indigo-500 hover:bg-indigo-600"
                } ${
                  loading || isUploading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading || isUploading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <FaSave className="ml-2" />
                )}
                {isEditing
                  ? loading || isUploading
                    ? "جاري الحفظ..."
                    : "حفظ التغييرات"
                  : "تعديل الملف"}
              </button>
            </div>
          </div>
        </div>

        {/* محتوى الملف الشخصي */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* قسم الصورة الشخصية */}
            <div className="bg-gradient-to-b from-indigo-50 to-purple-50 p-8 flex flex-col items-center justify-center border-r border-gray-200">
              <div className="relative">
                <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-xl border-4 border-white">
                  <img
                    src={previewImage}
                    alt="صورة الملف الشخصي"
                    className="w-full h-full object-cover"
                  />
                  {isEditing && !isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer bg-white p-3 rounded-full shadow-lg text-indigo-700 hover:text-indigo-900 transition-colors">
                        <FaCamera className="text-xl" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                      <span className="sr-only">جاري رفع الصورة...</span>
                    </div>
                  )}
                </div>

                {isEditing &&
                  previewImage &&
                  previewImage !== "/default-avatar.png" &&
                  !isUploading && (
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
                      aria-label="إزالة الصورة"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
              </div>

              <div className="mt-8 w-full max-w-xs text-center">
                <h3 className="text-xl font-bold text-indigo-900 mb-2">
                  {formData.name}
                </h3>
                <p className="text-gray-600 text-sm">{formData.email}</p>
                <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-indigo-700 mb-2">
                    دور الحساب
                  </h4>
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {currentUser?.isAdmin
                      ? "مدير نظام"
                      : currentUser?.isHR
                      ? "موارد بشرية"
                      : "مستخدم عادي"}
                  </div>
                </div>
              </div>
            </div>

            {/* قسم معلومات المستخدم */}
            <div className="lg:col-span-2 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  المعلومات الشخصية
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-gray-600 font-medium flex items-center">
                      <FaUser className="ml-2 text-indigo-600" /> الاسم الكامل
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        disabled={isUploading}
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800 p-3 bg-gray-50 rounded-xl">
                        {formData.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-600 font-medium">
                      البريد الإلكتروني
                    </label>
                    <p className="text-lg font-semibold text-indigo-600 p-3 bg-gray-50 rounded-xl">
                      {formData.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                  <FaUser className="ml-2 text-indigo-600" /> معلومات الحساب
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-indigo-100">
                    <p className="text-gray-600">نوع الحساب:</p>
                    <p className="font-semibold text-indigo-700">
                      {currentUser?.isAdmin
                        ? "مدير نظام"
                        : currentUser?.isHR
                        ? "موارد بشرية"
                        : "مستخدم عادي"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-100">
                    <p className="text-gray-600">حالة الحساب:</p>
                    <p className="font-semibold text-emerald-600">نشط</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-100">
                    <p className="text-gray-600">تاريخ الإنشاء:</p>
                    <p className="font-semibold">
                      {currentUser?.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString(
                            "ar-SA",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "غير معروف"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-100">
                    <p className="text-gray-600">آخر تحديث:</p>
                    <p className="font-semibold">
                      {currentUser?.updatedAt
                        ? new Date(currentUser.updatedAt).toLocaleDateString(
                            "ar-SA",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "غير معروف"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
