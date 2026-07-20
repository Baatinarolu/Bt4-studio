"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, ArrowLeft, ArrowRight, Check, File, Image as ImageIcon, 
  X, Eye, EyeOff, Loader2 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface FormData {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
  price: number;
  license: string;
  demoUrl: string;
  file: File | null;
  previewImages: File[];
}

const STEPS = [
  { id: 1, title: "Basic Info", desc: "Title, category & tags" },
  { id: 2, title: "Description", desc: "Markdown with live preview" },
  { id: 3, title: "Pricing & License", desc: "Price and usage rights" },
  { id: 4, title: "Files & Assets", desc: "ZIP + preview images" },
  { id: 5, title: "Review & Submit", desc: "Final check before review" },
];

const CATEGORIES = [
  { value: "nextjs", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "ui-kits", label: "UI Kits" },
  { value: "apis", label: "APIs & Backend" },
  { value: "saas", label: "SaaS Starters" },
  { value: "devtools", label: "Dev Tools" },
];

const LICENSES = ["MIT", "Commercial", "GPL", "Custom"];

export default function UploadWizard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [form, setForm] = useState<FormData>({
    title: "",
    slug: "",
    category: "nextjs",
    tags: [],
    description: "",
    price: 49,
    license: "MIT",
    demoUrl: "",
    file: null,
    previewImages: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [fileDragActive, setFileDragActive] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);

  const user = session?.user as any;

  // Auto-generate slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
  };

  const updateForm = (key: keyof FormData, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      
      if (key === "title") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // Tag handling
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 8) {
      updateForm("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updateForm("tags", form.tags.filter(t => t !== tag));
  };

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Only .zip files are allowed");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File must be under 500MB");
      return;
    }
    
    updateForm("file", file);
    toast.success(`File selected: ${file.name}`);
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files).slice(0, 10 - form.previewImages.length);
    
    if (newImages.length === 0) return;

    const validImages = newImages.filter(f => 
      f.type.startsWith("image/") && f.size < 10 * 1024 * 1024
    );

    if (validImages.length !== newImages.length) {
      toast.error("Only images under 10MB allowed");
    }

    updateForm("previewImages", [...form.previewImages, ...validImages]);
  };

  const removeImage = (index: number) => {
    const newImages = form.previewImages.filter((_, i) => i !== index);
    updateForm("previewImages", newImages);
  };

  // Drag and drop
  const handleDrag = (e: React.DragEvent, type: "file" | "image", active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "file") setFileDragActive(active);
    else setImageDragActive(active);
  };

  const handleDrop = (e: React.DragEvent, type: "file" | "image") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "file") {
      setFileDragActive(false);
      handleFileSelect(e.dataTransfer.files);
    } else {
      setImageDragActive(false);
      handleImageSelect(e.dataTransfer.files);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!form.title && !!form.category;
      case 2: return form.description.length > 20;
      case 3: return form.price > 0;
      case 4: return !!form.file;
      default: return true;
    }
  };

  // Submit - now persists via unified data layer
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const sellerId = user?.id || "u1"; // fallback for demo

      await createProduct({
        sellerId,
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category.toUpperCase().replace(/-/g, "_"),
        tags: form.tags,
        price: form.price,
        currency: "USD",
        fileUrl: "https://r2.bt4.studio/uploads/" + (form.file?.name || "product.zip"), // placeholder
        previewImages: [], // In real app we'd upload images first
        demoUrl: form.demoUrl || null,
        licenseType: form.license as any,
        version: "1.0.0",
      });

      toast.success("Product submitted for review!", {
        description: "You'll be notified once it's approved (usually within 24h).",
        duration: 6000,
      });

      setTimeout(() => {
        router.push("/seller/dashboard?submitted=true");
      }, 1200);
    } catch (error) {
      toast.error("Failed to submit product");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress
  const progress = ((currentStep - 1) / 4) * 100;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/seller/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="text-4xl tracking-tighter font-semibold">Upload Product</h1>
          <p className="text-muted-foreground">Submit for admin review</p>
        </div>
        <div className="text-right text-sm">
          <div className="font-medium">Step {currentStep} of 5</div>
          <div className="text-muted-foreground">{STEPS[currentStep - 1].title}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded mb-10">
        <div 
          className="h-1 bg-accent transition-all rounded" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar - Steps */}
        <div className="lg:col-span-3">
          <div className="sticky top-8 space-y-1">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              return (
                <div 
                  key={step.id}
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${
                    isActive 
                      ? "border-accent bg-accent/5" 
                      : isComplete 
                        ? "border-border bg-muted/30" 
                        : "border-transparent"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium ${
                    isComplete ? "bg-accent text-white" : isActive ? "border border-accent text-accent" : "border border-border text-muted-foreground"
                  }`}>
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${isActive ? "text-foreground" : ""}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <div className="bg-card border border-border rounded-3xl p-8 min-h-[560px]">
            
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-1">Basic Information</h2>
                  <p className="text-muted-foreground">Tell buyers what you're selling.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Title</label>
                    <Input 
                      value={form.title} 
                      onChange={(e) => updateForm("title", e.target.value)}
                      placeholder="Stripe Connect Dashboard Kit" 
                      className="text-xl h-14"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">URL Slug</label>
                    <div className="flex items-center bg-muted rounded-md px-4 py-3 font-mono text-sm border border-border">
                      /product/{form.slug || "your-product-slug"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select 
                        value={form.category}
                        onChange={(e) => updateForm("category", e.target.value)}
                        className="w-full h-11 bg-background border border-border rounded-md px-4"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tags (max 8)</label>
                      <div className="flex gap-2">
                        <Input 
                          value={tagInput} 
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                          placeholder="stripe, dashboard, payments"
                          className="flex-1"
                        />
                        <Button type="button" onClick={addTag} variant="outline">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.tags.map(tag => (
                          <div key={tag} className="bg-muted text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-border">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Description */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Description</h2>
                    <p className="text-muted-foreground">Write a compelling description. Markdown supported.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPreview ? "Hide" : "Show"} Preview
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      placeholder={`## Features\n\n- Beautiful UI\n- Fully typed\n- Production ready...`}
                      className="w-full h-[420px] font-mono text-sm p-5 bg-background border border-border rounded-2xl resize-y"
                    />
                  </div>

                  {showPreview && (
                    <div className="border border-border rounded-2xl p-6 bg-background overflow-auto prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {form.description || "*Start typing to see preview...*"}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-8 max-w-md">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-1">Pricing & License</h2>
                  <p className="text-muted-foreground">Set your price and usage rights.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (USD)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-3.5 text-2xl text-muted-foreground">$</div>
                    <Input 
                      type="number" 
                      value={form.price} 
                      onChange={(e) => updateForm("price", parseInt(e.target.value) || 0)}
                      className="pl-9 text-4xl h-16 font-semibold tracking-tighter" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">You keep 80%. Platform takes 20%.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">License Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {LICENSES.map(lic => (
                      <button
                        key={lic}
                        type="button"
                        onClick={() => updateForm("license", lic)}
                        className={`border rounded-xl p-4 text-left transition ${form.license === lic ? "border-accent bg-accent/5" : "border-border hover:bg-muted"}`}
                      >
                        <div className="font-medium">{lic}</div>
                        <div className="text-xs text-muted-foreground">
                          {lic === "MIT" && "Open source friendly"}
                          {lic === "Commercial" && "Most popular for businesses"}
                          {lic === "GPL" && "Copyleft"}
                          {lic === "Custom" && "Contact for details"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Demo URL (optional)</label>
                  <Input 
                    value={form.demoUrl} 
                    onChange={(e) => updateForm("demoUrl", e.target.value)}
                    placeholder="https://your-demo.vercel.app" 
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Files */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Files & Assets</h2>
                  <p className="text-muted-foreground">Upload your source code and preview images.</p>
                </div>

                {/* ZIP Upload */}
                <div>
                  <div className="font-medium mb-2">Source Code (ZIP, max 500MB)</div>
                  <div 
                    onDragEnter={(e) => handleDrag(e, "file", true)}
                    onDragLeave={(e) => handleDrag(e, "file", false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, "file")}
                    onClick={() => document.getElementById("zip-input")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${fileDragActive ? "border-accent bg-accent/5" : "border-border hover:bg-muted"}`}
                  >
                    <input 
                      id="zip-input" 
                      type="file" 
                      accept=".zip" 
                      className="hidden" 
                      onChange={(e) => handleFileSelect(e.target.files)} 
                    />
                    <Upload className="mx-auto h-9 w-9 text-muted-foreground mb-3" />
                    <div className="font-medium">
                      {form.file ? form.file.name : "Drop your .zip here or click to upload"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Will be scanned for malware</div>
                  </div>
                </div>

                {/* Preview Images */}
                <div>
                  <div className="font-medium mb-2">Preview Images (up to 10)</div>
                  <div 
                    onDragEnter={(e) => handleDrag(e, "image", true)}
                    onDragLeave={(e) => handleDrag(e, "image", false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, "image")}
                    onClick={() => document.getElementById("image-input")?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer mb-4 transition ${imageDragActive ? "border-accent bg-accent/5" : "border-border"}`}
                  >
                    <input 
                      id="image-input" 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageSelect(e.target.files)} 
                    />
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <div className="text-sm">Drop images or click to upload</div>
                  </div>

                  {form.previewImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {form.previewImages.map((img, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-border">
                          <img 
                            src={URL.createObjectURL(img)} 
                            alt="" 
                            className="w-full h-28 object-cover" 
                          />
                          <button 
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Review & Submit</h2>
                  <p className="text-muted-foreground">Everything looks good? Submit for review.</p>
                </div>

                <div className="border border-border rounded-2xl p-6 space-y-6 bg-background">
                  <div className="flex justify-between border-b pb-4">
                    <div>
                      <div className="font-semibold text-xl">{form.title}</div>
                      <div className="text-sm text-muted-foreground">/{form.slug}</div>
                    </div>
                    <div className="text-right font-semibold text-2xl tabular-nums tracking-tighter">
                      ${form.price}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div><span className="text-muted-foreground">Category:</span> {form.category}</div>
                    <div><span className="text-muted-foreground">License:</span> {form.license}</div>
                    <div><span className="text-muted-foreground">Tags:</span> {form.tags.join(", ") || "—"}</div>
                    <div><span className="text-muted-foreground">Demo:</span> {form.demoUrl || "—"}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground text-sm mb-2">Description preview</div>
                    <div className="text-sm line-clamp-3 border-l-2 pl-4 border-border">
                      {form.description.slice(0, 180)}...
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Your files will be scanned. Product will be reviewed within 24 hours.
                  </div>
                </div>

                <div className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to BT4 Studio's <span className="underline">Seller Terms</span>.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              {currentStep < 5 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!canGoNext()}
                  className="btn-primary gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="btn-primary px-8 gap-2"
                >
                  {isSubmitting ? (
                    <>Submitting <Loader2 className="h-4 w-4 animate-spin" /></>
                  ) : (
                    <>Submit for Review <Check className="h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
