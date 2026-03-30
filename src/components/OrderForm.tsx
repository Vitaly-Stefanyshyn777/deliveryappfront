"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Calendar, MapPin, Mail, Phone } from "lucide-react";
import { OrderFormData } from "@/types";
import { CaptchaModal } from "./CaptchaModal";
import styles from "./OrderForm.module.css";

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label
          htmlFor="email"
          className={styles.fieldLabel}
        >
          Email
        </label>
        <div className={styles.group}>
          <Mail className={styles.icon} />
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={styles.input}
            placeholder="your@email.com"
          />
        </div>
        {errors.email && (
          <p className={styles.error}>{errors.email}</p>
        )}
      </div>

      <div className={styles.field}>
        <label
          htmlFor="phone"
          className={styles.fieldLabel}
        >
          Телефон
        </label>
        <div className={styles.group}>
          <Phone className={styles.icon} />
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={styles.input}
            placeholder="+380 50 123 45 67"
          />
        </div>
        {errors.phone && (
          <p className={styles.error}>{errors.phone}</p>
        )}
      </div>

      <div className={styles.field}>
        <label
          htmlFor="deliveryAddr"
          className={styles.fieldLabel}
        >
          Адреса доставки
        </label>
        <div className={styles.group}>
          <MapPin className={styles.icon} />
          <textarea
            id="deliveryAddr"
            value={formData.deliveryAddr}
            onChange={(e) => handleInputChange("deliveryAddr", e.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="вул. Хрещатик, 1, Київ"
          />
        </div>
        {errors.deliveryAddr && (
          <p className={styles.error}>{errors.deliveryAddr}</p>
        )}
      </div>

      <div className={styles.field}>
        <label
          htmlFor="deliveryAt"
          className={styles.fieldLabel}
        >
          Дата та час доставки
        </label>
        <div className={styles.group}>
          <Calendar className={styles.icon} />
          <input
            type="datetime-local"
            id="deliveryAt"
            value={formData.deliveryAt}
            onChange={(e) => handleInputChange("deliveryAt", e.target.value)}
            min={minDate}
            className={styles.input}
            placeholder="дд.мм.рррр, --:--"
          />
        </div>
        {errors.deliveryAt && (
          <p className={styles.error}>{errors.deliveryAt}</p>
        )}
      </div>

      <div className={styles.row}>
        <label className={styles.fieldLabel}>
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
        className={`${styles.submitButton} ${
          isSubmitting ? styles.submitButtonDisabled : ""
        }`}
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
