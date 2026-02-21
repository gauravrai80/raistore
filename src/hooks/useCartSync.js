import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
export function useCartSync() {
    const syncCart = useCartStore(state => state.syncCart);
    useEffect(() => {
        syncCart();
        const handleVisibility = () => {
            if (document.visibilityState === 'visible')
                syncCart();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [syncCart]);
}
