"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Calendar, MapPin, Mail, Phone } from "lucide-react";
import { OrderFormData } from "@/types";
import { CaptchaModal } from "./CaptchaModal";

interface OrderFormProps {
  onSubmit: (formData: OrderFormData) => void;
  isSubmitting: boolean;
}

export function OrderForm({ onSubmit, isSubmitting }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    email: "",
    phone: "",
    deliveryAddr: "",
    deliveryAt: "",
  });

  const [errors, setErrors] = useState<Partial<OrderFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.email) {
      newErrors.email = "Email обов'язковий";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Невірний формат email";
    }

    if (!formData.phone) {
      newErrors.phone = "Телефон обов'язковий";
    } else if (
      /^[\+]?[^0-9]*$/.test("") &&
      !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)
    ) {
      newErrors.phone = "Невірний формат телефону";
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Невірний формат телефону";
    }

    if (!formData.deliveryAddr) {
      newErrors.deliveryAddr = "Адреса доставки обов'язкова";
    }

    if (!formData.deliveryAt) {
      newErrors.deliveryAt = "Дата та час доставки обов'язкові";
    } else {
      const deliveryDate = new Date(formData.deliveryAt);
      const now = new Date();
      if (deliveryDate <= now) {
        newErrors.deliveryAt = "Дата доставки повинна бути в майбутньому";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setCaptchaOpen(true);
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  const ModalMapPicker = dynamic(
    () => import("./ModalMapPicker").then((m) => m.ModalMapPicker),
    { ssr: false }
  );
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [captchaOpen, setCaptchaOpen] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-900 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="your@email.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Телефон
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-900 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="+380 50 123 45 67"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="deliveryAddr"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Адреса доставки
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <textarea
            id="deliveryAddr"
            value={formData.deliveryAddr}
            onChange={(e) => handleInputChange("deliveryAddr", e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none placeholder-gray-900 ${
              errors.deliveryAddr ? "border-red-500" : "border-gray-300"
            }`}
            rows={3}
            placeholder="вул. Хрещатик, 1, Київ"
          />
        </div>
        {errors.deliveryAddr && (
          <p className="mt-1 text-sm text-red-600">{errors.deliveryAddr}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="deliveryAt"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Дата та час доставки
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="datetime-local"
            id="deliveryAt"
            value={formData.deliveryAt}
            onChange={(e) => handleInputChange("deliveryAt", e.target.value)}
            min={minDate}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-900 ${
              errors.deliveryAt ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="дд.мм.рррр, --:--"
          />
        </div>
        {errors.deliveryAt && (
          <p className="mt-1 text-sm text-red-600">{errors.deliveryAt}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900">
          Виберіть адресу на мапі (необов&apos;язково)
        </label>
        <ModalMapPicker
          triggerLabel="Відкрити мапу"
          value={geo}
          onChange={(p) => setGeo(p)}
          onAddressSelect={(addr) => handleInputChange("deliveryAddr", addr)}
          open={isMapOpen}
          onOpenChange={setIsMapOpen}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-600 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Створюємо замовлення..." : "Оформити замовлення"}
      </button>
      <CaptchaModal
        open={captchaOpen}
        onClose={() => setCaptchaOpen(false)}
        onSuccess={() => {
          setCaptchaOpen(false);
          onSubmit(formData);
        }}
        title="Підтвердіть створення замовлення"
      />
    </form>
  );
}
