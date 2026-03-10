import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '../../../api/masterdata.api';
import { useMemo } from 'react';

export function useBrands() {
  const queryClient = useQueryClient();

  const { data: brands = [], isLoading, error, refetch } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getAll(),
  });

  const stats = useMemo(() => {
    const total = brands.length;
    const withLogo = brands.filter(b => b.logo).length;
    const totalProducts = brands.reduce((sum, b) => sum + (b._count?.productTemplates || 0), 0);

    return { total, withLogo, totalProducts };
  }, [brands]);

  const createMutation = useMutation({
    mutationFn: brandsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => brandsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: brandsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  return {
    brands,
    isLoading,
    error,
    stats,
    refetch,
    createBrand: createMutation.mutate,
    updateBrand: updateMutation.mutate,
    deleteBrand: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
