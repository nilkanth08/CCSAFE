import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = (WrappedComponent: any) => {
  const Wrapper = (props: any) => {
    const [user, loading] = useAuthState(auth as any);
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
