"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Package, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { fetchProductsForSelection, searchProducts, type ProductForSelection } from "@/app/actions/product-actions";

interface ProductSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelection?: number;
}

export function ProductSelector({ 
  selectedIds, 
  onSelectionChange,
  maxSelection = 20 
}: ProductSelectorProps) {
  const [products, setProducts] = useState<ProductForSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load initial products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      const result = await fetchProductsForSelection();
      
      if (result.success && result.products) {
        setProducts(result.products);
      } else {
        setError(result.error || "Erreur lors du chargement des produits");
      }
      setLoading(false);
    }
    
    loadProducts();
  }, []);

  // Search products with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      const result = await searchProducts(searchTerm);
      if (result.success && result.products) {
        setProducts(result.products);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter products based on search term (client-side for instant feedback)
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }
    
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleToggleProduct = (productId: string) => {
    const isSelected = selectedIds.includes(productId);
    
    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedIds.filter(id => id !== productId));
    } else {
      // Add to selection if under max limit
      if (selectedIds.length < maxSelection) {
        onSelectionChange([...selectedIds, productId]);
      }
    }
  };

  const handleSelectAll = () => {
    const visibleIds = filteredProducts.map(p => p.id);
    const newSelection = [...new Set([...selectedIds, ...visibleIds])].slice(0, maxSelection);
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Chargement des produits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Package className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">Aucun produit disponible dans votre catalogue.</p>
        <p className="text-xs mt-1">Ajoutez des produits à votre catalogue pour les sélectionner ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {selectedIds.length} / {maxSelection}
        </Badge>
      </div>

      {/* Quick actions */}
      {filteredProducts.length > 0 && (
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-primary hover:underline"
            disabled={selectedIds.length >= maxSelection}
          >
            Tout sélectionner
          </button>
          {selectedIds.length > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-muted-foreground hover:underline"
              >
                Tout désélectionner
              </button>
            </>
          )}
        </div>
      )}

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Aucun produit ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredProducts.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            const isDisabled = !isSelected && selectedIds.length >= maxSelection;

            return (
              <Card
                key={product.id}
                className={`relative p-3 cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => {
                      // Radix passes boolean | "indeterminate"
                      if (checked === true) {
                        if (!isSelected) handleToggleProduct(product.id);
                      } else {
                        if (isSelected) handleToggleProduct(product.id);
                      }
                    }}
                    className="mt-1"
                  />

                  
                  <div className="flex-1 min-w-0">
                    {product.image_url && (
                      <div className="w-full h-24 mb-2 rounded overflow-hidden bg-muted">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <Label className="text-sm font-medium leading-tight cursor-pointer">
                        {product.name}
                      </Label>
                      
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      {product.cost_price && (
                        <p className="text-xs font-medium text-primary">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(product.cost_price)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Selection limit warning */}
      {selectedIds.length >= maxSelection && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
          ⚠️ Limite de sélection atteinte ({maxSelection} produits maximum)
        </div>
      )}
    </div>
  );
}

// Made with Bob
