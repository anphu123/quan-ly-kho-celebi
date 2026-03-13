import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../../api/masterdata.api';
import { useMemo } from 'react';

export function useCategories() {
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const stats = useMemo(() => {
    const total = categories.length;
    const electronics = categories.filter(c => c.productType === 'ELECTRONICS').length;
    const applianceLarge = categories.filter(c => c.productType === 'APPLIANCE_LARGE').length;
    const applianceSmall = categories.filter(c => c.productType === 'APPLIANCE_SMALL').length;
    const computer = categories.filter(c => c.productType === 'COMPUTER').length;
    const accessory = categories.filter(c => c.productType === 'ACCESSORY').length;

    return { total, electronics, applianceLarge, applianceSmall, computer, accessory };
  }, [categories]);

  return {
    categories,
    isLoading,
    error,
    stats,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
