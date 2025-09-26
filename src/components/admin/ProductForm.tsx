import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Save, X } from 'lucide-react';
import { api, Product, ProductVariant } from '@/lib/api';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().default(false),
  availability_status: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED']),
  tags: z.string().optional(),
});

const variantSchema = z.object({
  title: z.string().min(1, 'Variant title is required'),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  sku: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  compare_at_price: z.number().min(0).optional(),
  taxable: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;
type VariantFormData = z.infer<typeof variantSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSaved, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<(ProductVariant & { isNew?: boolean })[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      image_url: product?.image_url || '',
      is_published: product?.is_published || false,
      availability_status: product?.availability_status as any || 'IN_STOCK',
      tags: product?.tags || '',
    },
  });

  // Load existing variants if editing
  useEffect(() => {
    if (product) {
      loadVariants();
    } else {
      // Add one default variant for new products
      setVariants([{
        id: 'new-1',
        product_id: '',
        title: 'Default',
        price: 0,
        taxable: true,
        created_at: '',
        updated_at: '',
        isNew: true,
      }]);
    }
  }, [product]);

  const loadVariants = async () => {
    if (!product) return;
    try {
      const variantsData = await api.getProductVariants(product.id);
      setVariants(variantsData);
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant & { isNew: boolean } = {
      id: `new-${Date.now()}`,
      product_id: product?.id || '',
      title: `Variant ${variants.length + 1}`,
      price: 0,
      taxable: true,
      created_at: '',
      updated_at: '',
      isNew: true,
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast({
        title: "Error",
        description: "A product must have at least one variant.",
        variant: "destructive",
      });
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setVariants(updatedVariants);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      // Validate variants
      for (const variant of variants) {
        if (!variant.title || variant.price < 0) {
          toast({
            title: "Validation Error",
            description: "All variants must have a title and valid price.",
            variant: "destructive",
          });
          return;
        }
      }

      // Save or update product
      let productId: string;
      if (product) {
        await api.updateProduct(product.id, data);
        productId = product.id;
      } else {
        const newProduct = await api.createProduct(data);
        productId = newProduct.id;
      }

      // Save variants
      for (const variant of variants) {
        const variantData = {
          ...variant,
          product_id: productId,
        };

        if (variant.isNew) {
          await api.createProductVariant(variantData);
        } else {
          await api.updateProductVariant(variant.id, variantData);
        }
      }

      toast({
        title: "Success",
        description: product ? "Product updated successfully." : "Product created successfully.",
      });

      onSaved();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="availability_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN_STOCK">In Stock</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                        <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Published</FormLabel>
                      <FormDescription>
                        Make this product visible to customers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="tag1, tag2, tag3..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate tags with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Product Variants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Variants</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((variant, index) => (
              <Card key={variant.id} className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">Variant {index + 1}</Badge>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        value={variant.title || ''}
                        onChange={(e) => updateVariant(index, 'title', e.target.value)}
                        placeholder="Variant title..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">SKU</label>
                      <Input
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        placeholder="SKU..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price *</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Compare Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.compare_at_price || ''}
                        onChange={(e) => updateVariant(index, 'compare_at_price', parseFloat(e.target.value) || undefined)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </Form>
  );
};