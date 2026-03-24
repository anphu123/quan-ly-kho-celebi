import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../../api/masterdata.api';
import { useMemo } from 'react';

export function useCategories() {
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const stats = useMemo(() => {
    const total = categories.length;
    const electronics = categories.filter(c => c.productType === 'ELECTRONICS').length;
    const accessories = categories.filter(c => c.productType === 'ACCESSORIES').length;
    const services = categories.filter(c => c.productType === 'SERVICES').length;

    return { total, electronics, accessories, services };
  }, [categories]);

  return {
    categories,
    isLoading,
    error,
    stats,
    refetch,
  };
}
