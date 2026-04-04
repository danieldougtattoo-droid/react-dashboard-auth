import { Navigate } from 'react-router-dom';
import { hasStoredAccessToken } from '../api/api';

export default function ProtectedRoute({ children }) {
    if (!hasStoredAccessToken()) {
        return <Navigate to="/" replace />;
    }
    return children;
}
