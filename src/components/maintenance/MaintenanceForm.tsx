"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/context/UserContext";
import type { RequestCategory, RequestPriority } from "@/lib/types";
import type { MaintenanceUnitOption } from "@/lib/queries/maintenance";

type MaintenanceFormProps = {
  currentUser: CurrentUser;
};

type SelectedImagePreview = {
  file: File;
  previewUrl: string;
};

const categories: Array<{ value: RequestCategory | ""; label: string }> = [
  { value: "", label: "Select a category" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "structural", label: "Structural" },
  { value: "appliance", label: "Appliance" },
  { value: "pest", label: "Pest" },
  { value: "general", label: "General" },
];

const priorities: Array<{ value: RequestPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function MaintenanceForm({ currentUser }: MaintenanceFormProps) {
  const router = useRouter();
  const [unitOptions, setUnitOptions] = useState<MaintenanceUnitOption[]>([]);
  const [unitId, setUnitId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RequestCategory | "">("");
  const [priority, setPriority] = useState<RequestPriority>("medium");
  const [selectedImages, setSelectedImages] = useState<SelectedImagePreview[]>(
    []
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      if (currentUser.id === null || currentUser.role === "null") {
        setIsLoadingOptions(false);
        setError("You must select a logged-in user before creating a request.");
        return;
      }

      try {
        setIsLoadingOptions(true);
        setError(null);

        const params = new URLSearchParams({
          userId: String(currentUser.id),
          role: currentUser.role,
        });

        const response = await fetch(`/api/maintenance/requests?${params}`);

        if (!response.ok) {
          throw new Error("Failed to load form options.");
        }

        const data = (await response.json()) as {
          units: MaintenanceUnitOption[];
        };

        if (isMounted) {
          setUnitOptions(data.units);
          setUnitId(data.units[0] ? String(data.units[0].unit_id) : "");
        }
      } catch {
        if (isMounted) {
          setError("Unable to load available properties or units.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentUser.role]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [selectedImages]);

  function handleImageChange(files: FileList | null) {
    selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));

    const imagePreviews = Array.from(files ?? []).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages(imagePreviews);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentUser.id === null || currentUser.role === "null") {
      setError("You must select a logged-in user before creating a request.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/maintenance/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          role: currentUser.role,
          unitId: Number(unitId),
          title,
          description,
          category,
          priority,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        request?: { request_id: number };
      };

      if (!response.ok || !data.request) {
        throw new Error(data.error ?? "Failed to create maintenance request.");
      }

      setSuccessMessage("Maintenance request created.");
      router.push(`/maintenance/${data.request.request_id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create maintenance request."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const showReadOnlyTenantUnit = currentUser.role === "tenant";

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4"
      style={{
        background: "#fffefb",
        border: "1px solid #c5c0b1",
        borderRadius: "6px",
      }}
    >
      <div className="mb-4">
        <div style={{ fontSize: "13px", color: "#939084" }}>Reporting as</div>
        <div style={{ fontSize: "16px", fontWeight: 600, color: "#201515" }}>
          {currentUser.name}
        </div>
        {currentUser.email ? (
          <div style={{ fontSize: "13px", color: "#939084" }}>
            {currentUser.email}
          </div>
        ) : null}
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {successMessage ? (
        <div className="alert alert-success">{successMessage}</div>
      ) : null}

      <div className="row g-3">
        {!showReadOnlyTenantUnit ? (
          <div className="col-12">
              <label htmlFor="unitId" className="form-label">
                Property / Unit
              </label>
              <select
                id="unitId"
                className="form-select"
                value={unitId}
                onChange={(event) => setUnitId(event.target.value)}
                disabled={isLoadingOptions || isSubmitting}
                required
              >
                {isLoadingOptions ? (
                  <option value="">Loading available units...</option>
                ) : null}
                {!isLoadingOptions && unitOptions.length === 0 ? (
                  <option value="">No available units</option>
                ) : null}
                {unitOptions.map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.label}
                  </option>
                ))}
              </select>
          </div>
        ) : null}

        <div className="col-12">
          <label htmlFor="title" className="form-label">
            Request title
          </label>
          <input
            id="title"
            className="form-control"
            type="text"
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Briefly describe the issue"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as RequestCategory | "")
            }
            disabled={isSubmitting}
          >
            {categories.map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <select
            id="priority"
            className="form-select"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as RequestPriority)
            }
            disabled={isSubmitting}
            required
          >
            {priorities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className="form-control"
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add details such as location, symptoms, and when it started"
            disabled={isSubmitting}
          />
        </div>

        <div className="col-12">
          <label htmlFor="images" className="form-label">
            Images
          </label>
          <input
            id="images"
            className="form-control"
            type="file"
            accept="image/*"
            multiple
            disabled={isSubmitting}
            onChange={(event) => handleImageChange(event.target.files)}
          />
          <div className="form-text">
            Prototype only: selected image names are shown here, but file
            storage/upload will be implemented later.
          </div>
          {selectedImages.length > 0 ? (
            <div className="mt-3">
              <div className="small text-muted mb-2">
                {selectedImages.length} image
                {selectedImages.length === 1 ? "" : "s"} selected
              </div>
              <div className="d-flex flex-wrap gap-3">
                {selectedImages.map((image) => (
                  <figure
                    key={`${image.file.name}-${image.file.lastModified}`}
                    className="mb-0"
                    style={{ width: "120px" }}
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      style={{
                        width: "120px",
                        height: "90px",
                        objectFit: "cover",
                        border: "1px solid #c5c0b1",
                        borderRadius: "6px",
                        background: "#fffdf9",
                      }}
                    />
                    <figcaption
                      className="small text-muted mt-1"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={image.file.name}
                    >
                      {image.file.name}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={isSubmitting}
          onClick={() => router.push("/maintenance")}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn"
          disabled={isSubmitting || isLoadingOptions || unitOptions.length === 0}
          style={{
            background: "#ff4f00",
            color: "#fffefb",
            border: "1px solid #ff4f00",
            fontWeight: 600,
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
